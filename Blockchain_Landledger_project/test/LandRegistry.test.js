const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockLand Registry", function () {
  let landRegistry;
  let landNFT;
  let owner, notary, buyer;
  
  const landId = "LAND001";
  const landTitle = "Sunny Acres";
  const landArea = 5000;
  const landAddress = "123 Main Street";
  const landCity = "Hyderabad";
  const landState = "Telangana";
  const landCountry = "India";
  const landPincode = "500001";
  const landCoordinates = "17.3850° N, 78.4867° E";
  const landDescription = "Beautiful agricultural land";
  const documentHash = "0x1234567890abcdef";
  
  beforeEach(async function () {
    [owner, notary, buyer] = await ethers.getSigners();
    
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.deployed();
    
    const addresses = await landRegistry.getContractAddresses();
    const LandNFT = await ethers.getContractFactory("LandNFT");
    landNFT = await LandNFT.attach(addresses.nftAddress);
    
    // Grant NOTARY_ROLE to notary
    await landRegistry.grantRole(
      await landRegistry.NOTARY_ROLE(),
      notary.address
    );
  });
  
  it("Should register land successfully", async function () {
    await landRegistry.registerLand(
      landId,
      landTitle,
      landArea,
      landAddress,
      landCity,
      landState,
      landCountry,
      landPincode,
      landCoordinates,
      landDescription
    );
    
    const registration = await landRegistry.getLandRegistration(landId);
    expect(registration.landId).to.equal(landId);
    expect(registration.owner).to.equal(owner.address);
    expect(registration.status).to.equal("registered");
  });
  
  it("Should request E-Notary verification", async function () {
    await landRegistry.registerLand(
      landId,
      landTitle,
      landArea,
      landAddress,
      landCity,
      landState,
      landCountry,
      landPincode,
      landCoordinates,
      landDescription
    );
    
    const tx = await landRegistry.requestNotaryVerification(landId, documentHash);
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
  });
  
  it("Should create NFT after verification", async function () {
    await landRegistry.registerLand(
      landId,
      landTitle,
      landArea,
      landAddress,
      landCity,
      landState,
      landCountry,
      landPincode,
      landCoordinates,
      landDescription
    );
    
    // Connect as notary to approve verification
    await landRegistry.connect(notary).requestNotaryVerification(landId, documentHash);
    
    const tokenURI = "https://ipfs.io/ipfs/QmTokenURI";
    const tx = await landRegistry.connect(notary).createLandNFT(landId, tokenURI);
    const receipt = await tx.wait();
    expect(receipt.status).to.equal(1);
    
    const registration = await landRegistry.getLandRegistration(landId);
    expect(registration.tokenId).to.be.gt(0);
    expect(registration.status).to.equal("nft_minted");
  });
});