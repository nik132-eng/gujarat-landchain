// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title ULPINFreezeContract
 * @dev Implements time-based token freezing mechanism for ULPIN Land Registry NFTs
 * @author Gujarat LandChain × JuliaOS Team
 * 
 * Features:
 * - 30-day mandatory freeze period for land disputes
 * - State machine with proper transitions
 * - Emergency unlock mechanisms for authorized parties
 * - Gas-optimized implementation
 * - Comprehensive event logging
 */
contract ULPINFreezeContract is ReentrancyGuard, Ownable {
    
    // ============ State Variables ============
    
    /// @dev Freeze duration in seconds (30 days)
    uint256 public constant FREEZE_DURATION = 30 days;
    
    /// @dev Reference to the ULPIN Land Registry contract
    IERC721 public immutable ulpinRegistry;
    
    /// @dev Enumeration for freeze states
    enum FreezeState {
        None,        // Token is not frozen
        Active,      // Token is currently frozen
        Expired,     // Freeze period has expired
        Emergency    // Emergency unlock activated
    }
    
    /// @dev Structure to store freeze information
    struct FreezeInfo {
        FreezeState state;
        uint256 freezeStartTime;
        uint256 freezeEndTime;
        address initiator;
        string reason;
        bool emergencyUnlocked;
    }
    
    /// @dev Mapping from token ID to freeze information
    mapping(uint256 => FreezeInfo) public freezeInfo;
    
    /// @dev Mapping of authorized emergency unlocking addresses
    mapping(address => bool) public emergencyUnlockers;
    
    /// @dev Array to track all frozen tokens for iteration
    uint256[] public frozenTokens;
    
    /// @dev Mapping to track token position in frozenTokens array
    mapping(uint256 => uint256) private frozenTokenIndex;
    
    // ============ Events ============
    
    /// @dev Emitted when a token freeze is initiated
    event FreezeInitiated(
        uint256 indexed tokenId,
        address indexed initiator,
        uint256 freezeStartTime,
        uint256 freezeEndTime,
        string reason
    );
    
    /// @dev Emitted when a token freeze expires naturally
    event FreezeExpired(
        uint256 indexed tokenId,
        uint256 expiredTime
    );
    
    /// @dev Emitted when emergency unlock is used
    event EmergencyUnlock(
        uint256 indexed tokenId,
        address indexed unlocker,
        uint256 unlockTime,
        string reason
    );
    
    /// @dev Emitted when freeze state changes
    event FreezeStateChanged(
        uint256 indexed tokenId,
        FreezeState oldState,
        FreezeState newState
    );
    
    /// @dev Emitted when emergency unlocker is authorized/deauthorized
    event EmergencyUnlockerChanged(
        address indexed unlocker,
        bool authorized
    );
    
    // ============ Modifiers ============
    
    /// @dev Ensures token exists in the registry
    modifier tokenExists(uint256 tokenId) {
        require(
            ulpinRegistry.ownerOf(tokenId) != address(0),
            "ULPINFreeze: Token does not exist"
        );
        _;
    }
    
    /// @dev Ensures caller is authorized emergency unlocker
    modifier onlyEmergencyUnlocker() {
        require(
            emergencyUnlockers[msg.sender] || msg.sender == owner(),
            "ULPINFreeze: Not authorized for emergency unlock"
        );
        _;
    }
    
    /// @dev Ensures token is in specified state
    modifier inState(uint256 tokenId, FreezeState expectedState) {
        require(
            getCurrentState(tokenId) == expectedState,
            "ULPINFreeze: Invalid token state"
        );
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the freeze contract
     * @param _ulpinRegistry Address of the ULPIN Land Registry contract
     */
    constructor(address _ulpinRegistry) Ownable(msg.sender) {
        require(_ulpinRegistry != address(0), "ULPINFreeze: Invalid registry address");
        ulpinRegistry = IERC721(_ulpinRegistry);
        
        // Owner is automatically an emergency unlocker
        emergencyUnlockers[msg.sender] = true;
        emit EmergencyUnlockerChanged(msg.sender, true);
    }
    
    // ============ Core Freeze Functions ============
    
    /**
     * @dev Initiate a freeze on a token
     * @param tokenId The ID of the token to freeze
     * @param reason The reason for freezing (e.g., "Land dispute case #123")
     */
    function initiateFreeze(
        uint256 tokenId,
        string calldata reason
    ) 
        external 
        tokenExists(tokenId)
        inState(tokenId, FreezeState.None)
        nonReentrant
    {
        require(bytes(reason).length > 0, "ULPINFreeze: Reason required");
        
        // Only token owner or authorized addresses can initiate freeze
        require(
            ulpinRegistry.ownerOf(tokenId) == msg.sender ||
            emergencyUnlockers[msg.sender] ||
            msg.sender == owner(),
            "ULPINFreeze: Not authorized to freeze"
        );
        
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + FREEZE_DURATION;
        
        // Store freeze information
        freezeInfo[tokenId] = FreezeInfo({
            state: FreezeState.Active,
            freezeStartTime: startTime,
            freezeEndTime: endTime,
            initiator: msg.sender,
            reason: reason,
            emergencyUnlocked: false
        });
        
        // Add to frozen tokens tracking
        frozenTokenIndex[tokenId] = frozenTokens.length;
        frozenTokens.push(tokenId);
        
        emit FreezeInitiated(tokenId, msg.sender, startTime, endTime, reason);
        emit FreezeStateChanged(tokenId, FreezeState.None, FreezeState.Active);
    }
    
    /**
     * @dev Check and update expired freezes
     * @param tokenId The ID of the token to check
     */
    function updateFreezeState(uint256 tokenId) 
        external 
        tokenExists(tokenId)
        nonReentrant
    {
        FreezeInfo storage info = freezeInfo[tokenId];
        FreezeState oldState = info.state;
        FreezeState newState = getCurrentState(tokenId);
        
        if (oldState != newState) {
            info.state = newState;
            
            if (newState == FreezeState.Expired) {
                emit FreezeExpired(tokenId, block.timestamp);
                _removeFrozenToken(tokenId);
            }
            
            emit FreezeStateChanged(tokenId, oldState, newState);
        }
    }
    
    /**
     * @dev Emergency unlock a frozen token
     * @param tokenId The ID of the token to unlock
     * @param reason The reason for emergency unlock
     */
    function emergencyUnlock(
        uint256 tokenId,
        string calldata reason
    )
        external
        tokenExists(tokenId)
        onlyEmergencyUnlocker
        nonReentrant
    {
        FreezeInfo storage info = freezeInfo[tokenId];
        require(
            info.state == FreezeState.Active,
            "ULPINFreeze: Token not actively frozen"
        );
        require(bytes(reason).length > 0, "ULPINFreeze: Reason required");
        
        FreezeState oldState = info.state;
        info.state = FreezeState.Emergency;
        info.emergencyUnlocked = true;
        
        // Remove from frozen tokens tracking
        _removeFrozenToken(tokenId);
        
        emit EmergencyUnlock(tokenId, msg.sender, block.timestamp, reason);
        emit FreezeStateChanged(tokenId, oldState, FreezeState.Emergency);
    }
    
    // ============ State Query Functions ============
    
    /**
     * @dev Get the current state of a token
     * @param tokenId The ID of the token to check
     * @return The current freeze state
     */
    function getCurrentState(uint256 tokenId) public view returns (FreezeState) {
        FreezeInfo memory info = freezeInfo[tokenId];
        
        // If never frozen or emergency unlocked
        if (info.state == FreezeState.None || info.state == FreezeState.Emergency) {
            return info.state;
        }
        
        // Check if expired
        if (info.state == FreezeState.Active && block.timestamp >= info.freezeEndTime) {
            return FreezeState.Expired;
        }
        
        return info.state;
    }
    
    /**
     * @dev Check if a token is currently frozen
     * @param tokenId The ID of the token to check
     * @return True if token is actively frozen
     */
    function isFrozen(uint256 tokenId) external view returns (bool) {
        return getCurrentState(tokenId) == FreezeState.Active;
    }
    
    /**
     * @dev Get remaining freeze time for a token
     * @param tokenId The ID of the token to check
     * @return Remaining seconds, 0 if not frozen or expired
     */
    function getRemainingFreezeTime(uint256 tokenId) external view returns (uint256) {
        FreezeInfo memory info = freezeInfo[tokenId];
        
        if (getCurrentState(tokenId) != FreezeState.Active) {
            return 0;
        }
        
        if (block.timestamp >= info.freezeEndTime) {
            return 0;
        }
        
        return info.freezeEndTime - block.timestamp;
    }
    
    /**
     * @dev Get all currently frozen tokens
     * @return Array of token IDs that are actively frozen
     */
    function getFrozenTokens() external view returns (uint256[] memory) {
        // Filter out expired tokens
        uint256[] memory activeFrozen = new uint256[](frozenTokens.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < frozenTokens.length; i++) {
            if (getCurrentState(frozenTokens[i]) == FreezeState.Active) {
                activeFrozen[count] = frozenTokens[i];
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeFrozen[i];
        }
        
        return result;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Authorize or deauthorize an emergency unlocker
     * @param unlocker Address to authorize/deauthorize
     * @param authorized True to authorize, false to deauthorize
     */
    function setEmergencyUnlocker(address unlocker, bool authorized) 
        external 
        onlyOwner 
    {
        require(unlocker != address(0), "ULPINFreeze: Invalid address");
        emergencyUnlockers[unlocker] = authorized;
        emit EmergencyUnlockerChanged(unlocker, authorized);
    }
    
    /**
     * @dev Batch update multiple token states (gas optimization)
     * @param tokenIds Array of token IDs to update
     */
    function batchUpdateFreezeStates(uint256[] calldata tokenIds) 
        external 
        nonReentrant 
    {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            
            // Skip if token doesn't exist
            try ulpinRegistry.ownerOf(tokenId) returns (address) {
                FreezeInfo storage info = freezeInfo[tokenId];
                FreezeState oldState = info.state;
                FreezeState newState = getCurrentState(tokenId);
                
                if (oldState != newState) {
                    info.state = newState;
                    
                    if (newState == FreezeState.Expired) {
                        emit FreezeExpired(tokenId, block.timestamp);
                        _removeFrozenToken(tokenId);
                    }
                    
                    emit FreezeStateChanged(tokenId, oldState, newState);
                }
            } catch {
                // Token doesn't exist, skip
                continue;
            }
        }
    }
    
    // ============ Internal Functions ============
    
    /**
     * @dev Remove a token from the frozen tokens array
     * @param tokenId The token ID to remove
     */
    function _removeFrozenToken(uint256 tokenId) internal {
        uint256 index = frozenTokenIndex[tokenId];
        uint256 lastIndex = frozenTokens.length - 1;
        
        if (index != lastIndex) {
            uint256 lastTokenId = frozenTokens[lastIndex];
            frozenTokens[index] = lastTokenId;
            frozenTokenIndex[lastTokenId] = index;
        }
        
        frozenTokens.pop();
        delete frozenTokenIndex[tokenId];
    }
    
    // ============ View Functions for Integration ============
    
    /**
     * @dev Get complete freeze information for a token
     * @param tokenId The token ID to query
     * @return Complete freeze information struct
     */
    function getFreezeInfo(uint256 tokenId) 
        external 
        view 
        returns (FreezeInfo memory) 
    {
        return freezeInfo[tokenId];
    }
    
    /**
     * @dev Get freeze statistics
     * @return totalFrozen Number of currently frozen tokens
     * @return totalEverFrozen Total number of tokens ever frozen
     */
    function getFreezeStats() 
        external 
        view 
        returns (uint256 totalFrozen, uint256 totalEverFrozen) 
    {
        totalEverFrozen = frozenTokens.length;
        
        // Count currently active frozen tokens
        for (uint256 i = 0; i < frozenTokens.length; i++) {
            if (getCurrentState(frozenTokens[i]) == FreezeState.Active) {
                totalFrozen++;
            }
        }
    }
}
