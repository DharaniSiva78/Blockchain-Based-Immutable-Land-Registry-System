<div align="center">

# 🏡 Blockchain-Based Immutable Land Registry System

**A full-stack blockchain platform for secure land registration using NFT-based digital ownership certificates, E-Notary authentication, and Zero-Knowledge Proof privacy protection, with property transfers automated by smart contracts to prevent fraud and duplication.**


</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Workflow Diagrams](#-workflow-diagrams)
- [Smart Contract Design](#-smart-contract-design)
- [Zero-Knowledge Proof Flow](#-zero-knowledge-proof-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Security Considerations](#-security-considerations)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)

---

## 📖 Overview

Traditional land registries rely on paper records and centralized databases, which are vulnerable to **forgery, duplicate registration, tampering, and long approval delays**.

This project moves the land registry onto the **Ethereum blockchain**:

- 🏷️ Each land parcel is represented as a unique **NFT ownership certificate**
- ✍️ An **E-Notary** verifies and authenticates every registration and transfer
- 🕶️ **Zero-Knowledge Proofs (ZKP)** let users prove ownership or eligibility without exposing sensitive personal data
- ⚙️ **Smart contracts** automate property transfers
- 📜 Every action is recorded on an **immutable, transparent ledger**

---

## 🖼️ Screenshots
<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/9b2d0c17-0097-450b-8d60-0785ba6de276" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/4bd17eac-0f0e-4ef5-81e5-39522b81a969" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/bffad3bc-70fe-4fec-9f4f-1ba29406586e" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/22ff5ca3-b0cb-42d6-b8be-a310cdf07fd2" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/8e9cd67f-2788-417a-b266-ddb22fe5ab6f" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/2619fb20-0aab-46e4-a13a-f984c7209bb9" />

<img width="810" height="586" alt="image" src="https://github.com/user-attachments/assets/6b38b80f-c368-4bd2-8351-b8a29205055f" />

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏷️ **NFT Land Certificates** | Each property is minted as a unique NFT that serves as a digital ownership certificate |
| ✍️ **E-Notary Verification** | An authorized notary reviews and approves registrations and transfers before they take effect |
| 🕶️ **Zero-Knowledge Proofs** | Prove ownership or identity attributes without revealing private data |
| ⚙️ **Automated Transfers** | Smart contracts execute ownership transfer once all conditions are met |
| 📜 **Immutable Ledger** | Records cannot be altered or deleted once written to the blockchain |
| 🔍 **Transparency** | Anyone can verify ownership history and transactions on-chain |
| 🚫 **Fraud Prevention** | Unique token IDs prevent duplicate registration and double selling |

---

## 🏗️ System Architecture

The system is organized into **five layers**: users, frontend, wallet and Web3 integration, smart contracts, and the blockchain network.

```mermaid
flowchart TB
    subgraph USERS["👥 Actors"]
        U1["🧑 Land Owner / Seller"]
        U2["🧑‍💼 Buyer"]
        U3["✍️ E-Notary"]
        U4["🔍 Public Verifier"]
    end

    subgraph FE["🖥️ Presentation Layer: React Frontend"]
        F1["Registration UI"]
        F2["Transfer & Marketplace UI"]
        F3["Notary Dashboard"]
        F4["Ownership Verification UI"]
    end

    subgraph INT["🔌 Integration Layer"]
        I1["Web3 Library<br/>(web3.js / ethers)"]
        I2["MetaMask Wallet<br/>Sign & Send Transactions"]
        I3["ZKP Proof Generator<br/>(client-side)"]
    end

    subgraph SC["📜 Smart Contract Layer: Solidity (contracts/)"]
        direction TB
        C1["🏷️ LandRegistry / NFT Contract<br/>mint · ownerOf · transfer"]
        C2["✍️ E-Notary Contract<br/>authorize · approve · reject"]
        C3["🕶️ ZKP Verifier Contract<br/>verifyProof()"]
        C4["🔁 Transfer Logic<br/>escrow & ownership change"]
        C1 --- C2
        C1 --- C3
        C1 --- C4
    end

    subgraph BC["⛓️ Blockchain Layer: Ethereum"]
        B1[("Immutable Ledger<br/>State & Transaction History")]
        B2["Local Hardhat Node / Testnet"]
    end

    subgraph DEV["🛠️ Dev & Deployment Tooling"]
        D1["Hardhat / Truffle<br/>(hardhat.config.js)"]
        D2["Migration Scripts<br/>(migration/)"]
    end

    U1 --> F1
    U2 --> F2
    U3 --> F3
    U4 --> F4
    F1 --> I1
    F2 --> I1
    F3 --> I1
    F4 --> I1
    F1 --> I3
    I1 <--> I2
    I2 -- "Signed Tx" --> C1
    I2 -- "Signed Tx" --> C2
    I3 -- "Proof" --> C3
    SC --> B1
    B1 --- B2
    D1 --> D2
    D2 -- "Compile & Deploy" --> SC

    classDef actor fill:#f3e5f5,stroke:#8e24aa,color:#4a148c
    classDef fe fill:#e3f2fd,stroke:#1976d2,color:#0d47a1
    classDef int fill:#fff3e0,stroke:#f57c00,color:#e65100
    classDef sc fill:#e8f5e9,stroke:#388e3c,color:#1b5e20
    classDef bc fill:#eceff1,stroke:#455a64,color:#263238
    classDef dev fill:#fffde7,stroke:#fbc02d,color:#6d4c00
    class U1,U2,U3,U4 actor
    class F1,F2,F3,F4 fe
    class I1,I2,I3 int
    class C1,C2,C3,C4 sc
    class B1,B2 bc
    class D1,D2 dev
```

### Layer Summary

| Layer | Technology | Responsibility |
|---|---|---|
| **Presentation** | React | User interface for owners, buyers, notaries, and verifiers |
| **Integration** | Web3, MetaMask | Wallet connection, transaction signing, contract calls |
| **Smart Contracts** | Solidity | Registry logic, NFT minting, notary approval, ZKP verification, transfers |
| **Blockchain** | Ethereum | Immutable storage of ownership records |
| **Tooling** | Hardhat / Truffle | Compile, test, migrate, and deploy contracts |

---

## 🔄 Workflow Diagrams

### 1️⃣ Land Registration Workflow

```mermaid
flowchart TD
    A([▶️ Owner connects MetaMask]) --> B["Fill land details<br/>survey no., location, area, documents"]
    B --> C["Generate ZK proof of ownership<br/>without exposing private data"]
    C --> D["Submit registration request<br/>signed via MetaMask"]
    D --> E["📜 Smart contract records<br/>pending registration"]
    E --> F["✍️ E-Notary reviews request"]
    F --> G{"Verification<br/>successful?"}
    G -- No --> H["❌ Request rejected<br/>reason logged on-chain"]
    H --> Z1([End])
    G -- Yes --> I["✅ E-Notary approves<br/>on-chain"]
    I --> J{"Duplicate<br/>parcel check"}
    J -- Already registered --> H
    J -- Unique --> K["🏷️ Mint NFT<br/>Land Ownership Certificate"]
    K --> L["NFT assigned to owner's wallet"]
    L --> M["📜 Event emitted &<br/>recorded on immutable ledger"]
    M --> Z2([✅ Land registered])

    classDef start fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20
    classDef decision fill:#fff9c4,stroke:#f9a825,color:#6d4c00
    classDef bad fill:#ffcdd2,stroke:#c62828,color:#b71c1c
    classDef nft fill:#bbdefb,stroke:#1565c0,color:#0d47a1
    class A,Z2 start
    class G,J decision
    class H,Z1 bad
    class K,L,M nft
```

### 2️⃣ Property Transfer Workflow

```mermaid
flowchart TD
    A([▶️ Seller lists property for sale]) --> B["Seller sets price<br/>and approves transfer"]
    B --> C["Buyer connects MetaMask<br/>and views listing"]
    C --> D["Buyer submits offer / payment<br/>funds held in smart contract"]
    D --> E["✍️ E-Notary verifies<br/>both parties and documents"]
    E --> F{"Notary<br/>approved?"}
    F -- No --> G["❌ Transfer cancelled"]
    G --> H["💸 Funds refunded to buyer"]
    H --> Z1([End])
    F -- Yes --> I["Smart contract checks<br/>ownership and conditions"]
    I --> J{"All conditions<br/>satisfied?"}
    J -- No --> G
    J -- Yes --> K["⚙️ Automated execution"]
    K --> L["NFT transferred<br/>seller → buyer"]
    K --> M["💰 Payment released<br/>to seller"]
    L --> N["📜 Transfer recorded<br/>on-chain permanently"]
    M --> N
    N --> Z2([✅ Ownership updated])

    classDef start fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20
    classDef decision fill:#fff9c4,stroke:#f9a825,color:#6d4c00
    classDef bad fill:#ffcdd2,stroke:#c62828,color:#b71c1c
    classDef ok fill:#bbdefb,stroke:#1565c0,color:#0d47a1
    class A,Z2 start
    class F,J decision
    class G,H,Z1 bad
    class K,L,M,N ok
```

### 3️⃣ End-to-End Interaction Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Owner as 🧑 Owner
    actor Buyer as 🧑 Buyer
    actor Notary as ✍️ E-Notary
    participant UI as 🖥️ React Frontend
    participant MM as 🦊 MetaMask
    participant SC as 📜 Smart Contracts
    participant BC as ⛓️ Ethereum

    rect rgb(232, 245, 233)
    Note over Owner,BC: Registration
    Owner->>UI: Enter land details
    UI->>UI: Generate ZK proof
    UI->>MM: Request signature
    MM->>SC: registerLand(details, proof)
    SC->>SC: verifyProof()
    SC-->>BC: Store pending record
    Notary->>UI: Review pending request
    UI->>MM: Sign approval
    MM->>SC: approveRegistration(id)
    SC->>SC: mint NFT to owner
    SC-->>BC: Persist ownership
    SC-->>UI: LandRegistered event
    end

    rect rgb(227, 242, 253)
    Note over Owner,BC: Transfer
    Owner->>UI: List property for sale
    Buyer->>UI: Buy property
    UI->>MM: Send payment
    MM->>SC: initiateTransfer(id) + ETH
    Notary->>UI: Verify and approve transfer
    UI->>MM: Sign approval
    MM->>SC: approveTransfer(id)
    SC->>SC: transfer NFT and release funds
    SC-->>BC: Update owner record
    SC-->>UI: OwnershipTransferred event
    end
```

### 4️⃣ Land Record Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Submitted: Owner submits registration
    Submitted --> UnderReview: E-Notary picks up request
    UnderReview --> Rejected: Verification fails
    UnderReview --> Registered: Notary approves, NFT minted
    Rejected --> [*]
    Registered --> ListedForSale: Owner lists property
    ListedForSale --> Registered: Listing cancelled
    ListedForSale --> TransferPending: Buyer pays
    TransferPending --> Registered: Notary rejects, refund
    TransferPending --> Transferred: Notary approves
    Transferred --> Registered: New owner holds NFT
```

---

## 📜 Smart Contract Design

> The names below illustrate a typical design. Update them to match the contracts in your `contracts/` folder.

| Contract | Purpose | Key Functions |
|---|---|---|
| **LandRegistry (ERC-721)** | Stores land records and mints NFT certificates | `registerLand()`, `ownerOf()`, `getLandDetails()` |
| **E-Notary Module** | Manages authorized notaries and approvals | `addNotary()`, `approveRegistration()`, `approveTransfer()` |
| **ZKP Verifier** | Verifies zero-knowledge proofs on-chain | `verifyProof()` |
| **Transfer Logic** | Handles listing, payment, and ownership change | `listForSale()`, `initiateTransfer()`, `completeTransfer()` |

```mermaid
classDiagram
    class LandRegistry {
        +uint256 tokenId
        +mapping landDetails
        +registerLand(details, proof)
        +getLandDetails(tokenId)
        +ownerOf(tokenId)
    }
    class ENotary {
        +mapping authorizedNotaries
        +addNotary(address)
        +approveRegistration(id)
        +approveTransfer(id)
        +rejectRequest(id)
    }
    class ZKPVerifier {
        +verifyProof(proof, inputs) bool
    }
    class TransferManager {
        +listForSale(tokenId, price)
        +initiateTransfer(tokenId)
        +completeTransfer(tokenId)
        +cancelTransfer(tokenId)
    }
    LandRegistry --> ENotary : requires approval
    LandRegistry --> ZKPVerifier : validates proofs
    TransferManager --> LandRegistry : transfers NFT
    TransferManager --> ENotary : requires approval
```

---

## 🕶️ Zero-Knowledge Proof Flow

ZKPs allow an owner to **prove a statement is true without revealing the underlying data**, such as proving identity or ownership without publishing personal documents on a public chain.

```mermaid
sequenceDiagram
    autonumber
    participant P as 🧑 Prover (Owner)
    participant V as 📜 ZKP Verifier Contract
    participant R as 🏷️ Land Registry

    P->>P: Combine private inputs<br/>(ID details, documents)
    P->>P: Generate proof (client-side)
    P->>V: Submit proof + public inputs
    V->>V: Verify proof mathematically
    alt Proof valid
        V-->>R: Verified ✅
        R-->>P: Proceed with registration / transfer
    else Proof invalid
        V-->>P: Rejected ❌
    end
    Note over P,V: Private data is never revealed on-chain
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Smart Contracts** | Solidity |
| **Blockchain** | Ethereum |
| **Dev Framework** | Hardhat / Truffle |
| **Frontend** | React |
| **Blockchain Integration** | Web3 |
| **Wallet** | MetaMask |

---

## 📂 Project Structure

```
Blockchain-Based-Immutable-Land-Registry-System/
│
├── contracts/            # Solidity smart contracts
├── frontend/             # React web application
├── migration/            # Deployment / migration scripts
├── hardhat.config.js     # Hardhat configuration
└── README.md             # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MetaMask](https://metamask.io/) browser extension
- Git

### 1. Clone the repository
```bash
git clone https://github.com/DharaniSiva78/Blockchain-Based-Immutable-Land-Registry-System.git
cd Blockchain-Based-Immutable-Land-Registry-System
```

### 2. Install dependencies
```bash
npm install
cd frontend
npm install
cd ..
```

### 3. Compile the smart contracts
```bash
npx hardhat compile
```

### 4. Start a local blockchain
```bash
npx hardhat node
```

### 5. Deploy the contracts *(in a new terminal)*
```bash
npx hardhat run migration/deploy.js --network localhost
```
> Adjust the script path or filename to match the files in your `migration/` folder.

### 6. Configure MetaMask
- Add the local network: RPC `http://127.0.0.1:8545`, Chain ID `31337`
- Import one of the test accounts printed by `npx hardhat node`

### 7. Run the frontend
```bash
cd frontend
npm start
```
Open **http://localhost:3000** in your browser and connect MetaMask.

---

## 🔐 Security Considerations

- ✅ Only authorized **E-Notary** addresses can approve registrations and transfers
- ✅ **NFT uniqueness** prevents duplicate registration of the same parcel
- ✅ **Escrow logic** ensures payment and ownership change happen together
- ✅ **ZKPs** protect sensitive personal data from being published on-chain
- ✅ **Immutability** means records cannot be altered after confirmation
- ⚠️ Test thoroughly and get an independent audit before any mainnet deployment

---

## 🔮 Future Enhancements

- 🌐 Deploy to a public testnet (Sepolia) and then to mainnet
- 📁 Decentralized document storage with **IPFS**
- 🗺️ GIS and map integration for parcel boundaries
- 🧾 Automated stamp duty and tax calculation
- 🏦 Mortgage and lien management through smart contracts
- 👥 Fractional ownership of land parcels
- 📱 Mobile-friendly dApp and WalletConnect support
- 🧪 Expanded test coverage and formal contract audits

---

## 👤 Author

**Dharani Siva**
GitHub: [@DharaniSiva78](https://github.com/DharaniSiva78)

---

<div align="center">

⭐ If you found this project useful, please consider giving it a star!

</div>
