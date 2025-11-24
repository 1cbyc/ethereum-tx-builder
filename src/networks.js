/**
 * Network configurations for different Ethereum networks
 */
export const NETWORKS = {
  mainnet: {
    name: 'Ethereum Mainnet',
    id: 'mainnet',
    apiURL: 'https://api.etherscan.io/api',
    explorerURL: 'https://etherscan.io',
    chainId: 1,
    currency: 'ETH'
  },
  sepolia: {
    name: 'Sepolia Testnet',
    id: 'sepolia',
    apiURL: 'https://api-sepolia.etherscan.io/api',
    explorerURL: 'https://sepolia.etherscan.io',
    chainId: 11155111,
    currency: 'ETH'
  },
  goerli: {
    name: 'Goerli Testnet',
    id: 'goerli',
    apiURL: 'https://api-goerli.etherscan.io/api',
    explorerURL: 'https://goerli.etherscan.io',
    chainId: 5,
    currency: 'ETH'
  },
  ropsten: {
    name: 'Ropsten Testnet',
    id: 'ropsten',
    apiURL: 'https://api-ropsten.etherscan.io/api',
    explorerURL: 'https://ropsten.etherscan.io',
    chainId: 3,
    currency: 'ETH'
  }
};

export function getNetworkById(id) {
  return NETWORKS[id] || NETWORKS.mainnet;
}

export function getDefaultNetwork() {
  const saved = window.localStorage.getItem('selectedNetwork');
  return saved ? getNetworkById(saved) : NETWORKS.mainnet;
}

