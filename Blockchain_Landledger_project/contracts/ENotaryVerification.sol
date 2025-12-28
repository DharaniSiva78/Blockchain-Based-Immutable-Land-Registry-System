// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AccessControl.sol";

contract ENotaryVerification is AccessControl {
    struct VerificationRequest {
        uint256 requestId;
        string landId;
        address requester;
        string documentHash;
        bool isVerified;
        address notary;
        uint256 verificationDate;
        string digitalSignature;
        uint256 requestDate;
    }
    
    // Counter for request IDs
    uint256 private _requestIdCounter;
    
    // Mapping from request ID to VerificationRequest
    mapping(uint256 => VerificationRequest) private _verificationRequests;
    
    // Mapping from land ID to verification status
    mapping(string => bool) private _landVerificationStatus;
    
    // Mapping from land ID to document hash (to prevent reuse)
    mapping(string => bool) private _documentHashes;
    
    // Events
    event VerificationRequested(
        uint256 indexed requestId,
        string landId,
        address indexed requester,
        string documentHash,
        uint256 timestamp
    );
    
    event LandVerified(
        uint256 indexed requestId,
        string landId,
        address indexed notary,
        string digitalSignature,
        uint256 timestamp
    );
    
    event VerificationRejected(
        uint256 indexed requestId,
        string landId,
        address indexed notary,
        string reason,
        uint256 timestamp
    );
    
    // Request E-Notary verification
    function requestVerification(
        string memory landId,
        string memory documentHash
    ) external returns (uint256) {
        require(!_landVerificationStatus[landId], "Land already verified");
        require(!_documentHashes[documentHash], "Document already used");
        
        _requestIdCounter++;
        uint256 newRequestId = _requestIdCounter;
        
        VerificationRequest storage request = _verificationRequests[newRequestId];
        request.requestId = newRequestId;
        request.landId = landId;
        request.requester = msg.sender;
        request.documentHash = documentHash;
        request.isVerified = false;
        request.requestDate = block.timestamp;
        
        _documentHashes[documentHash] = true;
        
        emit VerificationRequested(
            newRequestId,
            landId,
            msg.sender,
            documentHash,
            block.timestamp
        );
        
        return newRequestId;
    }
    
    // Approve verification (only by notary)
    function approveVerification(
        uint256 requestId,
        string memory digitalSignature
    ) external onlyRole(NOTARY_ROLE) {
        VerificationRequest storage request = _verificationRequests[requestId];
        require(request.requestId != 0, "Request does not exist");
        require(!request.isVerified, "Request already verified");
        
        request.isVerified = true;
        request.notary = msg.sender;
        request.verificationDate = block.timestamp;
        request.digitalSignature = digitalSignature;
        
        _landVerificationStatus[request.landId] = true;
        
        emit LandVerified(
            requestId,
            request.landId,
            msg.sender,
            digitalSignature,
            block.timestamp
        );
    }
    
    // Reject verification (only by notary)
    function rejectVerification(
        uint256 requestId,
        string memory reason
    ) external onlyRole(NOTARY_ROLE) {
        VerificationRequest storage request = _verificationRequests[requestId];
        require(request.requestId != 0, "Request does not exist");
        require(!request.isVerified, "Request already verified");
        
        // Remove document hash from used list (allow resubmission)
        delete _documentHashes[request.documentHash];
        
        emit VerificationRejected(
            requestId,
            request.landId,
            msg.sender,
            reason,
            block.timestamp
        );
        
        // Delete the request
        delete _verificationRequests[requestId];
    }
    
    // Check if land is verified
    function isLandVerified(string memory landId) external view returns (bool) {
        return _landVerificationStatus[landId];
    }
    
    // Get verification request by ID
    function getVerificationRequest(uint256 requestId) 
        external 
        view 
        returns (VerificationRequest memory) 
    {
        return _verificationRequests[requestId];
    }
    
    // Get verification status by land ID
    function getVerificationStatus(string memory landId) 
        external 
        view 
        returns (bool) 
    {
        return _landVerificationStatus[landId];
    }
}