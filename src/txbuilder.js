import Wallet from 'ethers-wallet';
import { simpleEncode } from 'ethereumjs-abi';

/**
 * Get an Ethereum public address from a private key.
 *
 * @param {string} privateKey - Private key as 32 bytes hexadecimal string starting with 0x
 * @returns {string|null} 0x hexadecimal address or null if the private key is invalid
 */
export function getAddressFromPrivateKey(privateKey) {
  try {
    const wallet = new Wallet(privateKey);
    return wallet.address;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Could not parse private key', privateKey, e);
    return null;
  }
}

/**
 * Calculate the nonce for the next outbound transaction from the address.
 *
 * @param {number} txCount - How many transactions the address has sent
 * @param {number} testnetOffset - Offset for testnet (0 for most networks)
 * @param {number} internalOffset - Internal offset, always increase +1 when sending a tx
 * @returns {number} Calculated nonce value
 */
export function calculateNonce(txCount, testnetOffset, internalOffset) {
  return txCount + testnetOffset + internalOffset;
}


/**
 * Create data field based on smart contract function signature and arguments.
 *
 * @param {string} functionSignature - Function signature, e.g., "setValue(uint256)"
 * @param {string} functionParameters - Comma-separated parameter values, e.g., "200,300"
 * @returns {string} 0x prefixed hex string representing the encoded function call
 * @throws {Error} If function signature or parameters are invalid
 */
export function encodeDataPayload(functionSignature, functionParameters) {
  if (typeof functionSignature !== 'string') {
    throw new Error(`Bad function signature: ${functionSignature}`);
  }

  if (typeof functionParameters !== 'string') {
    throw new Error(`Bad function parameter: ${functionSignature}`);
  }

  // Construct function call data payload using ethereumjs-abi
  // https://github.com/ethereumjs/ethereumjs-abi
  const params = functionParameters.split(',').filter(x => x.trim());
  const signatureArgs = [functionSignature].concat(params);
  return `0x${simpleEncode.apply(this, signatureArgs).toString('hex')}`;
}

/**
 * Build a raw signed transaction for contract function calls or ETH transfers.
 *
 * @param {object} params - Transaction parameters
 * @param {string} params.contractAddress - Contract address (or recipient for ETH transfers)
 * @param {string} params.privateKey - Private key as 0x prefixed hexadecimal
 * @param {number} params.nonce - Transaction nonce (must increment for each tx)
 * @param {string|null} params.functionSignature - Function signature, e.g., "setValue(uint256)"
 * @param {string|null} params.functionParameters - Function parameters as comma-separated string
 * @param {string} params.value - Value in wei as hexadecimal string (default: "0x0")
 * @param {string} params.gasLimit - Gas limit as hexadecimal string
 * @param {string} params.gasPrice - Gas price in wei as hexadecimal string
 * @returns {string} Raw signed transaction as hexadecimal string
 * @throws {Error} If required parameters are missing or invalid
 */
export function buildTx({
  contractAddress,
  privateKey,
  nonce,
  functionSignature,
  functionParameters,
  value,
  gasLimit,
  gasPrice,
}) {
  const wallet = new Wallet(privateKey);

  if (!gasLimit) {
    throw new Error('Gas limit is required.');
  }

  const txValue = value === undefined ? '0x0' : value;

  if (!gasPrice) {
    throw new Error('Gas price is required.');
  }

  if (nonce === undefined) {
    throw new Error('Cannot send a transaction without a nonce.');
  }

  let data;
  if (functionSignature && functionParameters) {
    data = encodeDataPayload(functionSignature, functionParameters);
  } else {
    data = undefined;
  }

  const txData = {
    nonce,
    to: contractAddress,
    gasLimit,
    gasPrice,
    value: txValue,
    data,
  };

  // Sign transaction using ethers-wallet
  const tx = wallet.sign(txData);

  return tx;
}