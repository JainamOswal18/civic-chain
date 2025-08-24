# 🏛️ Civic Chain

**A Decentralized Civic Issue Reporting Platform on Aptos Blockchain**

Civic Chain empowers citizens to report civic issues with visual evidence while enabling ward councillors to manage and resolve community problems transparently on the blockchain.

[![Aptos](https://img.shields.io/badge/Blockchain-Aptos-blue)](https://aptoslabs.com/)
[![Move](https://img.shields.io/badge/Smart%20Contract-Move-orange)](https://move-language.github.io/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61dafb)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)](https://www.typescriptlang.org/)
[![IPFS](https://img.shields.io/badge/Storage-IPFS-green)](https://ipfs.io/)
[![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-38bdf8)](https://tailwindcss.com/)

---

## 🌟 **Key Features**

### **📸 Visual Evidence System**
- **Multi-Image Upload**: Citizens can attach up to 10 images per issue
- **IPFS Storage**: Decentralized image storage via Pinata
- **Image Gallery**: Responsive grid display with lightbox viewer
- **File Validation**: Automatic type and size checking (10MB max per image)

### **🗳️ Democratic Governance**
- **Community Voting**: Citizens vote to verify reported issues
- **Spam Protection**: Built-in spam detection and filtering
- **Completion Verification**: Community validates issue resolution
- **Transparent Process**: All actions recorded on blockchain

### **👥 Role-Based Access**
- **Citizens**: Report issues, vote on verification, view community progress
- **Ward Councillors**: Manage issues, update status, track resolution progress
- **Location-Based**: Automatic ward assignment based on GPS coordinates

### **🗺️ Interactive Mapping**
- **Issue Visualization**: View all issues on an interactive map
- **Location Detection**: Automatic user location and ward assignment
- **Proximity-Based**: Issues organized by geographical wards

### **📱 Modern User Experience**
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Real-Time Updates**: Automatic UI refresh after blockchain transactions
- **Professional UI**: Clean, modern interface with glassmorphism effects
- **Accessibility**: Keyboard navigation and screen reader support

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Aptos CLI
- Aptos wallet (Petra, Martian, etc.)
- Pinata account for IPFS storage

### **1. Clone & Install**
```bash
git clone https://github.com/JainamOswal18/civic-chain
cd civic-chain
npm install --legacy-peer-deps
```

### **2. Environment Setup**
Create `.env.local` file:
```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_API_KEY=your_pinata_secret_key
VITE_PINATA_JWT=your_pinata_jwt_token

# Blockchain Configuration
VITE_APP_NETWORK=devnet
VITE_MODULE_ADDRESS=your_contract_address
VITE_CONTRACT_ADDRESS=your_contract_address
```

### **3. Deploy Smart Contract**
```bash
cd contract
aptos move compile
aptos move deploy --profile your-profile
aptos move run --function-id YOUR_ADDRESS::civic_issues::initialize_registry
aptos move run --function-id YOUR_ADDRESS::civic_issues::initialize_ward_registry
```

### **4. Start Development**
```bash
npm run dev
```

Visit `http://localhost:5173` and connect your Aptos wallet!

---

## 🏗️ **Architecture**

### **Smart Contract (Move)**
```
contract/sources/civic_issues.move
├── Issue Management
├── Voting System
├── Ward Registry
├── Councillor Management
└── Status Tracking
```

### **Frontend (React + TypeScript)**
```
frontend/
├── components/
│   ├── civic/           # Core civic components
│   │   ├── CitizenView.tsx
│   │   ├── CouncillorView.tsx
│   │   ├── IssueForm.tsx
│   │   ├── IssueCard.tsx
│   │   └── IssuesMap.tsx
│   └── ui/              # Reusable UI components
        ├── services/
│   ├── IssueService.ts  # Blockchain interactions
│   ├── ImageService.ts  # IPFS image handling
│   ├── UserService.ts   # User role management
│   └── WardService.ts   # Location services
├── hooks/               # Custom React hooks
└── utils/               # Utilities and helpers
```

---

## 🎯 **User Workflows**

### **👤 Citizen Journey**
1. **Connect Wallet** → Automatic role detection
2. **Enable Location** → Ward assignment based on GPS
3. **Report Issue** → Select category, add description, attach images
4. **Upload Images** → Automatic IPFS storage via Pinata
5. **Submit Report** → Blockchain transaction with image CIDs
6. **Community Voting** → Vote on other citizens' reports
7. **Track Progress** → Monitor issue status and resolution

### **🏛️ Councillor Journey**
1. **Dashboard Overview** → Statistics and ward summary
2. **Issue Management** → Review pending and verified issues
3. **Status Updates** → Acknowledge, start progress, mark completed
4. **Progress Tracking** → Monitor resolution across different stages
5. **Community Oversight** → Transparent public accountability

---

## 🛠️ **Technology Stack**

### **Blockchain Layer**
- **Aptos Blockchain**: High-performance, secure blockchain platform
- **Move Language**: Resource-oriented smart contract programming
- **Aptos SDK**: TypeScript SDK for blockchain interactions

### **Frontend Stack**
- **React 18**: Modern UI library with hooks and concurrent features
- **TypeScript**: Type-safe development with enhanced IDE support
- **Vite**: Lightning-fast build tool and development server
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality, accessible UI components

### **Storage & Services**
- **IPFS**: Decentralized file storage for images
- **Pinata**: Professional IPFS pinning service
- **React Query**: Server state management and caching
- **React Leaflet**: Interactive maps with OpenStreetMap

### **Development Tools**
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting and consistency
- **PostCSS**: CSS processing and optimization

---

## 🎨 **Screenshots**

### **Citizen Dashboard**
```
┌─────────────────────────────────────────────────────┐
│ 🏛️ Civic Chain                    👤 Citizen Ward 3 │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📊 Community Progress                               │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│ │  2  │ │  3  │ │  1  │ │  0  │                   │
│ │Total│ │Vote │ │ My  │ │Resol│                   │
│ └─────┘ └─────┘ └─────┘ └─────┘                   │
│                                                     │
│ 🗺️ Interactive Map   📝 Report Issue               │
│ ┌─────────────────┐ ┌─────────────────────────────┐ │
│ │     🗺️ Map      │ │  📝 Quick Report Form      │ │
│ │   📍 Issues     │ │  Category: [Dropdown]      │ │
│ │   📍 Location   │ │  Description: [Text]       │ │
│ │                 │ │  📸 Images: [Upload]       │ │
│ └─────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### **Issue Card with Images**
```
┌─────────────────────────────────────────────────────┐
│ 🚧 Road Maintenance                    ✅ Verified   │
├─────────────────────────────────────────────────────┤
│ Large pothole causing traffic issues on Main St... │
│                                                     │
│ 📸 3 images                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐                           │
│ │ 🖼️  │ │ 🖼️  │ │ 🖼️  │ ← Click for lightbox      │
│ └─────┘ └─────┘ └─────┘                           │
│                                                     │
│ 👤 Reporter: 0x1234...5678  📅 Jan 15, 2024       │
│ 📍 Ward: 3                  🗳️ Votes: 5/3          │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 **Configuration**

### **Smart Contract Setup**
```bash
# Initialize registries
aptos move run --function-id ADDRESS::civic_issues::initialize_registry
aptos move run --function-id ADDRESS::civic_issues::initialize_ward_registry

# Register wards (example)
aptos move run --function-id ADDRESS::civic_issues::register_ward \
  --args u8:1 string:"18.5200" string:"73.8567"

# Register as councillor
aptos move run --function-id ADDRESS::civic_issues::register_councillor \
  --args u8:1
```

### **Pinata IPFS Setup**
1. Create account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys with `pinFileToIPFS` permission
3. Add credentials to `.env.local`
4. Test connection: Images will be stored at `https://gateway.pinata.cloud/ipfs/CID`

---

## 🧪 **Testing**

### **Run Tests**
```bash
# Smart contract tests
cd contract
aptos move test

# Frontend tests
npm test

# E2E tests
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] Wallet connection and role detection
- [ ] Location detection and ward assignment
- [ ] Issue reporting with image upload
- [ ] Image gallery and lightbox functionality
- [ ] Community voting on issues
- [ ] Councillor status management
- [ ] Real-time UI updates
- [ ] Mobile responsiveness

---

## 🚀 **Deployment**

### **Production Build**
```bash
# Build frontend
npm run build

# Deploy to hosting platform
npm run deploy
```

### **Mainnet Deployment**
1. Update `.env.local` with mainnet configuration
2. Deploy smart contract to Aptos mainnet
3. Update frontend configuration
4. Configure production IPFS settings

---

## 🤝 **Contributing**

### **Development Setup**
```bash
# Fork and clone the repository
git clone https://github.com/JainamOswal18/civic-chain
cd civic-chain

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm run dev
npm test

# Submit pull request
git push origin feature/your-feature-name
```

### **Contribution Guidelines**
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Ensure mobile responsiveness

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Aptos Labs** for the robust blockchain platform
- **Move Language** for secure smart contract development
- **Pinata** for reliable IPFS infrastructure
- **OpenStreetMap** for mapping services
- **shadcn/ui** for beautiful UI components

---

## 📞 **Support & Community**

- **Issues**: [GitHub Issues](https://github.com/JainamOswal18/civic-chain/issues)
- **Discussions**: [GitHub Discussions](https://github.com/JainamOswal18/civic-chain/discussions)
- **Documentation**: [Wiki](https://github.com/JainamOswal18/civic-chain/wiki)

---

## 🌐 **Live Demo**

🚀 **[Try Civic Chain Live](https://google.com)**

*Connect your Aptos wallet and start reporting civic issues with visual evidence!*

---

<div align="center">

**Built with ❤️ for transparent civic engagement**

**Empowering communities through blockchain technology**

[⭐ Star this repo](https://github.com/JainamOswal18/civic-chain) • [🐛 Report Bug](https://github.com/JainamOswal18/civic-chain/issues) • [💡 Request Feature](https://github.com/JainamOswal18/civic-chain/issues)

</div>