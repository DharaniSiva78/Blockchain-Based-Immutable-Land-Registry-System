// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./AccessControl.sol";

contract LandTransfer is AccessControl, ReentrancyGuard {
    enum TransferStatus {
        Pending,
        EscrowFunded,
        Approved,
        Completed,
        Cancelled
    }
    
    struct TransferRequest {
        uint256 transferId;
        uint256 tokenId;
        address seller;
        address buyer;
        uint256 price;
        uint256 escrowAmount;
        TransferStatus status;
        uint256 requestDate;
        uint256 completionDate;
        string notes;
    }
    
    // Counter for transfer IDs
    uint256 private _transferIdCounter;
    
    // Mapping from transfer ID to TransferRequest
    mapping(uint256 => TransferRequest) private _transferRequests;
    
    // Mapping from token ID to active transfer ID
    mapping(uint256 => uint256) private _tokenToActiveTransfer;
    
    // Escrow balances
    mapping(address => uint256) private _escrowBalances;
    
    // NFT contract interface
    IERC721 public landNFTContract;
    
    // Events
    event TransferRequested(
        uint256 indexed transferId,
        uint256 indexed tokenId,
        address indexed seller,
        address buyer,
        uint256 price,
        string notes,
        uint256 timestamp
    );
    
    event EscrowFunded(
        uint256 indexed transferId,
        address indexed buyer,
        uint256 amount,
        uint256 timestamp
    );
    
    event TransferApproved(
        uint256 indexed transferId,
        address indexed approver,
        uint256 timestamp
    );
    
    event TransferCompleted(
        uint256 indexed transferId,
        address indexed seller,
        address indexed buyer,
        uint256 tokenId,
        uint256 price,
        uint256 timestamp
    );
    
    event TransferCancelled(
        uint256 indexed transferId,
        address indexed canceller,
        string reason,
        uint256 timestamp
    );
    
    event EscrowReleased(
        uint256 indexed transferId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );
    
    constructor(address _landNFTAddress) {
        landNFTContract = IERC721(_landNFTAddress);
    }
    
    // Request land transfer
    function requestTransfer(
        uint256 tokenId,
        address buyer,
        uint256 price,
        string memory notes
    ) external returns (uint256) {
        require(landNFTContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(buyer != address(0), "Invalid buyer address");
        require(price > 0, "Price must be greater than 0");
        require(_tokenToActiveTransfer[tokenId] == 0, "Token already in transfer");
        
        _transferIdCounter++;
        uint256 newTransferId = _transferIdCounter;
        
        TransferRequest storage request = _transferRequests[newTransferId];
        request.transferId = newTransferId;
        request.tokenId = tokenId;
        request.seller = msg.sender;
        request.buyer = buyer;
        request.price = price;
        request.status = TransferStatus.Pending;
        request.requestDate = block.timestamp;
        request.notes = notes;
        
        _tokenToActiveTransfer[tokenId] = newTransferId;
        
        emit TransferRequested(
            newTransferId,
            tokenId,
            msg.sender,
            buyer,
            price,
            notes,
            block.timestamp
        );
        
        return newTransferId;
    }
    
    // Fund escrow (buyer deposits funds)
    function fundEscrow(uint256 transferId) external payable nonReentrant {
        TransferRequest storage request = _transferRequests[transferId];
        require(request.transferId != 0, "Transfer does not exist");
        require(request.buyer == msg.sender, "Only buyer can fund escrow");
        require(request.status == TransferStatus.Pending, "Transfer not in pending state");
        require(msg.value == request.price, "Incorrect escrow amount");
        
        request.escrowAmount = msg.value;
        request.status = TransferStatus.EscrowFunded;
        
        _escrowBalances[address(this)] += msg.value;
        
        emit EscrowFunded(transferId, msg.sender, msg.value, block.timestamp);
    }
    
    // Approve transfer (seller approves)
    function approveTransfer(uint256 transferId) external {
        TransferRequest storage request = _transferRequests[transferId];
        require(request.transferId != 0, "Transfer does not exist");
        require(request.seller == msg.sender, "Only seller can approve");
        require(request.status == TransferStatus.EscrowFunded, "Escrow not funded");
        
        request.status = TransferStatus.Approved;
        
        emit TransferApproved(transferId, msg.sender, block.timestamp);
    }
    
    // Complete transfer (execute NFT transfer and release funds)
    function completeTransfer(uint256 transferId) external nonReentrant {
        TransferRequest storage request = _transferRequests[transferId];
        require(request.transferId != 0, "Transfer does not exist");
        require(
            request.status == TransferStatus.Approved,
            "Transfer not approved or already completed"
        );
        require(
            msg.sender == request.seller || msg.sender == request.buyer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        
        // Transfer NFT
        landNFTContract.safeTransferFrom(request.seller, request.buyer, request.tokenId);
        
        // Release funds to seller
        uint256 sellerAmount = request.escrowAmount;
        _escrowBalances[address(this)] -= sellerAmount;
        payable(request.seller).transfer(sellerAmount);
        
        request.status = TransferStatus.Completed;
        request.completionDate = block.timestamp;
        
        // Clear active transfer mapping
        delete _tokenToActiveTransfer[request.tokenId];
        
        emit TransferCompleted(
            transferId,
            request.seller,
            request.buyer,
            request.tokenId,
            request.price,
            block.timestamp
        );
        
        emit EscrowReleased(transferId, request.seller, sellerAmount, block.timestamp);
    }
    
    // Cancel transfer
    function cancelTransfer(uint256 transferId, string memory reason) external nonReentrant {
        TransferRequest storage request = _transferRequests[transferId];
        require(request.transferId != 0, "Transfer does not exist");
        require(
            msg.sender == request.seller || msg.sender == request.buyer || hasRole(ADMIN_ROLE, msg.sender),
            "Not authorized"
        );
        require(
            request.status == TransferStatus.Pending || request.status == TransferStatus.EscrowFunded,
            "Cannot cancel in current state"
        );
        
        // Refund escrow if funded
        if (request.status == TransferStatus.EscrowFunded && request.escrowAmount > 0) {
            _escrowBalances[address(this)] -= request.escrowAmount;
            payable(request.buyer).transfer(request.escrowAmount);
            
            emit EscrowReleased(transferId, request.buyer, request.escrowAmount, block.timestamp);
        }
        
        request.status = TransferStatus.Cancelled;
        
        // Clear active transfer mapping
        delete _tokenToActiveTransfer[request.tokenId];
        
        emit TransferCancelled(transferId, msg.sender, reason, block.timestamp);
    }
    
    // Get transfer request by ID
    function getTransferRequest(uint256 transferId) 
        external 
        view 
        returns (TransferRequest memory) 
    {
        return _transferRequests[transferId];
    }
    
    // Get active transfer ID by token ID
    function getActiveTransferId(uint256 tokenId) external view returns (uint256) {
        return _tokenToActiveTransfer[tokenId];
    }
    
    // Get contract balance (escrow funds)
    function getEscrowBalance() external view returns (uint256) {
        return _escrowBalances[address(this)];
    }
    
    // Fallback function to receive ETH
    receive() external payable {}
}