// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILandNFT.sol";

contract LandNFT is ERC721, ERC721URIStorage, Ownable, ILandNFT {
    // Counter for token IDs
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to land metadata
    mapping(uint256 => LandMetadata) private _landMetadata;
    
    // Mapping from land ID to token ID (to prevent duplicate land registration)
    mapping(string => uint256) private _landIdToTokenId;
    
    // Events
    event LandNFTMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string landId,
        string title,
        uint256 timestamp
    );
    
    event LandVerified(uint256 indexed tokenId, address verifier, uint256 timestamp);
    event LandOwnershipTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    constructor() ERC721("BlockLand Registry NFT", "BLAND") Ownable(msg.sender) {}
    
    // Modifier to check if land is not already registered
    modifier landNotRegistered(string memory landId) {
        require(_landIdToTokenId[landId] == 0, "Land already registered as NFT");
        _;
    }
    
    // Mint a new land NFT
    function mintLandNFT(
        address to,
        string memory tokenURI,
        LandMetadata memory metadata
    ) external override onlyOwner landNotRegistered(metadata.landId) returns (uint256) {
        // Validate metadata
        require(bytes(metadata.landId).length > 0, "Land ID cannot be empty");
        require(bytes(metadata.title).length > 0, "Title cannot be empty");
        require(metadata.area > 0, "Area must be greater than 0");
        
        // Increment token counter
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        // Mint NFT
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Store metadata
        metadata.registrationDate = block.timestamp;
        _landMetadata[newTokenId] = metadata;
        _landIdToTokenId[metadata.landId] = newTokenId;
        
        emit LandNFTMinted(newTokenId, to, metadata.landId, metadata.title, block.timestamp);
        
        return newTokenId;
    }
    
    // Transfer land ownership (only by registry contract)
    function transferLandOwnership(
        uint256 tokenId,
        address from,
        address to
    ) external override onlyOwner returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        require(ownerOf(tokenId) == from, "From address is not the owner");
        
        // Transfer NFT
        _transfer(from, to, tokenId);
        
        // Update metadata
        _landMetadata[tokenId].ownerName = "Transferred Owner";
        
        emit LandOwnershipTransferred(tokenId, from, to, block.timestamp);
        
        return true;
    }
    
    // Mark land as verified
    function verifyLandNFT(uint256 tokenId) external override onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        
        _landMetadata[tokenId].isVerified = true;
        
        emit LandVerified(tokenId, msg.sender, block.timestamp);
    }
    
    // Get land metadata by token ID
    function getLandMetadata(uint256 tokenId) 
        external 
        view 
        override 
        returns (LandMetadata memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return _landMetadata[tokenId];
    }
    
    // Get token ID by land ID
    function getTokenIdByLandId(string memory landId) 
        external 
        view 
        returns (uint256) 
    {
        return _landIdToTokenId[landId];
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}