const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting ULPIN Freeze Contract Deployment - GL-0201");
  
  const network = hre.network.name;
  const chainId = hre.network.config.chainId;
  
  console.log(`📡 Network: ${network}`);
  console.log(`🔗 Chain ID: ${chainId}`);
  
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const deployerBalance = await hre.ethers.provider.getBalance(deployerAddress);
  
  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(deployerBalance)} POL`);
  
  // Get the deployed ULPIN Registry address from previous deployment
  const ulpinRegistryAddress = "0x23311b6E9bF730027488ecF53873B2FC5B5be507";
  
  console.log(`\n🔗 ULPIN Registry: ${ulpinRegistryAddress}`);
  console.log("\n🚀 Deploying Freeze Contract...");
  
  const ULPINFreezeContract = await hre.ethers.getContractFactory("ULPINFreezeContract");
  const freezeContract = await ULPINFreezeContract.deploy(ulpinRegistryAddress);
  
  console.log("⏳ Waiting for deployment confirmation...");
  await freezeContract.waitForDeployment();
  
  const freezeContractAddress = await freezeContract.getAddress();
  
  console.log("\n✅ Freeze Contract Deployed Successfully!");
  console.log(`📍 Address: ${freezeContractAddress}`);
  console.log(`🌐 Network: ${network} (Chain ID: ${chainId})`);
  console.log(`🔗 View: https://amoy.polygonscan.com/address/${freezeContractAddress}`);
  
  // Test basic functionality
  console.log("\n🧪 Testing Contract Functionality...");
  
  // Check freeze duration
  const freezeDuration = await freezeContract.FREEZE_DURATION();
  const daysNumber = Number(freezeDuration) / 86400;
  console.log(`⏱️  Freeze Duration: ${freezeDuration} seconds (${daysNumber} days)`);
  
  // Check registry connection
  const registryAddress = await freezeContract.ulpinRegistry();
  console.log(`🔗 Connected Registry: ${registryAddress}`);
  
  // Check emergency unlocker status
  const isEmergencyUnlocker = await freezeContract.emergencyUnlockers(deployerAddress);
  console.log(`🔐 Deployer Emergency Access: ${isEmergencyUnlocker}`);
  
  console.log("\n🎉 GL-0201 COMPLETED! 🎉");
  console.log("✅ Freeze State Machine Implementation Ready!");
  
  return { 
    freezeContractAddress, 
    ulpinRegistryAddress,
    network, 
    chainId 
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
