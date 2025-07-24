# 🏛️ Gujarat LandChain

**Secure, Transparent Land Registry Powered by Blockchain Technology**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.2-black)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-1.16.0-purple)](https://solana.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🌟 Overview

Gujarat LandChain is a comprehensive blockchain-based land registry system that combines the power of Solana blockchain, AI-driven dispute resolution, and satellite imagery to create a transparent, secure, and efficient land management platform for the state of Gujarat, India.

## ✨ Key Features

### 🗺️ **Interactive Property Map**
- Real-time property visualization with satellite imagery
- ULPIN (Unique Land Parcel Identification Number) integration
- Property status tracking (Verified, Pending, Disputed)
- Interactive markers with detailed property information

### 🔐 **Blockchain Integration**
- Solana smart contracts for land registration
- NFT minting for property ownership
- Cross-chain atomic swaps
- Secure wallet integration (Phantom, Solflare)

### 🤖 **AI-Powered Dispute Resolution**
- Automated evidence bundle generation
- AI-driven dispute analysis
- Governance voting interface for officials
- Real-time dispute tracking

### 📱 **Multi-Platform Applications**
- **Citizen PWA**: Mobile-first citizen portal
- **Official Dashboard**: Administrative interface
- **Governance Interface**: Dispute resolution system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- Solana CLI
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/nik132-eng/gujarat-landchain.git
cd gujarat-landchain

# Install dependencies
npm install

# Start the development environment
./quick-start.sh
```

### Running Individual Components

```bash
# Citizen PWA
cd apps/citizen-pwa
npm run dev

# Official Dashboard
cd apps/official-dashboard
npm run dev

# Solana Programs
cd contracts/solana
cargo build
```

## 🏗️ Project Structure

```
gujarat-landchain/
├── apps/
│   ├── citizen-pwa/          # Next.js citizen portal
│   └── official-dashboard/   # Administrative interface
├── contracts/
│   ├── solana/              # Solana smart contracts
│   └── ethereum/            # Ethereum bridge contracts
├── agents/                  # AI agents for dispute resolution
├── services/               # Backend microservices
├── infrastructure/         # Deployment configurations
└── scripts/               # Utility scripts
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15.4.2** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps

### Blockchain
- **Solana** - Primary blockchain
- **Anchor Framework** - Smart contract development
- **Ethereum** - Cross-chain bridge
- **Hardhat** - Ethereum development

### AI & ML
- **Julia** - AI agent development
- **Python** - ML pipelines
- **LangChain** - Legal document processing

### Infrastructure
- **Docker** - Containerization
- **Kubernetes** - Orchestration
- **PostgreSQL** - Database
- **Redis** - Caching

## 🎯 Demo Features

### Property Management
- Register new land parcels with ULPIN
- View satellite imagery for properties
- Track ownership transfers
- Verify property documents

### Dispute Resolution
- Submit dispute cases
- AI-generated evidence bundles
- Official voting interface
- Real-time case tracking

### Wallet Integration
- Connect Solana wallets
- View NFT ownership
- Execute property transfers
- Monitor transaction history

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/landchain
REDIS_URL=redis://localhost:6379

# Blockchain
SOLANA_RPC_URL=https://api.devnet.solana.com
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# API
API_PORT=3001
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION=24h

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3000
```

## 📊 Monitoring & Analytics

The project includes comprehensive monitoring:

- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **AlertManager** - Alert management
- **Load Testing** - Performance validation

## 🔒 Security

- **Smart Contract Audits** - Automated security analysis
- **Access Control** - Role-based permissions
- **Data Encryption** - End-to-end encryption
- **Audit Logs** - Comprehensive activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/nik132-eng/gujarat-landchain/wiki)
- **Issues**: [GitHub Issues](https://github.com/nik132-eng/gujarat-landchain/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nik132-eng/gujarat-landchain/discussions)

## 🙏 Acknowledgments

- Gujarat Government for vision and support
- Solana Foundation for blockchain infrastructure
- OpenStreetMap for mapping data
- Community contributors and developers

---

**Built with ❤️ for the people of Gujarat**
