/**
 * ABI parser utilities for contract interaction
 */

/**
 * Parse ABI JSON and extract function signatures
 * @param {string|object} abi - ABI as JSON string or object
 * @returns {object} { functions: array, error: string|null }
 */
export function parseABI(abi) {
  try {
    const abiObj = typeof abi === 'string' ? JSON.parse(abi) : abi;

    if (!Array.isArray(abiObj)) {
      return { functions: [], error: 'ABI must be an array' };
    }

    const functions = abiObj
      .filter(item => item.type === 'function')
      .map(item => {
        const inputs = item.inputs || [];
        const inputTypes = inputs.map(input => input.type).join(',');
        const signature = `${item.name}(${inputTypes})`;

        return {
          name: item.name,
          signature,
          inputs,
          outputs: item.outputs || [],
          stateMutability: item.stateMutability || (item.payable ? 'payable' : 'nonpayable'),
          payable: item.payable || false,
          constant: item.constant || false,
        };
      });

    return { functions, error: null };
  } catch (e) {
    return { functions: [], error: `Invalid ABI format: ${e.message}` };
  }
}

/**
 * Get function by signature from parsed ABI
 * @param {array} functions - Parsed functions array
 * @param {string} signature - Function signature to find
 * @returns {object|null} Function object or null
 */
export function getFunctionBySignature(functions, signature) {
  return functions.find(f => f.signature === signature) || null;
}

/**
 * Generate parameter input fields based on function inputs
 * @param {array} inputs - Function inputs array from ABI
 * @returns {array} Array of input field configurations
 */
export function generateParameterFields(inputs) {
  return inputs.map((input, index) => ({
    name: input.name || `param${index}`,
    type: input.type,
    required: true,
    placeholder: `${input.type}${input.name ? ` (${input.name})` : ''}`,
  }));
}

