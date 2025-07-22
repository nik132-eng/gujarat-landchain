const hre = require("hardhat");

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error("❌ Usage: node verify.js <contract-address>");
    console.error("Example: node verify.js 0x1234567890123456789012345678901234567890");
    process.exit(1);
  }
  
  const contractAddress = args[0];
  const network = hre.network.name;
  
  console.log("🔍 Verifying ULPINLandRegistry Contract");
  console.log("=" * 50);
  console.log(`📍 Address: ${contractAddress}`);
  console.log(`🌐 Network: ${network}`);
  
  // Constructor arguments
  const contractName = "Gujarat LandChain ULPIN Registry";
  const contractSymbol = "ULPIN";
  
  console.log(`📋 Constructor Args:`);
  console.log(`   Name: "${contractName}"`);
  console.log(`   Symbol: "${contractSymbol}"`);
  
  try {
    console.log("\n⏳ Submitting for verification...");
    
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [contractName, contractSymbol],
    });
    
    console.log("✅ Contract verified successfully!");
    console.log(`🔗 View on PolygonScan: https://${network === 'mumbai' ? 'mumbai.' : ''}polygonscan.com/address/${contractAddress}`);
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
      console.log(`🔗 View on PolygonScan: https://${network === 'mumbai' ? 'mumbai.' : ''}polygonscan.com/address/${contractAddress}`);
    } else {
      console.error("❌ Verification failed:");
      console.error(error.message);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
