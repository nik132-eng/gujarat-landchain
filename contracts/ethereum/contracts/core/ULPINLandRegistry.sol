// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

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
contract ULPINLandRegistry is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Ownable, 
    ReentrancyGuard 
{
    using Strings for uint256;

    // ============ State Variables ============
    
    /// @dev Counter for token IDs (replaces OpenZeppelin Counters)
    uint256 private _nextTokenId = 1;
    
    /// @dev Mapping from ULPIN to token ID
    mapping(string => uint256) public ulpinToTokenId;
    
    /// @dev Mapping from token ID to ULPIN
    mapping(uint256 => string) public tokenIdToUlpin;
    
    /// @dev Mapping to track authorized agents for minting
    mapping(address => bool) public authorizedAgents;
    
    /// @dev Whether transfers are enabled (for emergency freeze)
    bool public transfersEnabled = true;
    
    /// @dev Base URI for metadata
    string private _baseTokenURI;
    
    // ============ Events ============
    
    /// @dev Emitted when a land parcel NFT is minted
    event LandParcelMinted(
        uint256 indexed tokenId,
        string indexed ulpin,
        address indexed owner,
        string metadataURI
    );
    
    /// @dev Emitted when metadata URI is updated
    event MetadataUpdated(uint256 indexed tokenId, string newURI);
    
    /// @dev Emitted when agent authorization changes
    event AgentAuthorized(address indexed agent, bool authorized);
    
    /// @dev Emitted when transfers are enabled/disabled
    event TransfersToggled(bool enabled);
    
    // ============ Modifiers ============
    
    /// @dev Restrict function to authorized agents only
    modifier onlyAuthorizedAgent() {
        require(
            authorizedAgents[msg.sender] || msg.sender == owner(),
            "ULPINLandRegistry: Not authorized agent"
        );
        _;
    }
    
    /// @dev Ensure transfers are enabled
    modifier whenTransfersEnabled() {
        require(transfersEnabled, "ULPINLandRegistry: Transfers disabled");
        _;
    }
    
    // ============ Constructor ============
    
    /**
     * @dev Initialize the contract
     * @param name Token name
     * @param symbol Token symbol
     */
    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) Ownable(msg.sender) {
        // Owner is automatically authorized agent
        authorizedAgents[msg.sender] = true;
        emit AgentAuthorized(msg.sender, true);
    }
    
    // ============ Core Minting Functions ============
    
    /**
     * @dev Mint a new land parcel NFT
     * @param to Address to mint the NFT to
     * @param ulpin Unique Land Parcel Identification Number
     * @param metadataURI IPFS URI for land parcel metadata
     * @return tokenId The minted token ID
     */
    function mintLandParcel(
        address to,
        string memory ulpin,
        string memory metadataURI
    ) external onlyAuthorizedAgent nonReentrant returns (uint256) {
        require(bytes(ulpin).length > 0, "ULPINLandRegistry: Empty ULPIN");
        require(ulpinToTokenId[ulpin] == 0, "ULPINLandRegistry: ULPIN already exists");
        require(to != address(0), "ULPINLandRegistry: Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId++;
        
        // Store ULPIN mappings
        ulpinToTokenId[ulpin] = tokenId;
        tokenIdToUlpin[tokenId] = ulpin;
        
        // Mint NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit LandParcelMinted(tokenId, ulpin, to, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple land parcels
     * @param recipients Array of addresses to mint NFTs to
     * @param ulpins Array of ULPIN identifiers
     * @param metadataURIs Array of IPFS metadata URIs
     * @return tokenIds Array of minted token IDs
     */
    function batchMintLandParcels(
        address[] memory recipients,
        string[] memory ulpins,
        string[] memory metadataURIs
    ) external onlyAuthorizedAgent nonReentrant returns (uint256[] memory) {
        require(
            recipients.length == ulpins.length && 
            ulpins.length == metadataURIs.length,
            "ULPINLandRegistry: Array length mismatch"
        );
        require(recipients.length > 0, "ULPINLandRegistry: Empty arrays");
        require(recipients.length <= 100, "ULPINLandRegistry: Batch too large");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            require(bytes(ulpins[i]).length > 0, "ULPINLandRegistry: Empty ULPIN");
            require(ulpinToTokenId[ulpins[i]] == 0, "ULPINLandRegistry: ULPIN already exists");
            require(recipients[i] != address(0), "ULPINLandRegistry: Cannot mint to zero address");
            
            uint256 tokenId = _nextTokenId++;
            
            // Store ULPIN mappings
            ulpinToTokenId[ulpins[i]] = tokenId;
            tokenIdToUlpin[tokenId] = ulpins[i];
            
            // Mint NFT
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, metadataURIs[i]);
            
            emit LandParcelMinted(tokenId, ulpins[i], recipients[i], metadataURIs[i]);
            
            tokenIds[i] = tokenId;
        }
        
        return tokenIds;
    }
    
    // ============ Metadata Management ============
    
    /**
     * @dev Update metadata URI for a token
     * @param tokenId Token ID to update
     * @param newURI New IPFS metadata URI
     */
    function updateMetadataURI(
        uint256 tokenId,
        string memory newURI
    ) external onlyAuthorizedAgent {
        require(_ownerOf(tokenId) != address(0), "ULPINLandRegistry: Token does not exist");
        
        _setTokenURI(tokenId, newURI);
        emit MetadataUpdated(tokenId, newURI);
    }
    
    /**
     * @dev Set base URI for all tokens
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Get base URI
     * @return Base URI string
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
    
    // ============ Query Functions ============
    
    /**
     * @dev Check if ULPIN exists
     * @param ulpin ULPIN to check
     * @return exists Whether the ULPIN exists
     */
    function ulpinExists(string memory ulpin) external view returns (bool) {
        return ulpinToTokenId[ulpin] != 0;
    }
    
    /**
     * @dev Get token ID for ULPIN
     * @param ulpin ULPIN identifier
     * @return tokenId Token ID (0 if not found)
     */
    function getTokenIdByUlpin(string memory ulpin) external view returns (uint256) {
        return ulpinToTokenId[ulpin];
    }
    
    /**
     * @dev Get ULPIN for token ID
     * @param tokenId Token ID
     * @return ulpin ULPIN identifier
     */
    function getUlpinByTokenId(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ULPINLandRegistry: Token does not exist");
        return tokenIdToUlpin[tokenId];
    }
    
    /**
     * @dev Get all tokens owned by an address
     * @param owner Address to query
     * @return tokenIds Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get total number of minted tokens
     * @return count Total token count
     */
    function getTotalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // ============ Authorization Management ============
    
    /**
     * @dev Authorize/deauthorize an agent for minting
     * @param agent Address to authorize/deauthorize
     * @param authorized Whether to authorize or deauthorize
     */
    function setAuthorizedAgent(address agent, bool authorized) external onlyOwner {
        require(agent != address(0), "ULPINLandRegistry: Invalid agent address");
        authorizedAgents[agent] = authorized;
        emit AgentAuthorized(agent, authorized);
    }
    
    /**
     * @dev Batch authorize multiple agents
     * @param agents Array of agent addresses
     * @param authorized Whether to authorize or deauthorize
     */
    function batchSetAuthorizedAgents(
        address[] memory agents,
        bool authorized
    ) external onlyOwner {
        require(agents.length > 0, "ULPINLandRegistry: Empty agents array");
        require(agents.length <= 50, "ULPINLandRegistry: Batch too large");
        
        for (uint256 i = 0; i < agents.length; i++) {
            require(agents[i] != address(0), "ULPINLandRegistry: Invalid agent address");
            authorizedAgents[agents[i]] = authorized;
            emit AgentAuthorized(agents[i], authorized);
        }
    }
    
    // ============ Transfer Controls ============
    
    /**
     * @dev Enable or disable transfers
     * @param enabled Whether transfers should be enabled
     */
    function setTransfersEnabled(bool enabled) external onlyOwner {
        transfersEnabled = enabled;
        emit TransfersToggled(enabled);
    }
    
    /**
     * @dev Override transfer to add restrictions
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) whenTransfersEnabled returns (address) {
        return super._update(to, tokenId, auth);
    }
    
    // ============ Required Overrides ============
    
    /**
     * @dev Override tokenURI to support both base URI and individual URIs
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override supportsInterface for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Override _increaseBalance for ERC721Enumerable compatibility
     */
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
}
