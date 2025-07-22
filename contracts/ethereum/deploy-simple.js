const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ULPIN Land Registry Deployment - GL-0104");
  
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📡 Network: ${network}`);
  console.log(`🔗 Chain ID: ${chainId}`);
  
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(deployerBalance)} POL`);
  
  const contractName = "Gujarat LandChain ULPIN Registry";
  const contractSymbol = "ULPIN";
  
  console.log("\n🚀 Deploying Contract...");
  
  const ULPINLandRegistry = await hre.ethers.getContractFactory("ULPINLandRegistry");
  const contract = await ULPINLandRegistry.deploy(
    contractName,
    contractSymbol
  );
  
  console.log("⏳ Waiting for deployment confirmation...");
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("\n✅ Contract Deployed Successfully!");
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network} (Chain ID: ${chainId})`);
  console.log(`🔗 View: https://amoy.polygonscan.com/address/${contractAddress}`);
  
  console.log("\n🎉 GL-0104 COMPLETED! 🎉");
  console.log("🏆 Sprint 1: Gujarat LandChain × JuliaOS - 100% COMPLETE!");
  
  return { contractAddress, network, chainId };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
