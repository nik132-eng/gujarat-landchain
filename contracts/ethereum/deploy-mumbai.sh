#!/bin/bash

echo "🚀 Gujarat LandChain - GL-0104 Deployment to Mumbai Testnet"
echo "==========================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.example to .env and add your private key"
    exit 1
fi

# Source environment variables
source .env

# Check if private key is set
if [ "$PRIVATE_KEY" = "your_private_key_here" ] || [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Private key not configured!"
    echo ""
    echo "📋 Setup Instructions:"
    echo "1. Open MetaMask"
    echo "2. Click three dots → Account Details → Export Private Key"
    echo "3. Enter password and copy private key"
    echo "4. Edit .env file and replace 'your_private_key_here' with your key"
    echo "5. Run this script again"
    echo ""
    echo "⚠️  SECURITY: Never commit .env to git!"
    exit 1
fi

echo "✅ Environment configured"
echo "📡 Network: Mumbai Testnet"
echo "🔗 Chain ID: 80001"
echo ""

# Check balance (this will be done in the deploy script)
echo "💰 Checking wallet balance..."
echo "⚡ Expected gas cost: ~0.08-0.12 POL"
echo ""

# Deploy contract
echo "🏗️  Starting deployment..."
npx hardhat run scripts/deploy.js --network mumbai

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 GL-0104 Deployment completed successfully!"
    echo "✅ Sprint 1 is now 100% complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update Julia mint agent with contract address"
    echo "2. Test minting functionality"
    echo "3. Begin Sprint 2 planning"
else
    echo ""
    echo "❌ Deployment failed. Check the error messages above."
    echo "💡 Common issues:"
    echo "   - Insufficient POL balance"
    echo "   - Network connectivity"
    echo "   - Invalid private key"
fi
