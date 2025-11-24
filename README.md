# Ethereum TX Builder

**Author:** Isaac Emmanuel (1cbyc)  
**GitHub:** [github.com/1cbyc](https://github.com/1cbyc)  
**Email:** ei@nsisong.com

## Introduction

Ethereum transaction builder and signer application for smart contract interactions and ETH transfers.

Built with React and Bootstrap. The application is coded in ECMAScript 2016 and wrapped together using Webpack. For the deployment of the contract Go Ethereum is used. For the API calls Etherscan.IO API service is used.

All private keys are held 100% on the client side and transaction is constructed in JavaScript, making this optimal for non-custodian wallets or Dapps.

We use both command line Node.js tools and browser based JavaScript in this application.

## Features

### Core Functionality
- **Transaction Building**: Build and sign Ethereum transactions client-side
- **Smart Contract Interaction**: Call contract functions with ABI support
- **ETH Transfers**: Send ETH directly to addresses
- **Offline Signing**: Generate raw transactions for manual submission
- **Client-Side Security**: All private keys stay in your browser

### Network Support
- **Multi-Network**: Support for Mainnet, Sepolia, Goerli, and Ropsten
- **Network Selector**: Easy switching between networks
- **Auto-Configuration**: API URLs and explorer links update automatically

### Gas Management
- **Gas Estimation**: Auto-estimate gas limit for transactions
- **Gas Price Suggestions**: Slow/Standard/Fast options with Gwei display
- **Cost Calculation**: Real-time transaction cost estimation in ETH
- **Balance Warnings**: Alerts when balance is insufficient

### Form Validation
- **Address Validation**: Checksum validation and formatting
- **Private Key Validation**: Format validation for private keys
- **Gas Validation**: Gas limit and price validation
- **Function Signature Validation**: Validates contract function signatures
- **Real-Time Feedback**: Instant error messages

### Transaction Preview
- **Decoded Details**: View transaction details before sending
- **Cost Breakdown**: See gas costs and total transaction cost
- **Balance Check**: Warnings for insufficient funds
- **Explorer Links**: Quick links to view addresses and transactions

### Contract Interaction
- **ABI Loader**: Paste contract ABI to see available functions
- **Function Selector**: Click to auto-fill function signatures
- **Parameter Input**: Easy parameter entry for function calls
- **Payable Functions**: Support for functions that accept ETH

### Wallet Management
- **Multiple Wallets**: Save and manage multiple wallets
- **Wallet Labels**: Name your wallets for easy identification
- **Quick Switch**: Switch between saved wallets instantly
- **Secure Storage**: Wallets stored in browser localStorage

### Transaction History
- **Local History**: Track all sent transactions locally
- **Network Filtering**: Filter by network
- **Address Filtering**: Filter by wallet address
- **Explorer Links**: Direct links to view transactions on blockchain explorer
- **Transaction Details**: View function calls, values, and status

### User Experience
- **Copy to Clipboard**: One-click copy for addresses, hashes, and raw transactions
- **QR Code Generator**: Generate QR codes for addresses and transaction hashes
- **Transaction Templates**: Save and load common transaction configurations
- **Loading States**: Visual feedback during gas estimation and transaction sending
- **Dark Mode**: Toggle between light and dark themes
- **Mobile Responsive**: Works on mobile devices

### Settings Management
- **Export Settings**: Backup all settings, wallets, templates, and history
- **Import Settings**: Restore from backup file
- **Data Persistence**: Settings survive browser refreshes

## Installation

```bash
# Clone the repository
git clone https://github.com/1cbyc/ethereum-tx-builder.git
cd ethereum-tx-builder

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm start

# Build for production
npm run build
```

## Usage

### Basic Setup

1. **Get Etherscan API Key**: Sign up at [etherscan.io](https://etherscan.io) and get your API key
2. **Select Network**: Choose your network (Mainnet, Sepolia, etc.)
3. **Enter API Key**: Paste your Etherscan API key
4. **Enter Private Key**: Your private key (0x + 64 hex characters)

### Sending ETH

1. Select "ETH Transfer" as transaction type
2. Enter recipient address
3. Enter amount in ETH
4. Click "Estimate" to get gas limit (or enter manually)
5. Select gas price (Slow/Standard/Fast)
6. Review transaction preview
7. Click "Send Transaction"

### Calling Smart Contracts

1. Select "Contract Call" as transaction type
2. Enter contract address
3. (Optional) Paste contract ABI to see available functions
4. Select function from list or enter function signature manually
5. Enter function parameters (comma-separated)
6. Enter value if calling payable function
7. Estimate gas and set gas price
8. Review preview and send

### Saving Templates

1. Configure your transaction
2. Click "Save Current as Template"
3. Enter a name
4. Load it later with "Load Template"

### Managing Wallets

1. Click "Add Wallet" in the Saved Wallets section
2. Enter private key and optional label
3. Use "Use" button to switch wallets
4. Delete wallets you no longer need

### Exporting/Importing Settings

1. Click "Export Settings" to download a JSON backup
2. Use "Import Settings" to restore from backup
3. All data (wallets, templates, history) will be restored

## Project Structure

```
src/
├── components/          # React components
│   ├── App.jsx          # Main app wrapper
│   ├── Signer.jsx       # Main transaction builder UI
│   ├── AccountInfo.jsx  # Display account balance/nonce
│   ├── TransactionData.jsx # Show raw transaction
│   ├── TransactionPreview.jsx # Transaction preview
│   ├── TransactionHistory.jsx # Transaction history
│   ├── WalletManager.jsx # Wallet management
│   ├── NetworkSelector.jsx # Network selection
│   ├── ABILoader.jsx    # ABI loader and function selector
│   ├── CopyButton.jsx   # Copy to clipboard button
│   ├── QRCodeModal.jsx  # QR code modal
│   ├── TemplateManager.jsx # Template management
│   ├── SettingsManager.jsx # Settings export/import
│   └── LoadingSpinner.jsx # Loading indicator
├── utils/               # Utility functions
│   ├── clipboard.js     # Clipboard operations
│   ├── qrcode.js        # QR code generation
│   ├── templates.js     # Template management
│   └── settings.js      # Settings export/import
├── txbuilder.js         # Core transaction building logic
├── offlinetx.js         # CLI tool for transaction signing
├── etherscan.js         # Etherscan API wrapper
├── networks.js          # Network configurations
├── validation.js        # Form validation utilities
├── gasEstimator.js      # Gas estimation utilities
├── abiParser.js         # ABI parsing utilities
├── transactionHistory.js # Transaction history management
├── walletManager.js     # Wallet management utilities
├── theme.js             # Theme management
└── utils.js             # General utilities
├── contracts/
│   ├── SampleContract.sol   # Sample smart contract
│   ├── deploy.js            # Contract deployment script
│   └── contracts.json       # Compiled contract ABI/bytecode
├── tests/                   # Test scripts
└── webpack.config.js        # Build configuration
```

## Security Notes

- **Private Keys**: All private keys are stored in browser localStorage. Keep your browser secure!
- **No Server**: This is a client-side application. No data is sent to external servers except Etherscan API calls.
- **Offline Capable**: You can build transactions offline. Only gas estimation and sending require API access.
- **Backup**: Regularly export your settings as a backup.

## Browser Support

- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers supported

## Development

```bash
# Development server with hot reload
npm start

# Production build
npm run build

# Clean build artifacts
npm run clean
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with React and Bootstrap
- Uses Etherscan.io API for blockchain data
- Transaction signing with ethers-wallet
- ABI encoding with ethereumjs-abi
