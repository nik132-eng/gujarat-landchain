// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ULPINLandRegistry
 * @dev ERC-721 NFT contract for Gujarat Land Records using ULPIN (Unique Land Parcel Identification Number)
 * @author Gujarat LandChain × JuliaOS Team
 * 
 * Features:
 * - Mint land parcel NFTs with ULPIN identifiers
 * - Store IPFS metadata hashes for satellite imagery and land data
 * - Transfer restrictions for government oversight
 * - Enumerable for easy querying
 * - Upgradeable metadata URIs
 */
contract ULPINLandRegistry is ERC721, ERC721URIStorage, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Token ID counter
    Counters.Counter private _tokenIds;
    
    // Mapping from ULPIN to token ID
    mapping(string => uint256) public ulpinToTokenId;
    
    // Mapping from token ID to ULPIN
    mapping(uint256 => string) public tokenIdToUlpin;
    
    // Mapping to track if ULPIN already exists
    mapping(string => bool) public ulpinExists;
    
    // Mapping from token ID to mint timestamp
    mapping(uint256 => uint256) public mintTimestamp;
    
    // Mapping from token ID to mint agent address
    mapping(uint256 => address) public mintAgent;
    
    // Authorized mint agents
    mapping(address => bool) public authorizedAgents;
    
    // Transfer restrictions
    bool public transfersEnabled = true;
    mapping(uint256 => bool) public transferRestricted;
    
    // Events
    event LandParcelMinted(
        uint256 indexed tokenId,
        string indexed ulpin,
        address indexed owner,
        address mintAgent,
        string metadataURI
    );
    
    event AgentAuthorized(address indexed agent, bool authorized);
    event TransferRestrictionUpdated(uint256 indexed tokenId, bool restricted);
    event TransfersToggled(bool enabled);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);
    
    // Custom errors
    error ULPINAlreadyExists(string ulpin);
    error ULPINNotFound(string ulpin);
    error UnauthorizedAgent(address agent);
    error TransfersDisabled();
    error TransferRestricted(uint256 tokenId);
    error InvalidULPIN(string ulpin);
    error EmptyMetadataURI();
    
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        // Authorize deployer as initial agent
        authorizedAgents[msg.sender] = true;
        emit AgentAuthorized(msg.sender, true);
    }
    
    /**
     * @dev Modifier to check if sender is authorized agent
     */
    modifier onlyAuthorizedAgent() {
        if (!authorizedAgents[msg.sender]) {
            revert UnauthorizedAgent(msg.sender);
        }
        _;
    }
    
    /**
     * @dev Mint a new land parcel NFT
     * @param to Address to mint the NFT to
     * @param ulpin ULPIN identifier for the land parcel
     * @param metadataURI IPFS URI containing land parcel metadata
     */
    function mintLandParcel(
        address to,
        string memory ulpin,
        string memory metadataURI
    ) external onlyAuthorizedAgent nonReentrant returns (uint256) {
        // Validate inputs
        if (bytes(ulpin).length != 12) {
            revert InvalidULPIN(ulpin);
        }
        if (bytes(metadataURI).length == 0) {
            revert EmptyMetadataURI();
        }
        if (ulpinExists[ulpin]) {
            revert ULPINAlreadyExists(ulpin);
        }
        
        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint the NFT
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, metadataURI);
        
        // Store ULPIN mappings
        ulpinToTokenId[ulpin] = newTokenId;
        tokenIdToUlpin[newTokenId] = ulpin;
        ulpinExists[ulpin] = true;
        
        // Store mint information
        mintTimestamp[newTokenId] = block.timestamp;
        mintAgent[newTokenId] = msg.sender;
        
        emit LandParcelMinted(newTokenId, ulpin, to, msg.sender, metadataURI);
        
        return newTokenId;
    }
    
    /**
     * @dev Batch mint multiple land parcels
     * @param to Address to mint the NFTs to
     * @param ulpins Array of ULPIN identifiers
     * @param metadataURIs Array of IPFS URIs
     */
    function batchMintLandParcels(
        address to,
        string[] memory ulpins,
        string[] memory metadataURIs
    ) external onlyAuthorizedAgent nonReentrant returns (uint256[] memory) {
        require(ulpins.length == metadataURIs.length, "Arrays length mismatch");
        require(ulpins.length > 0, "Empty arrays");
        require(ulpins.length <= 50, "Batch size too large"); // Gas limit protection
        
        uint256[] memory tokenIds = new uint256[](ulpins.length);
        
        for (uint256 i = 0; i < ulpins.length; i++) {
            tokenIds[i] = mintLandParcel(to, ulpins[i], metadataURIs[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Update metadata URI for a token (for satellite image updates)
     * @param tokenId Token ID to update
     * @param newMetadataURI New IPFS metadata URI
     */
    function updateMetadataURI(
        uint256 tokenId,
        string memory newMetadataURI
    ) external onlyAuthorizedAgent {
        require(_exists(tokenId), "Token does not exist");
        require(bytes(newMetadataURI).length > 0, "Empty metadata URI");
        
        _setTokenURI(tokenId, newMetadataURI);
        emit MetadataUpdated(tokenId, newMetadataURI);
    }
    
    /**
     * @dev Get token ID by ULPIN
     * @param ulpin ULPIN identifier
     */
    function getTokenIdByULPIN(string memory ulpin) external view returns (uint256) {
        if (!ulpinExists[ulpin]) {
            revert ULPINNotFound(ulpin);
        }
        return ulpinToTokenId[ulpin];
    }
    
    /**
     * @dev Get ULPIN by token ID
     * @param tokenId Token ID
     */
    function getULPINByTokenId(uint256 tokenId) external view returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        return tokenIdToUlpin[tokenId];
    }
    
    /**
     * @dev Get land parcel information
     * @param tokenId Token ID
     */
    function getLandParcelInfo(uint256 tokenId) external view returns (
        string memory ulpin,
        address owner,
        string memory metadataURI,
        uint256 mintTime,
        address mintAgentAddress,
        bool restricted
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        return (
            tokenIdToUlpin[tokenId],
            ownerOf(tokenId),
            tokenURI(tokenId),
            mintTimestamp[tokenId],
            mintAgent[tokenId],
            transferRestricted[tokenId]
        );
    }
    
    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to query
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokens = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokens[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokens;
    }
    
    /**
     * @dev Authorize or revoke mint agent
     * @param agent Address of the agent
     * @param authorized Whether to authorize or revoke
     */
    function setAuthorizedAgent(address agent, bool authorized) external onlyOwner {
        authorizedAgents[agent] = authorized;
        emit AgentAuthorized(agent, authorized);
    }
    
    /**
     * @dev Set transfer restriction for a token
     * @param tokenId Token ID
     * @param restricted Whether transfers are restricted
     */
    function setTransferRestriction(uint256 tokenId, bool restricted) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        transferRestricted[tokenId] = restricted;
        emit TransferRestrictionUpdated(tokenId, restricted);
    }
    
    /**
     * @dev Toggle global transfers on/off
     * @param enabled Whether transfers are enabled globally
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }
    
    /**
     * @dev Override transfer functions to implement restrictions
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        // Allow minting (from == address(0))
        if (from != address(0)) {
            if (!transfersEnabled) {
                revert TransfersDisabled();
            }
            if (transferRestricted[tokenId]) {
                revert TransferRestricted(tokenId);
            }
        }
        
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Get contract statistics
     */
    function getContractStats() external view returns (
        uint256 totalSupply,
        uint256 totalMintAgents,
        bool transfersGloballyEnabled
    ) {
        // Count authorized agents
        // Note: This is not gas-efficient for large numbers of agents
        // In production, consider using a counter
        
        return (
            totalSupply(),
            0, // Placeholder - would need to track this separately for gas efficiency
            transfersEnabled
        );
    }
    
    /**
     * @dev Emergency pause function
     */
    function emergencyPause() external onlyOwner {
        transfersEnabled = false;
        emit TransfersToggled(false);
    }
    
    /**
     * @dev Withdraw any ETH sent to contract (should not happen in normal operation)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
