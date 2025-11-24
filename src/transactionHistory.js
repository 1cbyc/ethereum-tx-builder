/**
 * Transaction history management utilities
 */

const HISTORY_KEY = 'ethereum_tx_history';
const MAX_HISTORY = 50; // Keep last 50 transactions

/**
 * Get transaction history from localStorage
 * @returns {Array} Array of transaction objects
 */
export function getTransactionHistory() {
  try {
    const history = window.localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    console.error('Error reading transaction history:', e);
    return [];
  }
}

/**
 * Save a transaction to history
 * @param {object} txData - Transaction data
 * @param {string} txData.hash - Transaction hash
 * @param {string} txData.from - From address
 * @param {string} txData.to - To address
 * @param {string} txData.network - Network ID
 * @param {string} txData.explorerURL - Explorer URL
 * @param {string} txData.functionSignature - Function signature (optional)
 * @param {string} txData.value - Value in ETH
 * @param {string} txData.gasLimit - Gas limit
 * @param {string} txData.gasPrice - Gas price
 */
export function saveTransaction(txData) {
  try {
    const history = getTransactionHistory();
    const tx = {
      ...txData,
      timestamp: Date.now(),
      date: new Date().toISOString(),
    };

    // Add to beginning of array
    history.unshift(tx);

    // Keep only last MAX_HISTORY transactions
    const trimmed = history.slice(0, MAX_HISTORY);

    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    return true;
  } catch (e) {
    console.error('Error saving transaction:', e);
    return false;
  }
}

/**
 * Clear transaction history
 */
export function clearHistory() {
  try {
    window.localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (e) {
    console.error('Error clearing history:', e);
    return false;
  }
}

/**
 * Get transactions for a specific address
 * @param {string} address - Ethereum address
 * @returns {Array} Filtered transaction history
 */
export function getTransactionsForAddress(address) {
  const history = getTransactionHistory();
  return history.filter(tx => tx.from && tx.from.toLowerCase() === address.toLowerCase());
}

/**
 * Get transactions for a specific network
 * @param {string} networkId - Network ID
 * @returns {Array} Filtered transaction history
 */
export function getTransactionsForNetwork(networkId) {
  const history = getTransactionHistory();
  return history.filter(tx => tx.network === networkId);
}

