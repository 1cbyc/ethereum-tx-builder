import Web3 from 'web3';
import { API } from './etherscan';

const web3 = new Web3();

/**
 * Gas estimation utilities
 */

/**
 * Estimate gas limit for a transaction
 * @param {object} params - Transaction parameters
 * @param {string} params.apiURL - Etherscan API URL
 * @param {string} params.apiKey - Etherscan API key
 * @param {string} params.from - From address
 * @param {string} params.to - To address (contract)
 * @param {string} params.data - Transaction data (hex)
 * @param {string} params.value - Value in wei (hex, optional)
 * @returns {Promise<object>} { gasLimit: string (hex), error: string|null }
 */
export async function estimateGasLimit({ apiURL, apiKey, from, to, data, value = '0x0' }) {
  if (!apiURL || !apiKey) {
    return { gasLimit: null, error: 'API URL and API key required for gas estimation' };
  }

  if (!from || !to) {
    return { gasLimit: null, error: 'From and to addresses required' };
  }

  try {
    // Use Etherscan's eth_estimateGas proxy method
    const params = {
      apikey: apiKey,
      module: 'proxy',
      action: 'eth_estimateGas',
      to,
      from,
      value,
      data: data || '0x',
    };

    // Build query string
    const esc = encodeURIComponent;
    const query = Object.keys(params)
      .map(k => `${esc(k)}=${esc(params[k])}`)
      .join('&');

    const response = await fetch(`${apiURL}?${query}`);
    const result = await response.json();

    if (result.error) {
      return { gasLimit: null, error: result.error.message || 'Gas estimation failed' };
    }

    if (result.result) {
      // Add 20% buffer for safety
      const estimated = parseInt(result.result, 16);
      const buffered = Math.floor(estimated * 1.2);
      return { gasLimit: `0x${buffered.toString(16)}`, error: null };
    }

    return { gasLimit: null, error: 'No gas estimate returned' };
  } catch (e) {
    return { gasLimit: null, error: `Gas estimation error: ${e.message}` };
  }
}

/**
 * Calculate transaction cost in ETH
 * @param {string} gasLimit - Gas limit (hex)
 * @param {string} gasPrice - Gas price in wei (hex)
 * @returns {object} { wei: string, eth: string, gwei: string }
 */
export function calculateTransactionCost(gasLimit, gasPrice) {
  try {
    const limit = parseInt(gasLimit, 16);
    const price = parseInt(gasPrice, 16);
    const wei = limit * price;
    const eth = web3.fromWei(wei.toString(), 'ether');
    const gwei = web3.fromWei(price.toString(), 'gwei');

    return {
      wei: `0x${wei.toString(16)}`,
      eth: eth.toString(),
      gwei: parseFloat(gwei).toFixed(2),
    };
  } catch (e) {
    return { wei: '0x0', eth: '0', gwei: '0' };
  }
}

/**
 * Get gas price suggestions (slow, standard, fast)
 * @param {string} apiURL - Etherscan API URL
 * @param {string} apiKey - Etherscan API key
 * @returns {Promise<object>} { slow: string, standard: string, fast: string, error: string|null }
 */
export async function getGasPriceSuggestions(apiURL, apiKey) {
  if (!apiURL || !apiKey) {
    return { slow: null, standard: null, fast: null, error: 'API URL and key required' };
  }

  try {
    const api = new API(apiURL, apiKey);
    const currentGasPrice = await api.getGasPrice();

    if (!currentGasPrice) {
      return { slow: null, standard: null, fast: null, error: 'Could not fetch gas price' };
    }

    const basePrice = parseInt(currentGasPrice, 16);

    return {
      slow: `0x${Math.floor(basePrice * 0.9).toString(16)}`,
      standard: currentGasPrice,
      fast: `0x${Math.floor(basePrice * 1.1).toString(16)}`,
      error: null,
    };
  } catch (e) {
    return { slow: null, standard: null, fast: null, error: e.message };
  }
}

