import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'

// Solana configuration
const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
const SOLANA_RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com'

// Program IDs
const ULPIN_TREASURY_PROGRAM_ID = new PublicKey('ULPinTreasury111111111111111111111111111111')
const ULPIN_FREEZE_PROGRAM_ID = new PublicKey('ULPinFreeze111111111111111111111111111111')

// Initialize Solana connection
export const connection = new Connection(SOLANA_RPC_URL, 'confirmed')

export interface LandParcel {
  ulpin: string
  area: number
  district: string
  taluka: string
  village: string
  owner: PublicKey
  registrationTimestamp: number
  isVerified: boolean
  nftMinted: boolean
  freezeStartTimestamp?: number
  freezeDuration?: number
}

export interface PropertyNFT {
  mint: PublicKey
  owner: PublicKey
  metadata: {
    name: string
    symbol: string
    uri: string
  }
  ulpin: string
}

export class SolanaLandRegistry {
  private connection: Connection

  constructor(rpcUrl?: string) {
    this.connection = new Connection(rpcUrl || SOLANA_RPC_URL, 'confirmed')
  }

  /**
   * Get land parcel data from Solana program
   */
  async getLandParcel(ulpin: string): Promise<LandParcel | null> {
    try {
      // Derive PDA for land parcel
      const [landParcelPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('land_parcel'), Buffer.from(ulpin)],
        ULPIN_TREASURY_PROGRAM_ID
      )

      // Fetch account data
      const accountInfo = await this.connection.getAccountInfo(landParcelPDA)
      
      if (!accountInfo) {
        return null
      }

      // Parse account data (simplified - would need proper deserialization)
      return this.parseLandParcelAccount(accountInfo.data, ulpin)
    } catch (error) {
      console.error('Error fetching land parcel:', error)
      return null
    }
  }

  /**
   * Register a new land parcel
   */
  async registerLandParcel(
    ulpin: string,
    area: number,
    district: string,
    taluka: string,
    village: string,
    owner: PublicKey,
    payer: PublicKey
  ): Promise<string> {
    try {
      // Derive PDAs
      const [landParcelPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('land_parcel'), Buffer.from(ulpin)],
        ULPIN_TREASURY_PROGRAM_ID
      )

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        ULPIN_TREASURY_PROGRAM_ID
      )

      // Create transaction
      const transaction = new Transaction()

      // Add register land parcel instruction
      const registerInstruction = {
        programId: ULPIN_TREASURY_PROGRAM_ID,
        keys: [
          { pubkey: landParcelPDA, isSigner: false, isWritable: true },
          { pubkey: treasuryPDA, isSigner: false, isWritable: true },
          { pubkey: payer, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([
          1, // Instruction index for register_land_parcel
          ...Buffer.from(ulpin),
          ...new Uint8Array(new Float64Array([area]).buffer),
          ...Buffer.from(district),
          ...Buffer.from(taluka),
          ...Buffer.from(village),
          ...owner.toBytes()
        ])
      }

      transaction.add(registerInstruction)

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [])
      return signature
    } catch (error) {
      console.error('Error registering land parcel:', error)
      throw error
    }
  }

  /**
   * Mint NFT for land parcel
   */
  async mintLandNFT(
    ulpin: string,
    metadataUri: string,
    owner: PublicKey,
    payer: PublicKey
  ): Promise<PropertyNFT> {
    try {
      // Derive PDAs
      const [landParcelPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('land_parcel'), Buffer.from(ulpin)],
        ULPIN_TREASURY_PROGRAM_ID
      )

      const [treasuryPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('treasury')],
        ULPIN_TREASURY_PROGRAM_ID
      )

      // Create mint account
      const mint = new PublicKey() // Generate new keypair
      const mintAta = await getAssociatedTokenAddress(mint, owner)

      // Create transaction
      const transaction = new Transaction()

      // Add mint NFT instruction
      const mintInstruction = {
        programId: ULPIN_TREASURY_PROGRAM_ID,
        keys: [
          { pubkey: landParcelPDA, isSigner: false, isWritable: true },
          { pubkey: treasuryPDA, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: true },
          { pubkey: mintAta, isSigner: false, isWritable: true },
          { pubkey: owner, isSigner: true, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([
          2, // Instruction index for mint_land_nft
          ...Buffer.from(ulpin),
          ...Buffer.from(metadataUri)
        ])
      }

      transaction.add(mintInstruction)

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [])
      
      return {
        mint,
        owner,
        metadata: {
          name: `ULPIN ${ulpin}`,
          symbol: 'ULPIN',
          uri: metadataUri
        },
        ulpin
      }
    } catch (error) {
      console.error('Error minting land NFT:', error)
      throw error
    }
  }

  /**
   * Freeze land NFT for transfer
   */
  async freezeLandNFT(
    ulpin: string,
    durationSeconds: number,
    owner: PublicKey
  ): Promise<string> {
    try {
      // Derive PDAs
      const [landParcelPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('land_parcel'), Buffer.from(ulpin)],
        ULPIN_TREASURY_PROGRAM_ID
      )

      const [freezeAuthorityPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('freeze_authority')],
        ULPIN_FREEZE_PROGRAM_ID
      )

      // Create transaction
      const transaction = new Transaction()

      // Add freeze instruction
      const freezeInstruction = {
        programId: ULPIN_FREEZE_PROGRAM_ID,
        keys: [
          { pubkey: landParcelPDA, isSigner: false, isWritable: true },
          { pubkey: freezeAuthorityPDA, isSigner: false, isWritable: false }
        ],
        data: Buffer.from([
          1, // Instruction index for freeze_land_nft
          ...new Uint8Array(new Int64Array([durationSeconds]).buffer)
        ])
      }

      transaction.add(freezeInstruction)

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [])
      return signature
    } catch (error) {
      console.error('Error freezing land NFT:', error)
      throw error
    }
  }

  /**
   * Get account balance
   */
  async getBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey)
      return balance / LAMPORTS_PER_SOL
    } catch (error) {
      console.error('Error getting balance:', error)
      return 0
    }
  }

  /**
   * Parse land parcel account data
   */
  private parseLandParcelAccount(data: Buffer, ulpin: string): LandParcel {
    // Simplified parsing - would need proper deserialization based on Anchor schema
    return {
      ulpin,
      area: 0, // Parse from data
      district: '', // Parse from data
      taluka: '', // Parse from data
      village: '', // Parse from data
      owner: new PublicKey(data.slice(32, 64)), // Parse owner from data
      registrationTimestamp: 0, // Parse from data
      isVerified: false, // Parse from data
      nftMinted: false // Parse from data
    }
  }
}

// Export singleton instance
export const solanaLandRegistry = new SolanaLandRegistry() 