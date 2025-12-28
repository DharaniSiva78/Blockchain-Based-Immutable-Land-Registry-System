// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AccessControl.sol";

contract ZKPVerifier is AccessControl {
    struct ZKPProof {
        bytes32 proofHash;
        address prover;
        string landId;
        bool isValid;
        uint256 verificationTimestamp;
        address verifier;
    }
    
    // Mapping from proof hash to ZKPProof
    mapping(bytes32 => ZKPProof) private _zkpProofs;
    
    // Mapping from land ID to proof hash
    mapping(string => bytes32) private _landToProof;
    
    // Events
    event ZKPSubmitted(
        bytes32 indexed proofHash,
        address indexed prover,
        string landId,
        uint256 timestamp
    );
    
    event ZKPVerified(
        bytes32 indexed proofHash,
        address indexed verifier,
        string landId,
        uint256 timestamp
    );
    
    event ZKPInvalidated(
        bytes32 indexed proofHash,
        address indexed verifier,
        string reason,
        uint256 timestamp
    );
    
    // Submit ZKP proof
    function submitProof(
        string memory landId,
        bytes32 proofHash
    ) external returns (bytes32) {
        require(_landToProof[landId] == bytes32(0), "Proof already exists for this land");
        
        ZKPProof storage proof = _zkpProofs[proofHash];
        require(proof.proofHash == bytes32(0), "Proof hash already used");
        
        proof.proofHash = proofHash;
        proof.prover = msg.sender;
        proof.landId = landId;
        proof.isValid = false;
        
        _landToProof[landId] = proofHash;
        
        emit ZKPSubmitted(proofHash, msg.sender, landId, block.timestamp);
        
        return proofHash;
    }
    
    // Verify ZKP proof (simplified - in production would verify actual ZKP)
    function verifyProof(bytes32 proofHash) external onlyRole(VERIFIER_ROLE) {
        ZKPProof storage proof = _zkpProofs[proofHash];
        require(proof.proofHash != bytes32(0), "Proof does not exist");
        require(!proof.isValid, "Proof already verified");
        
        // In a real implementation, this would verify the actual zero-knowledge proof
        // For demonstration, we're marking it as valid if it meets certain conditions
        
        // Simulate proof verification (always passes for demo)
        bool verificationResult = true;
        
        if (verificationResult) {
            proof.isValid = true;
            proof.verifier = msg.sender;
            proof.verificationTimestamp = block.timestamp;
            
            emit ZKPVerified(proofHash, msg.sender, proof.landId, block.timestamp);
        } else {
            emit ZKPInvalidated(proofHash, msg.sender, "Proof verification failed", block.timestamp);
        }
    }
    
    // Check if proof is valid
    function isProofValid(bytes32 proofHash) external view returns (bool) {
        return _zkpProofs[proofHash].isValid;
    }
    
    // Get proof by hash
    function getProof(bytes32 proofHash) external view returns (ZKPProof memory) {
        return _zkpProofs[proofHash];
    }
    
    // Get proof hash by land ID
    function getProofHashByLandId(string memory landId) external view returns (bytes32) {
        return _landToProof[landId];
    }
    
    // Generate proof hash from inputs (for simulation)
    function generateProofHash(
        string memory landId,
        address owner,
        uint256 timestamp
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(landId, owner, timestamp));
    }
}