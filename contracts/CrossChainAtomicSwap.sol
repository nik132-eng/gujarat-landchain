// GL-0502: Stable-coin Swap Contract Implementation
// Sprint 5: Cross-Chain Treasury Bridge Development
// Gujarat LandChain × JuliaOS Project

/*
Atomic Swap Contract for Cross-Chain Treasury Operations
- Objective: Enable secure atomic swaps between Polygon USDC and Solana USDC
- Input: Cross-chain bridge messages from GL-0501
- Output: Guaranteed atomic swaps with slippage protection
- Integration: Connects validation payments with multi-chain treasury
*/

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CrossChainAtomicSwap
 * @dev Atomic swap contract for USDC between Polygon and Solana
 * @notice Enables secure cross-chain stable-coin swaps for Gujarat LandChain treasury operations
 */
contract CrossChainAtomicSwap is ReentrancyGuard, Pausable, AccessControl {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant SWAP_OPERATOR_ROLE = keccak256("SWAP_OPERATOR_ROLE");
    bytes32 public constant BRIDGE_RELAYER_ROLE = keccak256("BRIDGE_RELAYER_ROLE");
    bytes32 public constant TREASURY_MANAGER_ROLE = keccak256("TREASURY_MANAGER_ROLE");

    // Supported tokens
    IERC20 public immutable USDC_POLYGON;
    
    // Wormhole bridge integration
    address public immutable WORMHOLE_CORE_BRIDGE;
    uint16 public constant SOLANA_CHAIN_ID = 1;
    uint16 public constant POLYGON_CHAIN_ID = 5;

    // Swap configuration
    struct SwapConfig {
        uint256 minSwapAmount;          // Minimum swap amount in USDC (6 decimals)
        uint256 maxSwapAmount;          // Maximum swap amount in USDC (6 decimals)
        uint256 maxSlippageBps;         // Maximum slippage in basis points (1% = 100)
        uint256 swapFeeBps;             // Swap fee in basis points (0.1% = 10)
        uint256 timeoutDuration;        // Swap timeout duration in seconds
        bool    emergencyPauseEnabled;  // Emergency pause capability
    }

    SwapConfig public swapConfig;

    // Swap state management
    enum SwapStatus {
        INITIATED,      // Swap initiated on source chain
        LOCKED,         // Funds locked, waiting for cross-chain confirmation
        COMPLETED,      // Swap completed successfully
        REFUNDED,       // Swap refunded due to timeout or failure
        CANCELLED       // Swap cancelled by user
    }

    struct AtomicSwap {
        bytes32 swapId;                 // Unique swap identifier
        address initiator;              // Swap initiator address
        string  solanaRecipient;        // Solana recipient address
        uint256 polygonAmount;          // Amount locked on Polygon (USDC)
        uint256 solanaAmount;           // Expected amount on Solana (USDC)
        uint256 exchangeRate;           // Exchange rate (1e18 precision)
        uint256 initiationTime;         // Swap initiation timestamp
        uint256 timeoutTime;            // Swap timeout timestamp
        SwapStatus status;              // Current swap status
        bytes32 wormholeMessageHash;    // Wormhole message hash
        bool    refunded;               // Refund status
    }

    // Storage
    mapping(bytes32 => AtomicSwap) public atomicSwaps;
    mapping(address => bytes32[]) public userSwaps;
    mapping(bytes32 => bool) public processedMessages;

    // Performance tracking
    struct SwapMetrics {
        uint256 totalSwapsInitiated;
        uint256 totalSwapsCompleted;
        uint256 totalVolumeUSDC;
        uint256 totalFeesCollected;
        uint256 averageProcessingTime;
        uint256 successRate;            // In basis points (95% = 9500)
    }

    SwapMetrics public swapMetrics;

    // Events
    event SwapInitiated(
        bytes32 indexed swapId,
        address indexed initiator,
        string solanaRecipient,
        uint256 polygonAmount,
        uint256 solanaAmount,
        uint256 exchangeRate
    );

    event SwapCompleted(
        bytes32 indexed swapId,
        address indexed initiator,
        uint256 completionTime,
        bytes32 wormholeMessageHash
    );

    event SwapRefunded(
        bytes32 indexed swapId,
        address indexed initiator,
        uint256 refundAmount,
        string reason
    );

    event SwapCancelled(
        bytes32 indexed swapId,
        address indexed initiator,
        uint256 refundAmount
    );

    event ConfigurationUpdated(
        uint256 minSwapAmount,
        uint256 maxSwapAmount,
        uint256 maxSlippageBps,
        uint256 swapFeeBps,
        uint256 timeoutDuration
    );

    event CrossChainMessageReceived(
        bytes32 indexed messageHash,
        uint16 sourceChain,
        bytes payload
    );

    /**
     * @dev Constructor initializes the atomic swap contract
     * @param _usdcPolygon USDC token contract address on Polygon
     * @param _wormholeCorebridge Wormhole core bridge contract address
     * @param _admin Admin address for role management
     */
    constructor(
        address _usdcPolygon,
        address _wormholeCorebridge,
        address _admin
    ) {
        require(_usdcPolygon != address(0), "Invalid USDC address");
        require(_wormholeCorebridge != address(0), "Invalid Wormhole bridge address");
        require(_admin != address(0), "Invalid admin address");

        USDC_POLYGON = IERC20(_usdcPolygon);
        WORMHOLE_CORE_BRIDGE = _wormholeCorebridge;

        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(SWAP_OPERATOR_ROLE, _admin);
        _grantRole(BRIDGE_RELAYER_ROLE, _admin);
        _grantRole(TREASURY_MANAGER_ROLE, _admin);

        // Initialize swap configuration
        swapConfig = SwapConfig({
            minSwapAmount: 10 * 1e6,        // $10 USDC minimum
            maxSwapAmount: 100000 * 1e6,    // $100,000 USDC maximum
            maxSlippageBps: 300,            // 3% maximum slippage
            swapFeeBps: 10,                 // 0.1% swap fee
            timeoutDuration: 1800,          // 30 minutes timeout
            emergencyPauseEnabled: true
        });
    }

    /**
     * @dev Initiate atomic swap from Polygon to Solana
     * @param solanaRecipient Solana wallet address to receive USDC
     * @param polygonAmount Amount of USDC to swap from Polygon
     * @param minSolanaAmount Minimum amount of USDC expected on Solana (slippage protection)
     * @return swapId Unique identifier for the swap
     */
    function initiateSwap(
        string calldata solanaRecipient,
        uint256 polygonAmount,
        uint256 minSolanaAmount
    ) external nonReentrant whenNotPaused returns (bytes32 swapId) {
        require(bytes(solanaRecipient).length > 0, "Invalid Solana recipient");
        require(polygonAmount >= swapConfig.minSwapAmount, "Amount below minimum");
        require(polygonAmount <= swapConfig.maxSwapAmount, "Amount exceeds maximum");
        require(minSolanaAmount > 0, "Invalid minimum Solana amount");

        // Calculate exchange rate and expected Solana amount
        uint256 exchangeRate = getExchangeRate();
        uint256 swapFee = (polygonAmount * swapConfig.swapFeeBps) / 10000;
        uint256 netPolygonAmount = polygonAmount - swapFee;
        uint256 expectedSolanaAmount = (netPolygonAmount * exchangeRate) / 1e18;

        // Validate slippage protection
        require(expectedSolanaAmount >= minSolanaAmount, "Slippage exceeds tolerance");

        // Calculate slippage percentage
        uint256 slippageBps = ((netPolygonAmount - minSolanaAmount) * 10000) / netPolygonAmount;
        require(slippageBps <= swapConfig.maxSlippageBps, "Slippage exceeds maximum");

        // Generate unique swap ID
        swapId = keccak256(abi.encodePacked(
            msg.sender,
            solanaRecipient,
            polygonAmount,
            block.timestamp,
            block.number
        ));

        require(atomicSwaps[swapId].swapId == bytes32(0), "Swap ID collision");

        // Transfer USDC from user to contract
        USDC_POLYGON.safeTransferFrom(msg.sender, address(this), polygonAmount);

        // Create atomic swap record
        atomicSwaps[swapId] = AtomicSwap({
            swapId: swapId,
            initiator: msg.sender,
            solanaRecipient: solanaRecipient,
            polygonAmount: polygonAmount,
            solanaAmount: expectedSolanaAmount,
            exchangeRate: exchangeRate,
            initiationTime: block.timestamp,
            timeoutTime: block.timestamp + swapConfig.timeoutDuration,
            status: SwapStatus.INITIATED,
            wormholeMessageHash: bytes32(0),
            refunded: false
        });

        // Track user swaps
        userSwaps[msg.sender].push(swapId);

        // Update metrics
        swapMetrics.totalSwapsInitiated += 1;
        swapMetrics.totalVolumeUSDC += polygonAmount;
        swapMetrics.totalFeesCollected += swapFee;

        emit SwapInitiated(
            swapId,
            msg.sender,
            solanaRecipient,
            polygonAmount,
            expectedSolanaAmount,
            exchangeRate
        );

        // Send cross-chain message via Wormhole
        _sendCrossChainMessage(swapId);

        return swapId;
    }

    /**
     * @dev Complete atomic swap (called by bridge relayer)
     * @param swapId Unique swap identifier
     * @param wormholeMessageHash Wormhole message hash for verification
     */
    function completeSwap(
        bytes32 swapId,
        bytes32 wormholeMessageHash
    ) external onlyRole(BRIDGE_RELAYER_ROLE) nonReentrant {
        AtomicSwap storage swap = atomicSwaps[swapId];
        
        require(swap.swapId != bytes32(0), "Swap does not exist");
        require(swap.status == SwapStatus.INITIATED, "Invalid swap status");
        require(block.timestamp <= swap.timeoutTime, "Swap has timed out");
        require(!processedMessages[wormholeMessageHash], "Message already processed");

        // Mark message as processed
        processedMessages[wormholeMessageHash] = true;

        // Update swap status
        swap.status = SwapStatus.COMPLETED;
        swap.wormholeMessageHash = wormholeMessageHash;

        // Update metrics
        swapMetrics.totalSwapsCompleted += 1;
        uint256 processingTime = block.timestamp - swap.initiationTime;
        swapMetrics.averageProcessingTime = 
            (swapMetrics.averageProcessingTime + processingTime) / 2;
        
        // Calculate success rate
        swapMetrics.successRate = 
            (swapMetrics.totalSwapsCompleted * 10000) / swapMetrics.totalSwapsInitiated;

        emit SwapCompleted(swapId, swap.initiator, block.timestamp, wormholeMessageHash);
    }

    /**
     * @dev Refund timed-out or failed swap
     * @param swapId Unique swap identifier
     */
    function refundSwap(bytes32 swapId) external nonReentrant {
        AtomicSwap storage swap = atomicSwaps[swapId];
        
        require(swap.swapId != bytes32(0), "Swap does not exist");
        require(swap.initiator == msg.sender, "Not swap initiator");
        require(swap.status == SwapStatus.INITIATED, "Invalid swap status");
        require(block.timestamp > swap.timeoutTime, "Swap has not timed out");
        require(!swap.refunded, "Already refunded");

        // Update swap status
        swap.status = SwapStatus.REFUNDED;
        swap.refunded = true;

        // Calculate refund amount (full amount since swap failed)
        uint256 refundAmount = swap.polygonAmount;

        // Transfer USDC back to initiator
        USDC_POLYGON.safeTransfer(swap.initiator, refundAmount);

        emit SwapRefunded(swapId, swap.initiator, refundAmount, "Timeout");
    }

    /**
     * @dev Cancel swap before timeout (with fee penalty)
     * @param swapId Unique swap identifier
     */
    function cancelSwap(bytes32 swapId) external nonReentrant {
        AtomicSwap storage swap = atomicSwaps[swapId];
        
        require(swap.swapId != bytes32(0), "Swap does not exist");
        require(swap.initiator == msg.sender, "Not swap initiator");
        require(swap.status == SwapStatus.INITIATED, "Invalid swap status");
        require(block.timestamp <= swap.timeoutTime, "Use refundSwap for timed-out swaps");
        require(!swap.refunded, "Already refunded");

        // Update swap status
        swap.status = SwapStatus.CANCELLED;
        swap.refunded = true;

        // Calculate refund amount (with cancellation fee)
        uint256 cancellationFee = (swap.polygonAmount * 50) / 10000; // 0.5% cancellation fee
        uint256 refundAmount = swap.polygonAmount - cancellationFee;

        // Transfer USDC back to initiator (minus cancellation fee)
        USDC_POLYGON.safeTransfer(swap.initiator, refundAmount);

        // Track cancellation fee
        swapMetrics.totalFeesCollected += cancellationFee;

        emit SwapCancelled(swapId, swap.initiator, refundAmount);
    }

    /**
     * @dev Get current exchange rate (Polygon USDC to Solana USDC)
     * @return exchangeRate Current exchange rate with 1e18 precision
     */
    function getExchangeRate() public view returns (uint256 exchangeRate) {
        // For stable-coin swaps, rate should be close to 1:1
        // Small variations account for bridge fees and liquidity
        // In production, this would integrate with price oracles
        
        uint256 baseRate = 1e18; // 1:1 base rate
        
        // Add small variations based on network conditions
        // This simulates real-world bridge dynamics
        uint256 variation = (block.timestamp % 100) * 1e14; // ±0.01% variation
        
        if ((block.timestamp / 100) % 2 == 0) {
            exchangeRate = baseRate + variation;
        } else {
            exchangeRate = baseRate - variation;
        }
        
        // Ensure rate stays within reasonable bounds (±1%)
        uint256 minRate = 99e16; // 0.99
        uint256 maxRate = 101e16; // 1.01
        
        if (exchangeRate < minRate) exchangeRate = minRate;
        if (exchangeRate > maxRate) exchangeRate = maxRate;
        
        return exchangeRate;
    }

    /**
     * @dev Send cross-chain message via Wormhole
     * @param swapId Unique swap identifier
     */
    function _sendCrossChainMessage(bytes32 swapId) internal {
        AtomicSwap storage swap = atomicSwaps[swapId];
        
        // Prepare cross-chain message payload
        bytes memory payload = abi.encode(
            swapId,
            swap.initiator,
            swap.solanaRecipient,
            swap.solanaAmount,
            swap.exchangeRate,
            block.timestamp
        );

        // In production, this would call Wormhole's publishMessage
        // For testing, we simulate the message sending
        bytes32 messageHash = keccak256(abi.encodePacked(
            POLYGON_CHAIN_ID,
            SOLANA_CHAIN_ID,
            payload,
            block.timestamp
        ));

        emit CrossChainMessageReceived(messageHash, POLYGON_CHAIN_ID, payload);
    }

    /**
     * @dev Update swap configuration (admin only)
     */
    function updateSwapConfig(
        uint256 _minSwapAmount,
        uint256 _maxSwapAmount,
        uint256 _maxSlippageBps,
        uint256 _swapFeeBps,
        uint256 _timeoutDuration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_minSwapAmount > 0, "Invalid minimum amount");
        require(_maxSwapAmount > _minSwapAmount, "Invalid maximum amount");
        require(_maxSlippageBps <= 1000, "Slippage too high"); // Max 10%
        require(_swapFeeBps <= 100, "Fee too high"); // Max 1%
        require(_timeoutDuration >= 300, "Timeout too short"); // Min 5 minutes

        swapConfig.minSwapAmount = _minSwapAmount;
        swapConfig.maxSwapAmount = _maxSwapAmount;
        swapConfig.maxSlippageBps = _maxSlippageBps;
        swapConfig.swapFeeBps = _swapFeeBps;
        swapConfig.timeoutDuration = _timeoutDuration;

        emit ConfigurationUpdated(
            _minSwapAmount,
            _maxSwapAmount,
            _maxSlippageBps,
            _swapFeeBps,
            _timeoutDuration
        );
    }

    /**
     * @dev Emergency pause (admin only)
     */
    function emergencyPause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(swapConfig.emergencyPauseEnabled, "Emergency pause disabled");
        _pause();
    }

    /**
     * @dev Resume operations (admin only)
     */
    function resumeOperations() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Withdraw collected fees (treasury manager only)
     * @param recipient Fee recipient address
     * @param amount Amount to withdraw
     */
    function withdrawFees(
        address recipient,
        uint256 amount
    ) external onlyRole(TREASURY_MANAGER_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        uint256 contractBalance = USDC_POLYGON.balanceOf(address(this));
        require(amount <= contractBalance, "Insufficient balance");

        USDC_POLYGON.safeTransfer(recipient, amount);
    }

    /**
     * @dev Get swap details
     * @param swapId Unique swap identifier
     * @return swap Atomic swap details
     */
    function getSwapDetails(bytes32 swapId) external view returns (AtomicSwap memory swap) {
        return atomicSwaps[swapId];
    }

    /**
     * @dev Get user's swap history
     * @param user User address
     * @return swapIds Array of swap IDs for the user
     */
    function getUserSwaps(address user) external view returns (bytes32[] memory swapIds) {
        return userSwaps[user];
    }

    /**
     * @dev Get contract metrics
     * @return metrics Current swap metrics
     */
    function getSwapMetrics() external view returns (SwapMetrics memory metrics) {
        return swapMetrics;
    }

    /**
     * @dev Check if swap can be refunded
     * @param swapId Unique swap identifier
     * @return canRefund Whether the swap can be refunded
     */
    function canRefundSwap(bytes32 swapId) external view returns (bool canRefund) {
        AtomicSwap storage swap = atomicSwaps[swapId];
        
        return (
            swap.swapId != bytes32(0) &&
            swap.status == SwapStatus.INITIATED &&
            block.timestamp > swap.timeoutTime &&
            !swap.refunded
        );
    }

    /**
     * @dev Get active swaps count
     * @return activeSwaps Number of swaps in INITIATED or LOCKED status
     */
    function getActiveSwapsCount() external view returns (uint256 activeSwaps) {
        // In production, would maintain a counter for efficiency
        // This is a simplified view function
        return swapMetrics.totalSwapsInitiated - swapMetrics.totalSwapsCompleted;
    }

    /**
     * @dev Calculate swap quote
     * @param polygonAmount Amount to swap from Polygon
     * @return solanaAmount Expected amount on Solana
     * @return swapFee Fee amount
     * @return exchangeRate Current exchange rate
     */
    function getSwapQuote(uint256 polygonAmount) 
        external 
        view 
        returns (
            uint256 solanaAmount,
            uint256 swapFee,
            uint256 exchangeRate
        ) 
    {
        require(polygonAmount >= swapConfig.minSwapAmount, "Amount below minimum");
        require(polygonAmount <= swapConfig.maxSwapAmount, "Amount exceeds maximum");

        exchangeRate = getExchangeRate();
        swapFee = (polygonAmount * swapConfig.swapFeeBps) / 10000;
        uint256 netAmount = polygonAmount - swapFee;
        solanaAmount = (netAmount * exchangeRate) / 1e18;

        return (solanaAmount, swapFee, exchangeRate);
    }
}

// ==============================================================================
// SOLANA PROGRAM COMPANION (RUST)
// ==============================================================================

/*
// Companion Solana program for atomic swaps
// File: programs/atomic-swap/src/lib.rs

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("AtomicSwapProgram1111111111111111111111111");

#[program]
pub mod atomic_swap {
    use super::*;

    pub fn initialize_swap_pool(
        ctx: Context<InitializeSwapPool>,
        bump: u8,
    ) -> Result<()> {
        let swap_pool = &mut ctx.accounts.swap_pool;
        swap_pool.authority = ctx.accounts.authority.key();
        swap_pool.usdc_mint = ctx.accounts.usdc_mint.key();
        swap_pool.bump = bump;
        swap_pool.total_swaps = 0;
        swap_pool.total_volume = 0;
        Ok(())
    }

    pub fn complete_cross_chain_swap(
        ctx: Context<CompleteCrossChainSwap>,
        swap_id: [u8; 32],
        amount: u64,
        wormhole_message_hash: [u8; 32],
    ) -> Result<()> {
        let swap_pool = &mut ctx.accounts.swap_pool;
        
        // Verify Wormhole message (simplified)
        require!(
            !swap_pool.processed_messages.contains(&wormhole_message_hash),
            ErrorCode::MessageAlreadyProcessed
        );

        // Transfer USDC to recipient
        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_usdc_account.to_account_info(),
            to: ctx.accounts.recipient_usdc_account.to_account_info(),
            authority: ctx.accounts.swap_pool.to_account_info(),
        };
        
        let seeds = &[b"swap_pool", &[swap_pool.bump]];
        let signer = &[&seeds[..]];
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);

        token::transfer(cpi_ctx, amount)?;

        // Update metrics
        swap_pool.total_swaps += 1;
        swap_pool.total_volume += amount;
        swap_pool.processed_messages.push(wormhole_message_hash);

        emit!(SwapCompletedEvent {
            swap_id,
            recipient: ctx.accounts.recipient.key(),
            amount,
            wormhole_message_hash,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeSwapPool<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 32 + 1 + 8 + 8 + (32 * 1000), // space for 1000 message hashes
        seeds = [b"swap_pool"],
        bump
    )]
    pub swap_pool: Account<'info, SwapPool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub usdc_mint: Account<'info, token::Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CompleteCrossChainSwap<'info> {
    #[account(
        mut,
        seeds = [b"swap_pool"],
        bump = swap_pool.bump
    )]
    pub swap_pool: Account<'info, SwapPool>,
    
    #[account(mut)]
    pub pool_usdc_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub recipient_usdc_account: Account<'info, TokenAccount>,
    
    /// CHECK: This is the recipient address
    pub recipient: UncheckedAccount<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct SwapPool {
    pub authority: Pubkey,
    pub usdc_mint: Pubkey,
    pub bump: u8,
    pub total_swaps: u64,
    pub total_volume: u64,
    pub processed_messages: Vec<[u8; 32]>,
}

#[event]
pub struct SwapCompletedEvent {
    pub swap_id: [u8; 32],
    pub recipient: Pubkey,
    pub amount: u64,
    pub wormhole_message_hash: [u8; 32],
}

#[error_code]
pub enum ErrorCode {
    #[msg("Wormhole message already processed")]
    MessageAlreadyProcessed,
}
*/
