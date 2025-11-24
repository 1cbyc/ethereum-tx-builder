import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import {
  Form, FormGroup, FormControl, Button, Col, ControlLabel, Alert, ButtonGroup,
} from 'react-bootstrap';

import { getQueryParameterByName } from '../utils';
import AccountInfo from './AccountInfo';
import TransactionData from './TransactionData';
import TransactionPreview from './TransactionPreview';
import TransactionHistory from './TransactionHistory';
import WalletManager from './WalletManager';
import NetworkSelector from './NetworkSelector';
import ABILoader from './ABILoader';
import CopyButton from './CopyButton';
import QRCodeModal from './QRCodeModal';
import TemplateManager from './TemplateManager';
import SettingsManager from './SettingsManager';
import LoadingSpinner from './LoadingSpinner';
import { API } from '../etherscan';
import { saveTransaction } from '../transactionHistory';
import {
  getAddressFromPrivateKey, buildTx, calculateNonce, encodeDataPayload,
} from '../txbuilder';
import { getDefaultNetwork, getNetworkById } from '../networks';
import {
  validateAddress, validatePrivateKey, validateHex, validateGasLimit,
  validateFunctionSignature,
} from '../validation';
import {
  estimateGasLimit, getGasPriceSuggestions, calculateTransactionCost,
} from '../gasEstimator';
import Web3 from 'web3';

const web3 = new Web3();


/**
 * Transaction builder user interface.
 */
@observer
class Signer extends React.Component {

  constructor(props) {
    super(props);

    // Fetch signer state from URL/localStorage on app init
    const url = window.location.href;
    const privateKey = getQueryParameterByName('privateKey', url) ||
      window.localStorage.getItem('privateKey') || '';

    // Initialize network
    const defaultNetwork = getDefaultNetwork();
    const savedApiURL = getQueryParameterByName('apiURL', url) ||
      window.localStorage.getItem('apiURL') || '';

    // Define the state of the signing component
    this.state = observable({
      selectedNetwork: defaultNetwork,
      apiURL: savedApiURL || defaultNetwork.apiURL,
      explorerURL: defaultNetwork.explorerURL,
      transactionType: window.localStorage.getItem('transactionType') || 'contract',
      privateKey,
      contractAddress: getQueryParameterByName('contractAddress', url) ||
        window.localStorage.getItem('contractAddress') || '',
      recipientAddress: window.localStorage.getItem('recipientAddress') || '',
      apiKey: getQueryParameterByName('apiKey', url) ||
        window.localStorage.getItem('apiKey') || '',
      functionSignature: window.localStorage.getItem('functionSignature') || '',
      functionParameters: window.localStorage.getItem('functionParameters') || '',
      gasLimit: window.localStorage.getItem('gasLimit') || '',
      gasPrice: window.localStorage.getItem('gasPrice') || '',
      value: window.localStorage.getItem('value') || '0x0',
      address: getAddressFromPrivateKey(privateKey) || '',
      balance: '',
      rawTx: '',
      nonce: '', // Calculated nonce as int
      sendStatus: false, // True when send in progress
      sendError: null,
      sentTxHash: null, // Point to etherscan.io tx
      baseNonce: 0, // How many txs has gone out from the address
      nonceOffset: 0, // Maintain internal state of added nonces
      testnetOffset: 0, // What is the nonce start point for the current network
      // Validation states
      addressValidation: { valid: true, error: null },
      privateKeyValidation: { valid: true, error: null },
      gasLimitValidation: { valid: true, error: null },
      gasPriceValidation: { valid: true, error: null },
      functionSignatureValidation: { valid: true, error: null },
      // Gas estimation
      estimatingGas: false,
      gasEstimateError: null,
      gasPriceSuggestions: { slow: null, standard: null, fast: null },
      // Transaction preview
      showPreview: false,
      // QR Code modals
      showTxQRCode: false,
      showAddressQRCode: false,
    });
  }

  // Refresh address data when the app is loaded
  componentDidMount() {
    const updateAddressData = this.updateAddressData.bind(this);
    const loadGasPriceSuggestions = this.loadGasPriceSuggestions.bind(this);
    async function init() {
      await updateAddressData();
      await loadGasPriceSuggestions();
    }
    init();
  }

  // Update data about the address after fetched over API
  @action
  setAddressData(address, balance, nonce) {
    this.state.address = address;
    this.state.balance = balance;
    this.state.nonce = nonce;
  }

  // Handle network change
  @action
  handleNetworkChange(network) {
    this.state.selectedNetwork = network;
    this.state.apiURL = network.apiURL;
    this.state.explorerURL = network.explorerURL;
    window.localStorage.setItem('apiURL', network.apiURL);
    window.localStorage.setItem('selectedNetwork', network.id);
    this.updateAddressData();
    this.loadGasPriceSuggestions();
  }

  // Load gas price suggestions
  @action
  async loadGasPriceSuggestions() {
    if (this.state.apiKey && this.state.apiURL) {
      const suggestions = await getGasPriceSuggestions(this.state.apiURL, this.state.apiKey);
      this.state.gasPriceSuggestions = suggestions;
      if (!this.state.gasPrice && suggestions.standard) {
        this.state.gasPrice = suggestions.standard;
      }
    }
  }

  // Estimate gas limit
  @action
  async estimateGas() {
    if (!this.state.contractAddress || !this.state.address) {
      this.state.gasEstimateError = 'Contract address and wallet address required';
      return;
    }

    this.state.estimatingGas = true;
    this.state.gasEstimateError = null;

    try {
      let data = '0x';
      if (this.state.functionSignature && this.state.functionParameters) {
        data = encodeDataPayload(
          this.state.functionSignature,
          this.state.functionParameters,
        );
      }

      const targetAddress = this.state.transactionType === 'eth'
        ? this.state.recipientAddress
        : this.state.contractAddress;

      if (!targetAddress) {
        this.state.gasEstimateError = 'Target address required';
        this.state.estimatingGas = false;
        return;
      }

      const result = await estimateGasLimit({
        apiURL: this.state.apiURL,
        apiKey: this.state.apiKey,
        from: this.state.address,
        to: targetAddress,
        data,
        value: this.state.value || '0x0',
      });

      if (result.error) {
        this.state.gasEstimateError = result.error;
      } else if (result.gasLimit) {
        this.state.gasLimit = result.gasLimit;
        window.localStorage.setItem('gasLimit', result.gasLimit);
        this.state.gasLimitValidation = validateGasLimit(result.gasLimit);
      }
    } catch (e) {
      this.state.gasEstimateError = `Gas estimation failed: ${e.message}`;
    } finally {
      this.state.estimatingGas = false;
    }
  }

  // Validate form fields
  @action
  validateField(fieldName, value) {
    switch (fieldName) {
      case 'contractAddress':
        if (value) {
          this.state.addressValidation = validateAddress(value);
          if (this.state.addressValidation.checksummed) {
            this.state.contractAddress = this.state.addressValidation.checksummed;
          }
        } else {
          this.state.addressValidation = { valid: true, error: null };
        }
        break;
      case 'privateKey':
        this.state.privateKeyValidation = validatePrivateKey(value);
        break;
      case 'gasLimit':
        if (value) {
          this.state.gasLimitValidation = validateGasLimit(value);
        } else {
          this.state.gasLimitValidation = { valid: true, error: null };
        }
        break;
      case 'gasPrice':
        if (value) {
          this.state.gasPriceValidation = validateHex(value, 'Gas price');
        } else {
          this.state.gasPriceValidation = { valid: true, error: null };
        }
        break;
      case 'functionSignature':
        if (value) {
          this.state.functionSignatureValidation = validateFunctionSignature(value);
        } else {
          this.state.functionSignatureValidation = { valid: true, error: null };
        }
        break;
      default:
        // No validation needed for other fields
        break;
    }
  }

  // Handle function selection from ABI loader
  @action
  handleFunctionSelect(func) {
    this.state.functionSignature = func.signature;
    window.localStorage.setItem('functionSignature', func.signature);
    this.validateField('functionSignature', func.signature);
  }

  // Handle Send transaction button
  @action
  sendTransaction() {
    const updateAddressData = this.updateAddressData.bind(this);
    const { state } = this;

    state.sentTxHash = null;
    state.sendError = null;

    const sendTx = async () => {
      state.sendStatus = true;
      const api = new API(state.apiURL, state.apiKey);

      try {
        // Fetch gas price if not provided
        let gasPrice = state.gasPrice;
        if (!gasPrice && state.apiKey && state.apiURL) {
          gasPrice = await api.getGasPrice();
        }

        if (!gasPrice) {
          throw new Error(
            'Gas price is required. Please provide it or ensure API key and URL are set.',
          );
        }

        if (!state.gasLimit) {
          throw new Error('Gas limit is required.');
        }

        // Validate before sending
        if (!state.addressValidation.valid) {
          const errorMsg = state.transactionType === 'eth'
            ? `Invalid recipient address: ${state.addressValidation.error}`
            : `Invalid contract address: ${state.addressValidation.error}`;
          throw new Error(errorMsg);
        }

        if (state.transactionType === 'eth' && (!state.value || state.value === '0x0')) {
          throw new Error('ETH amount is required for ETH transfer');
        }
        if (!state.privateKeyValidation.valid) {
          throw new Error(`Invalid private key: ${state.privateKeyValidation.error}`);
        }
        if (!state.gasLimitValidation.valid) {
          throw new Error(`Invalid gas limit: ${state.gasLimitValidation.error}`);
        }

        // Determine target address based on transaction type
        const targetAddress = state.transactionType === 'eth'
          ? state.recipientAddress
          : state.contractAddress;

        if (!targetAddress) {
          const errorMsg = state.transactionType === 'eth'
            ? 'Recipient address is required for ETH transfer'
            : 'Contract address is required for contract call';
          throw new Error(errorMsg);
        }

        // Build transaction with fetched/provided values
        const txParams = {
          contractAddress: targetAddress,
          privateKey: state.privateKey,
          nonce: state.nonce,
          functionSignature: state.transactionType === 'eth' ? null : state.functionSignature,
          functionParameters: state.transactionType === 'eth' ? null : state.functionParameters,
          value: state.value || '0x0',
          gasLimit: state.gasLimit,
          gasPrice,
        };

        state.rawTx = buildTx(txParams);
        state.showPreview = true;
        state.sentTxHash = await api.sendRaw(state.rawTx);
        // eslint-disable-next-line no-console
        console.log('Transaction sent, hash', state.sentTxHash);
        state.nonceOffset += 1;

        // Save to transaction history
        const txValue = state.value && state.value !== '0x0'
          ? web3.fromWei(state.value, 'ether')
          : '0';
        const targetAddr = state.transactionType === 'eth'
          ? state.recipientAddress
          : state.contractAddress;
        saveTransaction({
          hash: state.sentTxHash,
          from: state.address,
          to: targetAddr,
          network: state.selectedNetwork.id,
          explorerURL: state.explorerURL,
          functionSignature: state.transactionType === 'eth' ? null : state.functionSignature,
          value: txValue,
          gasLimit: state.gasLimit,
          gasPrice: state.gasPrice,
        });
      } catch (e) {
        state.sendError = String(e);
        // eslint-disable-next-line no-console
        console.log(e);
      }

      await updateAddressData();
      state.sendStatus = false;
    };

    // Sent tx offline
    if (state.apiKey && state.apiURL) {
      sendTx();
    } else {
      state.sendError = 'API key and API URL are required to send transactions.';
    }
  }

  // Update the Ethereum address balance from etherscan.io API
  async updateAddressData() {
    const { state } = this;
    const address = getAddressFromPrivateKey(state.privateKey);

    // eslint-disable-next-line no-console
    console.log('Address for private key', state.privateKey, 'is', state.address);

    if (!address) {
      this.setAddressData('Could not resolve address', '', '');
      return;
    }
    state.address = address;

    // eslint-disable-next-line no-console
    console.log('Updating address information for', address, state);

    if (!address || !state.apiKey) {
      // No address available
      return;
    }
    const api = new API(state.apiURL, state.apiKey);
    const balance = await api.getBalance(address) || '';

    state.baseNonce = await api.getTransactionCount(address) || '';
    if (state.baseNonce) {
      state.baseNonce = parseInt(state.baseNonce, 16);
    }

    const nonce = calculateNonce(state.baseNonce, state.testnetOffset, state.nonceOffset);

    this.setAddressData(address, balance, nonce);
  }

  // Handle text changes in input fields
  onChange(event) {
    const { state } = this;
    const name = event.target.id;
    const value = event.target.value;

    // Update state
    state[name] = value;
    // eslint-disable-next-line no-console
    console.log('Updated', name, value);

    // Validate field
    this.validateField(name, value);

    // Store to survive refresh
    window.localStorage.setItem(name, value);

    // Build preview if we have enough data
    if (state.contractAddress && state.functionSignature &&
        state.gasLimit && state.gasPrice) {
      this.buildTransactionPreview();
    }
  }

  // Build transaction preview
  @action
  buildTransactionPreview() {
    try {
      const targetAddress = this.state.transactionType === 'eth'
        ? this.state.recipientAddress
        : this.state.contractAddress;

      if (targetAddress && this.state.privateKey && this.state.nonce !== undefined &&
          this.state.gasLimit && this.state.gasPrice) {
        const txParams = {
          contractAddress: targetAddress,
          privateKey: this.state.privateKey,
          nonce: this.state.nonce,
          functionSignature: this.state.transactionType === 'eth'
            ? null
            : this.state.functionSignature,
          functionParameters: this.state.transactionType === 'eth'
            ? null
            : this.state.functionParameters,
          value: this.state.value || '0x0',
          gasLimit: this.state.gasLimit,
          gasPrice: this.state.gasPrice,
        };
        this.state.rawTx = buildTx(txParams);
        this.state.showPreview = true;
      }
    } catch (e) {
      // Preview build failed, don't show error yet
      this.state.showPreview = false;
    }
  }

  // Handle private key edit
  onPrivateKeyChange(event) {
    this.onChange(event);
    this.updateAddressData();
  }

  // Handle wallet selection from wallet manager
  @action
  handleWalletSelect(wallet) {
    this.state.privateKey = wallet.privateKey;
    this.state.address = wallet.address;
    window.localStorage.setItem('privateKey', wallet.privateKey);
    this.updateAddressData();
  }

  render() {
    const { state } = this;
    const onPrivateKeyChange = (e) => { this.onPrivateKeyChange(e); };
    const onChange = (e) => { this.onChange(e); };
    const sendTransaction = () => { this.sendTransaction(); };
    const handleNetworkChange = (network) => { this.handleNetworkChange(network); };
    const estimateGas = () => { this.estimateGas(); };
    const handleFunctionSelect = (func) => { this.handleFunctionSelect(func); };

    const targetAddress = state.transactionType === 'eth'
      ? state.recipientAddress
      : state.contractAddress;
    const canEstimateGas = targetAddress && state.address && state.apiKey && state.apiURL;
    const canSend = state.addressValidation.valid && state.privateKeyValidation.valid &&
                    state.gasLimitValidation.valid && state.gasLimit && state.gasPrice &&
                    targetAddress &&
                    (state.transactionType === 'eth' ? state.value !== '0x0' : true);

    return (
      <Form horizontal>

        <NetworkSelector
          selectedNetwork={state.selectedNetwork}
          onNetworkChange={handleNetworkChange}
        />

        <FormGroup controlId="apiKey">
          <Col componentClass={ControlLabel} sm={2}>
            Etherscan.io API key
          </Col>
          <Col sm={10}>
            <FormControl type="text" value={state.apiKey} onChange={onChange} />
            <p className="text-muted">
              Sign up on <a target="_blank" href="https://etherscan.io">EtherScan.io</a>.
            </p>
          </Col>
        </FormGroup>

        <FormGroup controlId="privateKey">
          <Col componentClass={ControlLabel} sm={2}>
            Private key
          </Col>
          <Col sm={10}>
            <FormControl
              type="text"
              value={state.privateKey}
              onChange={onPrivateKeyChange}
              className={state.privateKeyValidation.valid ? '' : 'has-error'}
            />
            {state.privateKeyValidation.error && (
              <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                {state.privateKeyValidation.error}
              </span>
            )}
            <p className="text-muted">
              Private key (0x + 64 hex characters). Keep this secure!
            </p>
          </Col>
        </FormGroup>

        <FormGroup controlId="transactionType">
          <Col componentClass={ControlLabel} sm={2}>
            Transaction Type
          </Col>
          <Col sm={10}>
            <FormControl
              componentClass="select"
              value={state.transactionType}
              onChange={(e) => {
                state.transactionType = e.target.value;
                window.localStorage.setItem('transactionType', e.target.value);
                if (e.target.value === 'eth') {
                  state.contractAddress = '';
                  state.functionSignature = '';
                  state.functionParameters = '';
                }
              }}
            >
              <option value="contract">Contract Call</option>
              <option value="eth">ETH Transfer</option>
            </FormControl>
            <p className="text-muted">
              Choose between calling a smart contract function or sending ETH directly.
            </p>
          </Col>
        </FormGroup>

        {state.transactionType === 'contract' ? (
          <div>
            <FormGroup controlId="contractAddress">
              <Col componentClass={ControlLabel} sm={2}>
                Contract address
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={state.contractAddress}
                  onChange={onChange}
                  className={state.addressValidation.valid ? '' : 'has-error'}
                />
                {state.addressValidation.error && (
                  <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                    {state.addressValidation.error}
                  </span>
                )}
                {state.contractAddress && state.addressValidation.valid && (
                  <p className="text-muted">
                    <a
                      target="_blank"
                      href={`${state.explorerURL}/address/${state.contractAddress}`}
                    >
                      View the contract on Explorer
                    </a>
                  </p>
                )}
              </Col>
            </FormGroup>

            <ABILoader onFunctionSelect={handleFunctionSelect} />
          </div>
        ) : (
          <FormGroup controlId="recipientAddress">
            <Col componentClass={ControlLabel} sm={2}>
              Recipient address
            </Col>
            <Col sm={10}>
              <FormControl
                type="text"
                value={state.recipientAddress}
                onChange={(e) => {
                  state.recipientAddress = e.target.value;
                  window.localStorage.setItem('recipientAddress', e.target.value);
                  const validation = validateAddress(e.target.value);
                  state.addressValidation = validation;
                  if (validation.checksummed) {
                    state.recipientAddress = validation.checksummed;
                  }
                }}
                className={state.addressValidation.valid ? '' : 'has-error'}
              />
              {state.addressValidation.error && (
                <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                  {state.addressValidation.error}
                </span>
              )}
              {state.recipientAddress && state.addressValidation.valid && (
                <p className="text-muted">
                  <a
                    target="_blank"
                    href={`${state.explorerURL}/address/${state.recipientAddress}`}
                  >
                    View address on Explorer
                  </a>
                </p>
              )}
            </Col>
          </FormGroup>
        )}

        {state.transactionType === 'contract' && (
          <div>
            <FormGroup controlId="functionSignature">
              <Col componentClass={ControlLabel} sm={2}>
                Function signature
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={state.functionSignature}
                  onChange={onChange}
                  className={state.functionSignatureValidation.valid ? '' : 'has-error'}
                  placeholder="e.g., setValue(uint256)"
                />
                {state.functionSignatureValidation.error && (
                  <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                    {state.functionSignatureValidation.error}
                  </span>
                )}
                <p className="text-muted">
                  Function name and parameter types. See examples in{' '}
                  <a target="_blank" href="https://github.com/ethereumjs/ethereumjs-abi">
                    ethereumjs-abi
                  </a>.
                </p>
              </Col>
            </FormGroup>

            <FormGroup controlId="functionParameters">
              <Col componentClass={ControlLabel} sm={2}>
                Function parameters
              </Col>
              <Col sm={10}>
                <FormControl
                  type="text"
                  value={state.functionParameters}
                  onChange={onChange}
                  placeholder="e.g., 100,200"
                />
                <p className="text-muted">Comma separated list of parameter values</p>
              </Col>
            </FormGroup>
          </div>
        )}

        <FormGroup controlId="value">
          <Col componentClass={ControlLabel} sm={2}>
            Value (ETH)
          </Col>
          <Col sm={10}>
            <FormControl
              type="text"
              value={state.value === '0x0' || !state.value
                ? ''
                : web3.fromWei(state.value, 'ether')}
              onChange={(e) => {
                const ethValue = e.target.value;
                if (!ethValue || ethValue === '') {
                  state.value = '0x0';
                } else {
                  try {
                    const weiValue = web3.toWei(ethValue, 'ether');
                    state.value = `0x${parseInt(weiValue, 10).toString(16)}`;
                  } catch (err) {
                    // Invalid value, keep as is
                  }
                }
                window.localStorage.setItem('value', state.value);
              }}
              placeholder={
                state.transactionType === 'eth'
                  ? 'Amount to send'
                  : '0 (leave empty for 0)'
              }
            />
            <p className="text-muted">
              {state.transactionType === 'eth'
                ? 'Amount of ETH to send to the recipient address'
                : 'Amount of ETH to send with transaction (optional, for payable functions)'}
            </p>
          </Col>
        </FormGroup>

        <FormGroup controlId="gasLimit">
          <Col componentClass={ControlLabel} sm={2}>
            Gas limit
          </Col>
          <Col sm={10}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <FormControl
                type="text"
                value={state.gasLimit}
                onChange={onChange}
                placeholder="0x300000"
                className={state.gasLimitValidation.valid ? '' : 'has-error'}
                style={{ flex: 1 }}
              />
              <Button
                bsSize="small"
                onClick={estimateGas}
                disabled={!canEstimateGas || state.estimatingGas}
              >
                {state.estimatingGas ? 'Estimating...' : 'Estimate'}
              </Button>
            </div>
            {state.gasLimitValidation.error && (
              <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                {state.gasLimitValidation.error}
              </span>
            )}
            {state.gasEstimateError && (
              <span className="text-warning" style={{ display: 'block', marginTop: '5px' }}>
                {state.gasEstimateError}
              </span>
            )}
            <p className="text-muted">
              Maximum gas to use (hex format). Click Estimate to auto-calculate.
            </p>
          </Col>
        </FormGroup>

        <FormGroup controlId="gasPrice">
          <Col componentClass={ControlLabel} sm={2}>
            Gas price
          </Col>
          <Col sm={10}>
            <FormControl
              type="text"
              value={state.gasPrice}
              onChange={onChange}
              placeholder="Leave empty to fetch from network"
              className={state.gasPriceValidation.valid ? '' : 'has-error'}
            />
            {state.gasPriceSuggestions.standard && (
              <div style={{ marginTop: '10px' }}>
                <ButtonGroup>
                  <Button
                    bsSize="small"
                    onClick={() => {
                      state.gasPrice = state.gasPriceSuggestions.slow;
                      onChange({ target: { id: 'gasPrice', value: state.gasPriceSuggestions.slow } });
                    }}
                  >
                    Slow ({state.gasPriceSuggestions.slow
                      ? `${(parseInt(state.gasPriceSuggestions.slow, 16) / 1e9).toFixed(2)} Gwei`
                      : ''})
                  </Button>
                  <Button
                    bsSize="small"
                    bsStyle="primary"
                    onClick={() => {
                      state.gasPrice = state.gasPriceSuggestions.standard;
                      onChange({
                        target: { id: 'gasPrice', value: state.gasPriceSuggestions.standard },
                      });
                    }}
                  >
                    Standard ({state.gasPriceSuggestions.standard
                      ? `${(parseInt(state.gasPriceSuggestions.standard, 16) / 1e9).toFixed(2)} Gwei`
                      : ''})
                  </Button>
                  <Button
                    bsSize="small"
                    onClick={() => {
                      state.gasPrice = state.gasPriceSuggestions.fast;
                      onChange({ target: { id: 'gasPrice', value: state.gasPriceSuggestions.fast } });
                    }}
                  >
                    Fast ({state.gasPriceSuggestions.fast
                      ? `${(parseInt(state.gasPriceSuggestions.fast, 16) / 1e9).toFixed(2)} Gwei`
                      : ''})
                  </Button>
                </ButtonGroup>
              </div>
            )}
            {state.gasPriceValidation.error && (
              <span className="text-danger" style={{ display: 'block', marginTop: '5px' }}>
                {state.gasPriceValidation.error}
              </span>
            )}
            <p className="text-muted">
              Gas price in wei (hex format). Leave empty to fetch current gas price from network.
            </p>
          </Col>
        </FormGroup>

        {state.gasLimit && state.gasPrice && state.gasLimitValidation.valid &&
          state.gasPriceValidation.valid && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Alert bsStyle="info">
                <strong>Estimated Cost:</strong>{' '}
                {calculateTransactionCost(state.gasLimit, state.gasPrice).eth} ETH
                {state.balance && (
                  <span> | Balance: {state.balance} ETH</span>
                )}
              </Alert>
            </Col>
          </FormGroup>
        )}

        {state.showPreview && state.rawTx && (
          <TransactionPreview state={state} />
        )}

        <FormGroup>
          <Col smOffset={2} sm={10}>
            <Button
              bsStyle="primary"
              onClick={sendTransaction}
              disabled={!canSend || state.sendStatus}
              bsSize="large"
            >
              {state.sendStatus ? 'Sending...' : 'Send Transaction'}
            </Button>
          </Col>
        </FormGroup>

        {state.sendError && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Alert bsStyle="danger">
                <strong>Error:</strong> {state.sendError}
              </Alert>
            </Col>
          </FormGroup>
        )}

        {state.sentTxHash && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <Alert bsStyle="success">
                <strong>Transaction Sent!</strong>{' '}
                <div
                  style={{
                    marginTop: '10px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <code style={{ fontSize: '12px' }}>{state.sentTxHash}</code>
                  <CopyButton text={state.sentTxHash} label="transaction hash" bsSize="small" />
                  <Button
                    bsSize="small"
                    onClick={() => {
                      state.showTxQRCode = true;
                    }}
                  >
                    QR
                  </Button>
                  <a target="_blank" href={`${state.explorerURL}/tx/${state.sentTxHash}`}>
                    View on Explorer
                  </a>
                </div>
              </Alert>
            </Col>
          </FormGroup>
        )}

        {state.sentTxHash && (
          <QRCodeModal
            show={state.showTxQRCode || false}
            onHide={() => { state.showTxQRCode = false; }}
            data={state.sentTxHash}
            title="Transaction Hash QR Code"
          />
        )}

        {state.rawTx && <TransactionData state={state} />}

        <AccountInfo state={state} />

        {state.estimatingGas && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <LoadingSpinner text="Estimating gas..." />
            </Col>
          </FormGroup>
        )}

        {state.sendStatus && (
          <FormGroup>
            <Col smOffset={2} sm={10}>
              <LoadingSpinner text="Sending transaction..." />
            </Col>
          </FormGroup>
        )}

        <div style={{ marginTop: '30px' }}>
          <TemplateManager
            currentConfig={{
              network: state.selectedNetwork.id,
              contractAddress: state.contractAddress,
              recipientAddress: state.recipientAddress,
              transactionType: state.transactionType,
              functionSignature: state.functionSignature,
              functionParameters: state.functionParameters,
              gasLimit: state.gasLimit,
              gasPrice: state.gasPrice,
              value: state.value,
            }}
            onLoadTemplate={(config) => {
              if (config.network) {
                const network = getNetworkById(config.network) || getDefaultNetwork();
                state.selectedNetwork = network;
                state.apiURL = network.apiURL;
                state.explorerURL = network.explorerURL;
              }
              if (config.contractAddress) state.contractAddress = config.contractAddress;
              if (config.recipientAddress) state.recipientAddress = config.recipientAddress;
              if (config.transactionType) state.transactionType = config.transactionType;
              if (config.functionSignature) state.functionSignature = config.functionSignature;
              if (config.functionParameters) state.functionParameters = config.functionParameters;
              if (config.gasLimit) state.gasLimit = config.gasLimit;
              if (config.gasPrice) state.gasPrice = config.gasPrice;
              if (config.value) state.value = config.value;
              Object.keys(config).forEach(key => {
                if (config[key] !== undefined && config[key] !== null) {
                  window.localStorage.setItem(key, config[key]);
                }
              });
            }}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <WalletManager
            currentAddress={state.address}
            onWalletSelect={(wallet) => { this.handleWalletSelect(wallet); }}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <TransactionHistory
            currentNetwork={state.selectedNetwork}
            currentAddress={state.address}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <SettingsManager
            onImport={() => {
              // Reload after import
              window.location.reload();
            }}
          />
        </div>

      </Form>
    );
  }
}

Signer.propTypes = {
  store: React.PropTypes.object,
};

export default Signer;
