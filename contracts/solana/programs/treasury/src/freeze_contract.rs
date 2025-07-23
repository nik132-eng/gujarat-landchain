use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, FreezeAccount, ThawAccount};
use crate::LandParcel;

// TODO: FUTURE FIX - Address Anchor framework warnings:
// 1. Update solana_program dependency to resolve cfg warnings
// 2. Remove unused Transfer import (already done)
// 3. Consider updating Anchor framework version for better compatibility

declare_id!("ULPinTreasury111111111111111111111111111111");
#[program]
pub mod ulpin_freeze {
    use super::*;

    pub fn initialize_freeze_authority(
        ctx: Context<InitializeFreezeAuthority>,
        freeze_authority_bump: u8,
    ) -> Result<()> {
        let freeze_authority = &mut ctx.accounts.freeze_authority;
        freeze_authority.authority = ctx.accounts.authority.key();
        freeze_authority.freeze_authority_bump = freeze_authority_bump;
        Ok(())
    }

    pub fn freeze_land_nft(
        ctx: Context<FreezeLandNFT>,
        duration_seconds: i64,
    ) -> Result<()> {
        let land_parcel = &mut ctx.accounts.land_parcel;
        require!(land_parcel.is_verified, ErrorCode::LandNotVerified);
        require!(land_parcel.nft_minted, ErrorCode::NFTNotMinted);

        let clock = Clock::get()?;
        land_parcel.freeze_start_timestamp = Some(clock.unix_timestamp);
        land_parcel.freeze_duration = Some(duration_seconds);

        let cpi_accounts = FreezeAccount {
            account: ctx.accounts.user_token_account.to_account_info(),
            mint: ctx.accounts.nft_mint.to_account_info(),
            authority: ctx.accounts.freeze_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds = &[
            b"freeze_authority".as_ref(),
            &[ctx.accounts.freeze_authority.freeze_authority_bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::freeze_account(cpi_ctx)?;

        // Convert ulpin_id from [u8; 64] to String for event emission
        let ulpin_id_string = String::from_utf8_lossy(&land_parcel.ulpin_id).trim_matches('\0').to_string();
        
        emit!(NFTFrozen {
            ulpin_id: ulpin_id_string,
            nft_mint: ctx.accounts.nft_mint.key(),
            freeze_duration: duration_seconds,
        });

        Ok(())
    }

    pub fn thaw_land_nft(ctx: Context<ThawLandNFT>) -> Result<()> {
        let land_parcel = &mut ctx.accounts.land_parcel;
        require!(land_parcel.is_verified, ErrorCode::LandNotVerified);
        require!(land_parcel.nft_minted, ErrorCode::NFTNotMinted);

        let clock = Clock::get()?;
        let freeze_start = land_parcel.freeze_start_timestamp.unwrap_or(0);
        let freeze_duration = land_parcel.freeze_duration.unwrap_or(0);

        require!(
            clock.unix_timestamp > freeze_start + freeze_duration,
            ErrorCode::FreezePeriodNotExpired
        );

        let cpi_accounts = ThawAccount {
            account: ctx.accounts.user_token_account.to_account_info(),
            mint: ctx.accounts.nft_mint.to_account_info(),
            authority: ctx.accounts.freeze_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds = &[
            b"freeze_authority".as_ref(),
            &[ctx.accounts.freeze_authority.freeze_authority_bump],
        ];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::thaw_account(cpi_ctx)?;

        land_parcel.freeze_start_timestamp = None;
        land_parcel.freeze_duration = None;

        // Convert ulpin_id from [u8; 64] to String for event emission
        let ulpin_id_string = String::from_utf8_lossy(&land_parcel.ulpin_id).trim_matches('\0').to_string();
        
        emit!(NFTThawed {
            ulpin_id: ulpin_id_string,
            nft_mint: ctx.accounts.nft_mint.key(),
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeFreezeAuthority<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1,
        seeds = [b"freeze_authority"],
        bump
    )]
    pub freeze_authority: Account<'info, FreezeAuthorityPDA>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FreezeLandNFT<'info> {
    #[account(mut)]
    pub land_parcel: Account<'info, LandParcel>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    pub freeze_authority: Account<'info, FreezeAuthorityPDA>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ThawLandNFT<'info> {
    #[account(mut)]
    pub land_parcel: Account<'info, LandParcel>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub nft_mint: Account<'info, Mint>,
    pub freeze_authority: Account<'info, FreezeAuthorityPDA>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct FreezeAuthorityPDA {
    pub authority: Pubkey,
    pub freeze_authority_bump: u8,
}



#[event]
pub struct NFTFrozen {
    pub ulpin_id: String,
    pub nft_mint: Pubkey,
    pub freeze_duration: i64,
}

#[event]
pub struct NFTThawed {
    pub ulpin_id: String,
    pub nft_mint: Pubkey,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Land parcel must be verified before freezing")]
    LandNotVerified,
    #[msg("NFT must be minted before freezing")]
    NFTNotMinted,
    #[msg("Freeze period has not expired yet")]
    FreezePeriodNotExpired,
}
