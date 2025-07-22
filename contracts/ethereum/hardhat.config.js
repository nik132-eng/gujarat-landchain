require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // Enable intermediate representation for better optimization
    },
  },
  
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      gasPrice: "auto",
      blockGasLimit: 12000000,
    },
    
    // Polygon Amoy Testnet (Replacement for Mumbai)
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL || "https://rpc-amoy.polygon.technology/",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80002,
      gas: 2000000,
      gasPrice: 35000000000, // 35 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    
    // Legacy Mumbai Testnet (deprecated)
    mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "https://rpc-mumbai.maticvigil.com/",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80001,
      gas: 2000000,
      gasPrice: 35000000000, // 35 gwei
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    
    // Polygon Mainnet (for future deployment)
    polygon: {
      url: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com/",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 137,
      gas: 2000000,
      gasPrice: 35000000000,
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  
  // Contract verification on Polygonscan
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonMumbai",
        chainId: 80001,
        urls: {
          apiURL: "https://api-testnet.polygonscan.com/api",
          browserURL: "https://mumbai.polygonscan.com/"
        }
      }
    ]
  },
  
  // Gas reporting
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 35, // gwei
    token: "MATIC",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
  },
  
  // Contract size checking
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ["ULPINLandRegistry"],
  },
  
  // Mocha test configuration
  mocha: {
    timeout: 40000,
    reporter: "spec",
  },
  
  // Path configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
