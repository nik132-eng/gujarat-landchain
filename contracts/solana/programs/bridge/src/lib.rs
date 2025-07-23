use anchor_lang::prelude::*;

declare_id!("ULPinBridge111111111111111111111111111111");

#[program]
pub mod ulpin_bridge {
    use super::*;

    pub fn initialize_bridge(
        ctx: Context<InitializeBridge>,
        bridge_bump: u8,
    ) -> Result<()> {
        let bridge = &mut ctx.accounts.bridge;
        bridge.authority = ctx.accounts.authority.key();
        bridge.bridge_bump = bridge_bump;
        bridge.total_transfers = 0;
        bridge.is_active = true;
        
        Ok(())
    }

    pub fn cross_chain_transfer(
        ctx: Context<CrossChainTransfer>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        let bridge = &mut ctx.accounts.bridge;
        let transfer = &mut ctx.accounts.transfer;
        
        transfer.amount = amount;
        transfer.sender = ctx.accounts.sender.key();
        transfer.timestamp = Clock::get()?.unix_timestamp;
        transfer.status = TransferStatus::Pending;
        
        bridge.total_transfers += 1;
        
        emit!(CrossChainTransferInitiated {
            amount: transfer.amount,
            sender: transfer.sender,
            transfer_id: transfer.key(),
        });
        
        Ok(())
    }

    pub fn confirm_transfer(
        ctx: Context<ConfirmTransfer>,
    ) -> Result<()> {
        let transfer = &mut ctx.accounts.transfer;
        
        require!(transfer.status == TransferStatus::Pending, ErrorCode::TransferNotPending);
        
        transfer.status = TransferStatus::Completed;
        transfer.confirmation_timestamp = Clock::get()?.unix_timestamp;
        
        emit!(CrossChainTransferCompleted {
            transfer_id: transfer.key(),
            completion_timestamp: transfer.confirmation_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeBridge<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 1 + 8 + 1 + 32,
        seeds = [b"bridge"],
        bump
    )]
    pub bridge: Account<'info, Bridge>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CrossChainTransfer<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + 8 + 32 + 8 + 1 + 8 + 32,
        seeds = [b"transfer", sender.key().as_ref()],
        bump
    )]
    pub transfer: Account<'info, CrossChainTransferData>,
    #[account(mut)]
    pub bridge: Account<'info, Bridge>,
    #[account(mut)]
    pub sender: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmTransfer<'info> {
    #[account(mut)]
    pub transfer: Account<'info, CrossChainTransferData>,
    #[account(mut)]
    pub bridge: Account<'info, Bridge>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Bridge {
    pub authority: Pubkey,
    pub bridge_bump: u8,
    pub total_transfers: u64,
    pub is_active: bool,
}

#[account]
pub struct CrossChainTransferData {
    pub amount: u64,
    pub sender: Pubkey,
    pub timestamp: i64,
    pub status: TransferStatus,
    pub confirmation_timestamp: Option<i64>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TransferStatus {
    Pending,
    Completed,
    Failed,
}

#[event]
pub struct CrossChainTransferInitiated {
    pub amount: u64,
    pub sender: Pubkey,
    pub transfer_id: Pubkey,
}

#[event]
pub struct CrossChainTransferCompleted {
    pub transfer_id: Pubkey,
    pub completion_timestamp: i64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Transfer is not in pending status")]
    TransferNotPending,
} 