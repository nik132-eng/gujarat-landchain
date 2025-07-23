import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { UlpinTreasury } from "../target/types/ulpin_treasury";
import { expect } from "chai";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint, createAccount, mintTo } from "@solana/spl-token";

describe("ulpin-treasury", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.UlpinTreasury as Program<UlpinTreasury>;
  const provider = anchor.getProvider();
  const connection = provider.connection;

  let treasuryPDA: PublicKey;
  let treasuryBump: number;
  let treasuryTokenAccount: PublicKey;
  let mint: PublicKey;
  let userTokenAccount: PublicKey;

  before(async () => {
    // Derive treasury PDA
    [treasuryPDA, treasuryBump] = await PublicKey.findProgramAddress(
      [Buffer.from("treasury")],
      program.programId
    );

    // Create mint and token accounts for testing
    mint = await createMint(connection, provider.wallet.payer, provider.wallet.publicKey, null, 9);
    
    userTokenAccount = await createAccount(connection, provider.wallet.payer, mint, provider.wallet.publicKey);
    treasuryTokenAccount = await createAccount(connection, provider.wallet.payer, mint, treasuryPDA, true);

    // Mint some tokens to user
    await mintTo(connection, provider.wallet.payer, mint, userTokenAccount, provider.wallet.payer, 1000000000);
  });

  it("Initializes treasury", async () => {
    await program.methods
      .initializeTreasury(treasuryBump)
      .accounts({
        treasury: treasuryPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const treasury = await program.account.treasury.fetch(treasuryPDA);
    expect(treasury.authority.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(treasury.totalFeesCollected.toNumber()).to.equal(0);
    expect(treasury.landParcelCount.toNumber()).to.equal(0);
    expect(treasury.isActive).to.be.true;
  });

  it("Registers a land parcel", async () => {
    const ulpinId = "GJ12345678901234567890";
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    await program.methods
      .registerLandParcel(
        ulpinId,
        new anchor.BN(1000), // 1000 sqm
        "Ahmedabad",
        "City",
        "Village1",
        provider.wallet.publicKey
      )
      .accounts({
        landParcel: landParcelPDA,
        treasury: treasuryPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const landParcel = await program.account.landParcel.fetch(landParcelPDA);
    expect(landParcel.ulpinId).to.equal(ulpinId);
    expect(landParcel.areaSqm.toNumber()).to.equal(1000);
    expect(landParcel.district).to.equal("Ahmedabad");
    expect(landParcel.owner.toString()).to.equal(provider.wallet.publicKey.toString());
    expect(landParcel.isVerified).to.be.false;
    expect(landParcel.nftMinted).to.be.false;

    const treasury = await program.account.treasury.fetch(treasuryPDA);
    expect(treasury.landParcelCount.toNumber()).to.equal(1);
  });

  it("Verifies a land parcel", async () => {
    const ulpinId = "GJ12345678901234567890";
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    await program.methods
      .verifyLandParcel(ulpinId)
      .accounts({
        landParcel: landParcelPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const landParcel = await program.account.landParcel.fetch(landParcelPDA);
    expect(landParcel.isVerified).to.be.true;
  });

  it("Mints NFT for verified land parcel", async () => {
    const ulpinId = "GJ12345678901234567890";
    const metadataUri = "https://ipfs.io/ipfs/QmTest123456789";
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    const treasuryBefore = await program.account.treasury.fetch(treasuryPDA);
    const initialFees = treasuryBefore.totalFeesCollected.toNumber();

    await program.methods
      .mintLandNft(ulpinId, metadataUri)
      .accounts({
        landParcel: landParcelPDA,
        treasury: treasuryPDA,
        nftMint: mint,
        userTokenAccount: userTokenAccount,
        treasuryTokenAccount: treasuryTokenAccount,
        user: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const landParcel = await program.account.landParcel.fetch(landParcelPDA);
    expect(landParcel.nftMinted).to.be.true;

    const treasuryAfter = await program.account.treasury.fetch(treasuryPDA);
    const expectedFee = 100000 + (1000 * 10); // base_fee + area_fee
    expect(treasuryAfter.totalFeesCollected.toNumber()).to.equal(initialFees + expectedFee);
  });

  it("Updates land ownership", async () => {
    const ulpinId = "GJ12345678901234567890";
    const newOwner = anchor.web3.Keypair.generate().publicKey;
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    await program.methods
      .updateLandOwnership(ulpinId, newOwner)
      .accounts({
        landParcel: landParcelPDA,
        authority: provider.wallet.publicKey,
      })
      .rpc();

    const landParcel = await program.account.landParcel.fetch(landParcelPDA);
    expect(landParcel.owner.toString()).to.equal(newOwner.toString());
  });

  it("Fails to register duplicate ULPIN ID", async () => {
    const ulpinId = "GJ12345678901234567890"; // Same as before
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    try {
      await program.methods
        .registerLandParcel(
          ulpinId,
          new anchor.BN(500),
          "Surat",
          "District",
          "Village2",
          provider.wallet.publicKey
        )
        .accounts({
          landParcel: landParcelPDA,
          treasury: treasuryPDA,
          authority: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have failed with duplicate ULPIN");
    } catch (error) {
      expect(error.message).to.include("already in use");
    }
  });

  it("Fails to mint NFT for unverified land", async () => {
    const ulpinId = "GJ98765432109876543210";
    
    const [landParcelPDA] = await PublicKey.findProgramAddress(
      [Buffer.from("land_parcel"), Buffer.from(ulpinId)],
      program.programId
    );

    // Register but don't verify
    await program.methods
      .registerLandParcel(
        ulpinId,
        new anchor.BN(500),
        "Vadodara",
        "District",
        "Village3",
        provider.wallet.publicKey
      )
      .accounts({
        landParcel: landParcelPDA,
        treasury: treasuryPDA,
        authority: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    try {
      await program.methods
        .mintLandNft(ulpinId, "https://ipfs.io/ipfs/QmTest987654321")
        .accounts({
          landParcel: landParcelPDA,
          treasury: treasuryPDA,
          nftMint: mint,
          userTokenAccount: userTokenAccount,
          treasuryTokenAccount: treasuryTokenAccount,
          user: provider.wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have failed for unverified land");
    } catch (error) {
      expect(error.message).to.include("LandNotVerified");
    }
  });
});
