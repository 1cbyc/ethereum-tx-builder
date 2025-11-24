import React from 'react';
import { Panel, Table, Label } from 'react-bootstrap';
import Web3 from 'web3';
import { calculateTransactionCost } from '../gasEstimator';

const web3 = new Web3();

/**
 * Transaction preview component showing decoded transaction details
 */
function TransactionPreview({ state }) {
  const targetAddress = state.transactionType === 'eth' 
    ? state.recipientAddress 
    : state.contractAddress;
  
  if (!state.rawTx || !targetAddress) {
    return null;
  }

  const gasLimit = state.gasLimit || '0x0';
  const gasPrice = state.gasPrice || '0x0';
  const cost = calculateTransactionCost(gasLimit, gasPrice);

  // Decode function signature if available
  let decodedParams = [];

  if (state.functionSignature) {
    const params = state.functionParameters ?
      state.functionParameters.split(',').map(p => p.trim()) : [];
    decodedParams = params;
  }

  const explorerURL = state.explorerURL || 'https://etherscan.io';

  return (
    <div style={{ marginTop: '20px' }}>
      <Panel header={<h3>Transaction Preview</h3>} bsStyle="info">
        <Table striped bordered condensed hover>
          <tbody>
            <tr>
              <td><strong>From</strong></td>
              <td>
                <code>{state.address}</code>
                <a
                  href={`${explorerURL}/address/${state.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px' }}
                >
                  View on Explorer
                </a>
              </td>
            </tr>
            <tr>
              <td><strong>To</strong></td>
              <td>
                <code>{targetAddress}</code>
                <a
                  href={`${explorerURL}/address/${targetAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginLeft: '10px' }}
                >
                  {state.transactionType === 'eth' ? 'View Address' : 'View Contract'}
                </a>
              </td>
            </tr>
            {state.transactionType === 'contract' && (
              <tr>
                <td><strong>Function</strong></td>
                <td><code>{state.functionSignature || 'N/A'}</code></td>
              </tr>
            )}
            {state.transactionType === 'contract' && decodedParams.length > 0 && (
              <tr>
                <td><strong>Parameters</strong></td>
                <td>
                  {decodedParams.map((param, idx) => (
                    <Label key={idx} bsStyle="default" style={{ marginRight: '5px' }}>
                      {param}
                    </Label>
                  ))}
                </td>
              </tr>
            )}
            <tr>
              <td><strong>Value</strong></td>
              <td>
                {state.value && state.value !== '0x0'
                  ? `${web3.fromWei(state.value, 'ether')} ETH`
                  : '0 ETH'
                }
              </td>
            </tr>
            <tr>
              <td><strong>Gas Limit</strong></td>
              <td>
                <code>{gasLimit}</code> ({parseInt(gasLimit, 16).toLocaleString()})
              </td>
            </tr>
            <tr>
              <td><strong>Gas Price</strong></td>
              <td>
                <code>{gasPrice}</code> ({cost.gwei} Gwei)
              </td>
            </tr>
            <tr>
              <td><strong>Estimated Cost</strong></td>
              <td>
                <strong>{cost.eth} ETH</strong>
                {state.balance && parseFloat(state.balance) > 0 && (
                  <span style={{ marginLeft: '10px', color: parseFloat(state.balance) < parseFloat(cost.eth) ? 'red' : 'green' }}>
                    (Balance: {state.balance} ETH)
                  </span>
                )}
              </td>
            </tr>
            <tr>
              <td><strong>Nonce</strong></td>
              <td><code>0x{state.nonce.toString(16)}</code></td>
            </tr>
          </tbody>
        </Table>
        
        {state.balance && parseFloat(state.balance) < parseFloat(cost.eth) && (
          <div className="alert alert-danger" style={{ marginTop: '15px' }}>
            <strong>Warning:</strong> Insufficient balance. You need {cost.eth} ETH but only
            have {state.balance} ETH.
          </div>
        )}
      </Panel>
    </div>
  );
}

TransactionPreview.propTypes = {
  state: React.PropTypes.object.isRequired,
};

export default TransactionPreview;

