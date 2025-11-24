import Web3 from 'web3';

const web3 = new Web3();

/**
 * Validation utilities for Ethereum addresses, private keys, and other inputs
 */

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {object} { valid: boolean, error: string|null, checksummed: string|null }
 */
export function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Address is required', checksummed: null };
  }

  if (!address.startsWith('0x')) {
    return { valid: false, error: 'Address must start with 0x', checksummed: null };
  }

  if (address.length !== 42) {
    return { valid: false, error: 'Address must be 42 characters (0x + 40 hex chars)', checksummed: null };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return { valid: false, error: 'Address contains invalid characters', checksummed: null };
  }

  try {
    // Convert to checksummed address
    const checksummed = web3.toChecksumAddress(address);
    return { valid: true, error: null, checksummed };
  } catch (e) {
    return { valid: false, error: 'Invalid address format', checksummed: null };
  }
}

/**
 * Validate private key format
 * @param {string} privateKey - Private key to validate
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validatePrivateKey(privateKey) {
  if (!privateKey || typeof privateKey !== 'string') {
    return { valid: false, error: 'Private key is required' };
  }

  if (!privateKey.startsWith('0x')) {
    return { valid: false, error: 'Private key must start with 0x' };
  }

  if (privateKey.length !== 66) {
    return { valid: false, error: 'Private key must be 66 characters (0x + 64 hex chars)' };
  }

  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) {
    return { valid: false, error: 'Private key contains invalid characters' };
  }

  return { valid: true, error: null };
}

/**
 * Validate hex string
 * @param {string} hex - Hex string to validate
 * @param {string} fieldName - Name of the field for error messages
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateHex(hex, fieldName = 'Value') {
  if (!hex || typeof hex !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (!hex.startsWith('0x')) {
    return { valid: false, error: `${fieldName} must start with 0x` };
  }

  if (!/^0x[a-fA-F0-9]+$/.test(hex)) {
    return { valid: false, error: `${fieldName} contains invalid hex characters` };
  }

  return { valid: true, error: null };
}

/**
 * Validate gas limit
 * @param {string} gasLimit - Gas limit in hex
 * @returns {object} { valid: boolean, error: string|null, value: number|null }
 */
export function validateGasLimit(gasLimit) {
  const hexValidation = validateHex(gasLimit, 'Gas limit');
  if (!hexValidation.valid) {
    return hexValidation;
  }

  try {
    const value = parseInt(gasLimit, 16);
    if (value <= 0) {
      return { valid: false, error: 'Gas limit must be greater than 0', value: null };
    }
    if (value > 30000000) {
      return { valid: false, error: 'Gas limit seems too high (max 30M)', value: null };
    }
    return { valid: true, error: null, value };
  } catch (e) {
    return { valid: false, error: 'Invalid gas limit format', value: null };
  }
}

/**
 * Validate function signature format
 * @param {string} signature - Function signature (e.g., "setValue(uint256)")
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateFunctionSignature(signature) {
  if (!signature || typeof signature !== 'string') {
    return { valid: false, error: 'Function signature is required' };
  }

  // Basic validation: should have function name and optionally parameters in parentheses
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\)$/.test(signature.trim())) {
    return { valid: false, error: 'Invalid function signature format. Use: functionName(type1,type2)' };
  }

  return { valid: true, error: null };
}

