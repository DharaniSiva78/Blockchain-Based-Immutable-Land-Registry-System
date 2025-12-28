// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./LandNFT.sol";
import "./ENotaryVerification.sol";
import "./ZKPVerifier.sol";
import "./LandTransfer.sol";
import "./AccessControl.sol";

contract LandRegistry is AccessControl {
    // Contract instances
    LandNFT public landNFT;
    ENotaryVerification public eNotary;
    ZKPVerifier public zkpVerifier;
    LandTransfer public landTransfer;
    
    // Land registration structure
    struct LandRegistration {
        string landId;
        string title;
        uint256 area;
        string addressLine;
        string city;
        string state;
        string country;
        string pincode;
        string coordinates;
        string description;
        address owner;
        uint256 registrationDate;
        string status; // "registered", "verified", "nft_minted", "transferred"
        uint256 tokenId;
        bytes32 zkpProofHash;
    }
    
    // Mapping from land ID to LandRegistration
    mapping(string => LandRegistration) private _landRegistrations;
    
    // Mapping from owner address to array of land IDs
    mapping(address => string[]) private _ownerLands;
    
    // Counter for registration
    uint256 private _registrationCounter;
    
    // Events
    event LandRegistered(
        string indexed landId,
        address indexed owner,
        string title,
        uint256 area,
        uint256 timestamp
    );
    
    event LandVerified(
        string indexed landId,
        address indexed notary,
        uint256 timestamp
    );
    
    event NFTCreated(
        string indexed landId,
        uint256 indexed tokenId,
        address indexed owner,
        string tokenURI,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        string indexed landId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event ZKPProofAdded(
        string indexed landId,
        bytes32 proofHash,
        address indexed prover,
        uint256 timestamp
    );
    
    // Constructor
    constructor() {
        // Deploy all contracts
        landNFT = new LandNFT();
        eNotary = new ENotaryVerification();
        zkpVerifier = new ZKPVerifier();
        landTransfer = new LandTransfer(address(landNFT));
        
        // Set up roles
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(NOTARY_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    // Register new land
    function registerLand(
        string memory landId,
        string memory title,
        uint256 area,
        string memory addressLine,
        string memory city,
        string memory state,
        string memory country,
        string memory pincode,
        string memory coordinates,
        string memory description
    ) external returns (bool) {
        require(bytes(_landRegistrations[landId].landId).length == 0, "Land already registered");
        
        _registrationCounter++;
        
        LandRegistration storage registration = _landRegistrations[landId];
        registration.landId = landId;
        registration.title = title;
        registration.area = area;
        registration.addressLine = addressLine;
        registration.city = city;
        registration.state = state;
        registration.country = country;
        registration.pincode = pincode;
        registration.coordinates = coordinates;
        registration.description = description;
        registration.owner = msg.sender;
        registration.registrationDate = block.timestamp;
        registration.status = "registered";
        
        // Add to owner's lands
        _ownerLands[msg.sender].push(landId);
        
        emit LandRegistered(landId, msg.sender, title, area, block.timestamp);
        
        return true;
    }
    
    // Request E-Notary verification
    function requestNotaryVerification(
        string memory landId,
        string memory documentHash
    ) external returns (uint256) {
        require(
            keccak256(bytes(_landRegistrations[landId].landId)) == keccak256(bytes(landId)),
            "Land not registered"
        );
        require(
            _landRegistrations[landId].owner == msg.sender,
            "Only owner can request verification"
        );
        
        return eNotary.requestVerification(landId, documentHash);
    }
    
    // Create NFT after verification
    function createLandNFT(
        string memory landId,
        string memory tokenURI
    ) external onlyRole(NOTARY_ROLE) returns (uint256) {
        require(
            keccak256(bytes(_landRegistrations[landId].landId)) == keccak256(bytes(landId)),
            "Land not registered"
        );
        require(
            eNotary.isLandVerified(landId),
            "Land not verified by E-Notary"
        );
        require(
            _landRegistrations[landId].tokenId == 0,
            "NFT already created for this land"
        );
        
        LandRegistration storage registration = _landRegistrations[landId];
        
        // Prepare metadata
        ILandNFT.LandMetadata memory metadata = ILandNFT.LandMetadata({
            landId: landId,
            title: registration.title,
            area: registration.area,
            location: string(abi.encodePacked(
                registration.city, ", ", registration.state, ", ", registration.country
            )),
            coordinates: registration.coordinates,
            ownerName: "Land Owner",
            registrationDate: registration.registrationDate,
            isVerified: true,
            nftImageURI: tokenURI
        });
        
        // Mint NFT
        uint256 tokenId = landNFT.mintLandNFT(
            registration.owner,
            tokenURI,
            metadata
        );
        
        registration.tokenId = tokenId;
        registration.status = "nft_minted";
        
        emit NFTCreated(landId, tokenId, registration.owner, tokenURI, block.timestamp);
        
        return tokenId;
    }
    
    // Submit ZKP proof
    function submitZKPProof(
        string memory landId,
        bytes32 proofHash
    ) external returns (bytes32) {
        require(
            keccak256(bytes(_landRegistrations[landId].landId)) == keccak256(bytes(landId)),
            "Land not registered"
        );
        require(
            _landRegistrations[landId].owner == msg.sender,
            "Only owner can submit proof"
        );
        
        bytes32 submittedHash = zkpVerifier.submitProof(landId, proofHash);
        _landRegistrations[landId].zkpProofHash = submittedHash;
        
        emit ZKPProofAdded(landId, submittedHash, msg.sender, block.timestamp);
        
        return submittedHash;
    }
    
    // Request land transfer
    function requestLandTransfer(
        string memory landId,
        address buyer,
        uint256 price,
        string memory notes
    ) external returns (uint256) {
        require(
            keccak256(bytes(_landRegistrations[landId].landId)) == keccak256(bytes(landId)),
            "Land not registered"
        );
        require(
            _landRegistrations[landId].owner == msg.sender,
            "Only owner can transfer"
        );
        require(
            _landRegistrations[landId].tokenId > 0,
            "Land NFT not created"
        );
        
        uint256 tokenId = _landRegistrations[landId].tokenId;
        
        return landTransfer.requestTransfer(tokenId, buyer, price, notes);
    }
    
    // Get land registration details
    function getLandRegistration(string memory landId)
        external
        view
        returns (LandRegistration memory)
    {
        return _landRegistrations[landId];
    }
    
    // Get lands by owner
    function getLandsByOwner(address owner)
        external
        view
        returns (LandRegistration[] memory)
    {
        string[] memory landIds = _ownerLands[owner];
        LandRegistration[] memory lands = new LandRegistration[](landIds.length);
        
        for (uint256 i = 0; i < landIds.length; i++) {
            lands[i] = _landRegistrations[landIds[i]];
        }
        
        return lands;
    }
    
    // Get total registrations
    function getTotalRegistrations() external view returns (uint256) {
        return _registrationCounter;
    }
    
    // Get contract addresses
    function getContractAddresses() external view returns (
        address nftAddress,
        address notaryAddress,
        address zkpAddress,
        address transferAddress
    ) {
        return (
            address(landNFT),
            address(eNotary),
            address(zkpVerifier),
            address(landTransfer)
        );
    }
}