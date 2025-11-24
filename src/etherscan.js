// Polyfills
require('babel-core/register'); // http://stackoverflow.com/a/33527883/315168
require('babel-polyfill'); // http://stackoverflow.com/a/33527883/315168
require('es6-promise').polyfill(); // https://github.com/matthew-andrews/isomorphic-fetch

import fetch from 'isomorphic-fetch';
import Web3 from 'web3';

const web3 = new Web3();

/**
 * Custom error class for API call failures
 */
export class APIError extends Error {
}


/**
 * Etherscan API wrapper class
 * Provides methods to interact with Etherscan API for blockchain data
 */
export class API {
  /**
   * Create a new API instance
   * @param {string} baseURL - Base URL for Etherscan API (e.g., https://api.etherscan.io/api)
   * @param {string} apiKey - Etherscan API key
   */
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  /**
   * Perform an async HTTP request to EtherScan API
   * @param {object} params - Query parameters for the API request
   * @returns {Promise<*>} API response result
   * @throws {APIError} If the API returns an error
   */
  async makeRequest(params) {
    // Build query string from parameters
    // http://stackoverflow.com/a/34209399/315168
    const esc = encodeURIComponent;
    const query = Object.keys(params)
      .map(k => `${esc(k)}=${esc(params[k])}`)
      .join('&');

    const response = await fetch(`${this.baseURL}?${query}`);
    const data = await response.json();

    if (data.error) {
      // Example error: {"jsonrpc":"2.0","error":{"code":-32010,"message":"Insufficient funds..."},"id":1}
      throw new APIError(data.error.message);
    }

    // eslint-disable-next-line no-console
    console.log('API result', data);
    return data.result;
  }

  /**
   * Get account balance in ETH
   * @param {string} address - Ethereum address to check balance for
   * @returns {Promise<string>} Balance in ETH as a string
   */
  async getBalance(address) {
    // API endpoint: https://api.etherscan.io/api?module=account&action=balance&address=...
    const params = {
      apikey: this.apiKey,
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest',
    };
    const balance = await this.makeRequest(params);
    if (balance) {
      return web3.fromWei(balance, 'ether');
    }
    return balance;
  }

  /**
   * Get sent transaction count, including transactions in memory pool.
   * This can be used to determine the next nonce.
   *
   * @param {string} address - Ethereum address
   * @returns {Promise<string>} Transaction count as hexadecimal string
   */
  async getTransactionCount(address) {
    const params = {
      apikey: this.apiKey,
      module: 'proxy',
      action: 'eth_GetTransactionCount',
      address,
      tag: 'pending',
    };
    return await this.makeRequest(params);
  }

  /**
   * Broadcast a raw signed transaction to the network
   *
   * @param {string} data - Raw signed transaction as hexadecimal string
   * @returns {Promise<string>} Transaction hash
   * @throws {Error} If transaction data is invalid
   */
  async sendRaw(data) {
    if (!data.startsWith('0x')) {
      throw new Error(`Data does not look like 0x hex string: ${data}`);
    }

    const params = {
      apikey: this.apiKey,
      module: 'proxy',
      action: 'eth_sendRawTransaction',
      hex: data,
      tag: 'latest',
    };
    return await this.makeRequest(params);
  }

  /**
   * Get current gas price from the network
   * @returns {Promise<string>} Gas price in wei as hexadecimal string
   */
  async getGasPrice() {
    const params = {
      apikey: this.apiKey,
      module: 'proxy',
      action: 'eth_gasPrice',
    };
    return await this.makeRequest(params);
  }
}
