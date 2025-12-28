const hre = require("hardhat");

async function main() {
  // Deploy LandRegistry (which deploys all other contracts)
  const LandRegistry = await hre.ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  
  await landRegistry.deployed();
  
  console.log("LandRegistry deployed to:", landRegistry.address);
  
  // Get contract addresses
  const contractAddresses = await landRegistry.getContractAddresses();
  console.log("LandNFT deployed to:", contractAddresses.nftAddress);
  console.log("ENotaryVerification deployed to:", contractAddresses.notaryAddress);
  console.log("ZKPVerifier deployed to:", contractAddresses.zkpAddress);
  console.log("LandTransfer deployed to:", contractAddresses.transferAddress);
  
  return {
    landRegistry: landRegistry.address,
    landNFT: contractAddresses.nftAddress,
    eNotary: contractAddresses.notaryAddress,
    zkpVerifier: contractAddresses.zkpAddress,
    landTransfer: contractAddresses.transferAddress
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });