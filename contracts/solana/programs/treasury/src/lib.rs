use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, Transfer};
use mpl_token_metadata::state::Metadata;
pub mod ulpin_freeze;
use ulpin_freeze::*;

declare_id!("ULPinTreasury111111111111111111111111111111");

#[program]
pub mod ulpin_treasury {
    use super::*;

    pub fn initialize_treasury(
        ctx: Context<InitializeTreasury>,
        treasury_bump: u8,
    ) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.treasury_bump = treasury_bump;
        treasury.total_fees_collected = 0;
        treasury.land_parcel_count = 0;
        treasury.is_active = true;
        
        Ok(())
    }

    pub fn register_land_parcel(
        ctx: Context<RegisterLandParcel>,
        ulpin_id: String,
        area_sqm: u64,
        district: String,
        taluka: String,
        village: String,
        owner_pubkey: Pubkey,
    ) -> Result<()> {
        require!(ulpin_id.len() <= 64, ErrorCode::InvalidULPINLength);
        require!(area_sqm > 0, ErrorCode::InvalidArea);
        
        let land_parcel = &mut ctx.accounts.land_parcel;
        let treasury = &mut ctx.accounts.treasury;
        
        // Convert strings to fixed arrays
        let mut ulpin_bytes = [0u8; 64];
        let mut district_bytes = [0u8; 32];
        let mut taluka_bytes = [0u8; 32];
        let mut village_bytes = [0u8; 32];
        
        ulpin_bytes[..ulpin_id.len()].copy_from_slice(ulpin_id.as_bytes());
        district_bytes[..district.len()].copy_from_slice(district.as_bytes());
        taluka_bytes[..taluka.len()].copy_from_slice(taluka.as_bytes());
        village_bytes[..village.len()].copy_from_slice(village.as_bytes());
        
        land_parcel.ulpin_id = ulpin_bytes;
        land_parcel.area_sqm = area_sqm;
        land_parcel.district = district_bytes;
        land_parcel.taluka = taluka_bytes;
        land_parcel.village = village_bytes;
        land_parcel.owner = owner_pubkey;
        land_parcel.registration_timestamp = Clock::get()?.unix_timestamp;
        land_parcel.is_verified = false;
        land_parcel.nft_minted = false;
        
        treasury.land_parcel_count += 1;
        
        emit!(LandParcelRegistered {
            ulpin_id,
            owner: land_parcel.owner,
            area_sqm: land_parcel.area_sqm,
            registration_timestamp: land_parcel.registration_timestamp,
        });
        
        Ok(())
    }

    pub fn mint_land_nft(
        ctx: Context<MintLandNFT>,
        ulpin_id: String,
        metadata_uri: String,
    ) -> Result<()> {
        require!(metadata_uri.len() <= 200, ErrorCode::InvalidMetadataURI);
        
        let land_parcel = &mut ctx.accounts.land_parcel;
        let treasury = &mut ctx.accounts.treasury;
        
        require!(!land_parcel.nft_minted, ErrorCode::NFTAlreadyMinted);
        require!(land_parcel.is_verified, ErrorCode::LandNotVerified);
        
        // Calculate fees based on area
        let base_fee = 100_000; // 0.0001 SOL in lamports
        let area_fee = (land_parcel.area_sqm as u64) * 10; // 10 lamports per sqm
        let total_fee = base_fee + area_fee;
        
        // Transfer fees to treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_fee)?;
        
        land_parcel.nft_minted = true;
        treasury.total_fees_collected += total_fee;
        
        emit!(NFTMinted {
            ulpin_id: ulpin_id.clone(),
            owner: land_parcel.owner,
            nft_mint: ctx.accounts.nft_mint.key(),
            metadata_uri,
            fee_paid: total_fee,
        });
        
        Ok(())
    }

    pub fn verify_land_parcel(
        ctx: Context<VerifyLandParcel>,
        ulpin_id: String,
    ) -> Result<()> {
        let land_parcel = &mut ctx.accounts.land_parcel;
        
        require!(!land_parcel.is_verified, ErrorCode::AlreadyVerified);
        
        land_parcel.is_verified = true;
        
        emit!(LandParcelVerified {
            ulpin_id: ulpin_id.clone(),
            verifier: ctx.accounts.authority.key(),
            verification_timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    pub fn update_land_ownership(
        ctx: Context<UpdateLandOwnership>,
        ulpin_id: String,
        new_owner: Pubkey,
    ) -> Result<()> {
        let land_parcel = &mut ctx.accounts.land_parcel;
        
        require!(land_parcel.is_verified, ErrorCode::LandNotVerified);
        require!(land_parcel.nft_minted, ErrorCode::NFTNotMinted);
        
        land_parcel.owner = new_owner;
        
        emit!(OwnershipTransferred {
            ulpin_id: ulpin_id.clone(),
            previous_owner: land_parcel.owner,
            new_owner,
            transfer_timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 8 + 1 + 32,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterLandParcel<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 64 + 8 + 32 + 32 + 32 + 32 + 8 + 1 + 1 + 32,
        seeds = [b"land_parcel", &ulpin_id.as_bytes()[..32]],
        bump
    )]
    pub land_parcel: Account<'info, LandParcel>,
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintLandNFT<'info> {
    #[account(mut)]
    pub land_parcel: Account<'info, LandParcel>,
    #[account(mut)]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyLandParcel<'info> {
    #[account(mut)]
    pub land_parcel: Account<'info, LandParcel>,
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateLandOwnership<'info> {
    #[account(mut)]
    pub land_parcel: Account<'info, LandParcel>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub treasury_bump: u8,
    pub total_fees_collected: u64,
    pub land_parcel_count: u64,
    pub is_active: bool,
}

#[account]
pub struct LandParcel {
    pub ulpin_id: [u8; 64],
    pub area_sqm: u64,
    pub district: [u8; 32],
    pub taluka: [u8; 32],
    pub village: [u8; 32],
    pub owner: Pubkey,
    pub registration_timestamp: i64,
    pub is_verified: bool,
    pub nft_minted: bool,
    pub freeze_start_timestamp: Option<i64>,
    pub freeze_duration: Option<i64>,
}

#[event]
pub struct LandParcelRegistered {
    pub ulpin_id: String,
    pub owner: Pubkey,
    pub area_sqm: u64,
    pub registration_timestamp: i64,
}

#[event]
pub struct NFTMinted {
    pub ulpin_id: String,
    pub owner: Pubkey,
    pub nft_mint: Pubkey,
    pub metadata_uri: String,
    pub fee_paid: u64,
}

#[event]
pub struct LandParcelVerified {
    pub ulpin_id: String,
    pub verifier: Pubkey,
    pub verification_timestamp: i64,
}

#[event]
pub struct OwnershipTransferred {
    pub ulpin_id: String,
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
    pub transfer_timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("ULPIN ID must be 64 characters or less")]
    InvalidULPINLength,
    #[msg("Land area must be greater than zero")]
    InvalidArea,
    #[msg("Metadata URI must be 200 characters or less")]
    InvalidMetadataURI,
    #[msg("NFT already minted for this land parcel")]
    NFTAlreadyMinted,
    #[msg("Land parcel must be verified before minting NFT")]
    LandNotVerified,
    #[msg("Land parcel already verified")]
    AlreadyVerified,
    #[msg("NFT must be minted before ownership transfer")]
    NFTNotMinted,
}
