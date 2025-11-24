/**
 * Wallet management utilities for storing multiple wallets
 */

const WALLETS_KEY = 'ethereum_wallets';

/**
 * Get all saved wallets
 * @returns {Array} Array of wallet objects
 */
export function getWallets() {
  try {
    const wallets = window.localStorage.getItem(WALLETS_KEY);
    return wallets ? JSON.parse(wallets) : [];
  } catch (e) {
    console.error('Error reading wallets:', e);
    return [];
  }
}

/**
 * Save a wallet
 * @param {object} walletData - Wallet data
 * @param {string} walletData.privateKey - Private key (will be stored as-is, not encrypted)
 * @param {string} walletData.label - Wallet label/name
 * @param {string} walletData.address - Derived address (optional, will be calculated if not provided)
 * @returns {boolean} Success status
 */
export function saveWallet(walletData) {
  try {
    const wallets = getWallets();
    
    // Check if wallet with this address already exists
    const existingIndex = wallets.findIndex(w => w.address === walletData.address);
    
    const wallet = {
      label: walletData.label || `Wallet ${wallets.length + 1}`,
      address: walletData.address,
      privateKey: walletData.privateKey,
      createdAt: Date.now(),
    };

    if (existingIndex >= 0) {
      // Update existing wallet
      wallets[existingIndex] = { ...wallets[existingIndex], ...wallet };
    } else {
      // Add new wallet
      wallets.push(wallet);
    }

    window.localStorage.setItem(WALLETS_KEY, JSON.stringify(wallets));
    return true;
  } catch (e) {
    console.error('Error saving wallet:', e);
    return false;
  }
}

/**
 * Delete a wallet by address
 * @param {string} address - Wallet address
 * @returns {boolean} Success status
 */
export function deleteWallet(address) {
  try {
    const wallets = getWallets();
    const filtered = wallets.filter(w => w.address !== address);
    window.localStorage.setItem(WALLETS_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Error deleting wallet:', e);
    return false;
  }
}

/**
 * Get wallet by address
 * @param {string} address - Wallet address
 * @returns {object|null} Wallet object or null
 */
export function getWalletByAddress(address) {
  const wallets = getWallets();
  return wallets.find(w => w.address.toLowerCase() === address.toLowerCase()) || null;
}

