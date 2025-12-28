// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ILandNFT {
    struct LandMetadata {
        string landId;
        string title;
        uint256 area;
        string location;
        string coordinates;
        string ownerName;
        uint256 registrationDate;
        bool isVerified;
        string nftImageURI;
    }
    
    function mintLandNFT(
        address to,
        string memory tokenURI,
        LandMetadata memory metadata
    ) external returns (uint256);
    
    function transferLandOwnership(
        uint256 tokenId,
        address from,
        address to
    ) external returns (bool);
    
    function getLandMetadata(uint256 tokenId) 
        external 
        view 
        returns (LandMetadata memory);
    
    function verifyLandNFT(uint256 tokenId) external;
}