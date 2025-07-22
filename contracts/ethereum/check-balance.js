const hre = require("hardhat");

async function checkBalance() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(await deployer.getAddress());
  console.log("Balance:", hre.ethers.formatEther(balance), "POL");
}

checkBalance().catch(console.error);
