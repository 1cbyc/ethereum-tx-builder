import React from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import { Form, FormGroup, FormControl, Button, Col, ControlLabel, Alert, ButtonGroup } from 'react-bootstrap';

import { getQueryParameterByName }  from "../utils";
import AccountInfo from "./AccountInfo";
import TransactionData from "./TransactionData";
import TransactionPreview from "./TransactionPreview";
import NetworkSelector from "./NetworkSelector";
import ABILoader from "./ABILoader";
import { API } from "../etherscan";
import { getAddressFromPrivateKey, buildTx, calculateNonce } from "../txbuilder";
import { getDefaultNetwork } from "../networks";
import { validateAddress, validatePrivateKey, validateHex, validateGasLimit, validateFunctionSignature } from "../validation";
import { estimateGasLimit, getGasPriceSuggestions, calculateTransactionCost } from "../gasEstimator";
import { encodeDataPayload } from "../txbuilder";


/**
 * Transaction builder user interface.
 */
@observer
class Signer extends React.Component {

  constructor(props) {

    super(props);

    // Fetch signer state from URL/localStorage on app init
    const url = window.location.href;
    const privateKey = getQueryParameterByName("privateKey", url) || window.localStorage.getItem("privateKey") || "";

    // Initialize network
    const defaultNetwork = getDefaultNetwork();
    const savedApiURL = getQueryParameterByName("apiURL", url) || window.localStorage.getItem("apiURL") || "";
    
    // Define the state of the signing component
    this.state = observable({
      selectedNetwork: defaultNetwork,
      apiURL: savedApiURL || defaultNetwork.apiURL,
      explorerURL: defaultNetwork.explorerURL,
      privateKey: privateKey,
      contractAddress: getQueryParameterByName("contractAddress", url) || window.localStorage.getItem("contractAddress") || "",
      apiKey: getQueryParameterByName("apiKey", url) || window.localStorage.getItem("apiKey") || "",
      functionSignature: window.localStorage.getItem("functionSignature") || "",
      functionParameters: window.localStorage.getItem("functionParameters") || "",
      gasLimit: window.localStorage.getItem("gasLimit") || "",
      gasPrice: window.localStorage.getItem("gasPrice") || "",
      value: window.localStorage.getItem("value") || "0x0",
      address: getAddressFromPrivateKey(privateKey) || "",
      balance: "",
      rawTx: "",
      nonce: "", // Calculated nonce as int
      sendStatus: false, // True when send in progress
      sendError: null, //
      sentTxHash: null, // Point to etherscan.io tx
      baseNonce: 0, // How many txs has gone out from the address
      nonceOffset: 0, // Maintain internal state of added nonces, because Etherscan getTransactionCount() cannot seem to be able to deal very
      testnetOffset: 0, // What is the nonce start point for the current network   0x100000
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
        data = encodeDataPayload(this.state.functionSignature, this.state.functionParameters);
      }

      const result = await estimateGasLimit({
        apiURL: this.state.apiURL,
        apiKey: this.state.apiKey,
        from: this.state.address,
        to: this.state.contractAddress,
        data: data,
        value: this.state.value || '0x0'
      });

      if (result.error) {
        this.state.gasEstimateError = result.error;
      } else if (result.gasLimit) {
        this.state.gasLimit = result.gasLimit;
        window.localStorage.setItem('gasLimit', result.gasLimit);
        this.state.gasLimitValidation = validateGasLimit(result.gasLimit);
      }
    } catch (e) {
      this.state.gasEstimateError = 'Gas estimation failed: ' + e.message;
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
    let state = this.state;

    state.sentTxHash = null;
    state.sendError = null;

    async function _send() {
      state.sendStatus = true;
      const api = new API(state.apiURL, state.apiKey);

      try {
        // Fetch gas price if not provided
        let gasPrice = state.gasPrice;
        if (!gasPrice && state.apiKey && state.apiURL) {
          gasPrice = await api.getGasPrice();
        }

        if (!gasPrice) {
          throw new Error("Gas price is required. Please provide it or ensure API key and URL are set.");
        }

        if (!state.gasLimit) {
          throw new Error("Gas limit is required.");
        }

        // Validate before sending
        if (!state.addressValidation.valid) {
          throw new Error("Invalid contract address: " + state.addressValidation.error);
        }
        if (!state.privateKeyValidation.valid) {
          throw new Error("Invalid private key: " + state.privateKeyValidation.error);
        }
        if (!state.gasLimitValidation.valid) {
          throw new Error("Invalid gas limit: " + state.gasLimitValidation.error);
        }

        // Build transaction with fetched/provided values
        const txParams = {
          contractAddress: state.contractAddress,
          privateKey: state.privateKey,
          nonce: state.nonce,
          functionSignature: state.functionSignature,
          functionParameters: state.functionParameters,
          value: state.value || "0x0",
          gasLimit: state.gasLimit,
          gasPrice: gasPrice,
        };

        state.rawTx = buildTx(txParams);
        state.showPreview = true;
        state.sentTxHash = await api.sendRaw(state.rawTx);
        console.log("Transaction sent, hash", state.sentTxHash);
        state.nonceOffset += 1;
      } catch(e) {
        state.sendError = "" + e;
        console.log(e);
      }

      await updateAddressData();
      state.sendStatus = false;
    }

    // Sent tx offline
    if(state.apiKey && state.apiURL) {
      _send();
    } else {
      state.sendError = "API key and API URL are required to send transactions.";
    }
  }

  // Update data about the address after fetched over API
  @action
  setAddressData(address, balance, nonce) {
    this.state.address = address;
    this.state.balance = balance;
    this.state.nonce = nonce;
  }

  // Update the Ethereum address balanc from etherscan.io API
  async updateAddressData() {

    let state = this.state;
    let address = getAddressFromPrivateKey(state.privateKey);

    console.log("Address for private key", state.privateKey, "is", state.address);

    if(!address) {
      this.setAddressData("Could not resolve address", "", "");
      return;
    } else {
      state.address = address;
    }

    console.log("Updating address information for", address, state);

    if(!address || !state.apiKey) {
      // No address available
      return;
    }
    const api = new API(state.apiURL, state.apiKey);
    const balance = await api.getBalance(address) || "";

    state.baseNonce = await api.getTransactionCount(address) || "";
    if(state.baseNonce) {
      state.baseNonce = parseInt(state.baseNonce, 16);
    }

    const nonce = calculateNonce(state.baseNonce, state.testnetOffset, state.nonceOffset);

    this.setAddressData(address, balance, nonce);
  }

  // Handle text changes in input fields
  onChange(event) {
    let state = this.state;
    let name = event.target.id;
    let value = event.target.value;

    // Update state
    state[name] = value;
    console.log("Updated", name, value);

    // Validate field
    this.validateField(name, value);

    // Store to survive refresh
    window.localStorage.setItem(name, value);

    // Build preview if we have enough data
    if (state.contractAddress && state.functionSignature && state.gasLimit && state.gasPrice) {
      this.buildTransactionPreview();
    }
  }

  // Build transaction preview
  @action
  buildTransactionPreview() {
    try {
      if (this.state.contractAddress && this.state.privateKey && this.state.nonce !== undefined) {
        const txParams = {
          contractAddress: this.state.contractAddress,
          privateKey: this.state.privateKey,
          nonce: this.state.nonce,
          functionSignature: this.state.functionSignature,
          functionParameters: this.state.functionParameters,
          value: this.state.value || "0x0",
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

  // Handle private kery edit
  onPrivateKeyChange(event) {
    let state = this.state;
    this.onChange(event);
    this.updateAddressData();
  }

  render() {

    const state = this.state;
    const onPrivateKeyChange = this.onPrivateKeyChange.bind(this);
    const onChange = this.onChange.bind(this);
    const sendTransaction = this.sendTransaction.bind(this);

    return (
      <Form horizontal>

        <h1>Ethereum TX Builder</h1>

        <FormGroup controlId="apiURL">

          <Col componentClass={ControlLabel} sm={2}>
            Etherscan API URL
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.apiURL} onChange={onChange} placeholder="https://api.etherscan.io/api" />
            <p className="text-muted">
              Etherscan API base URL (e.g., https://api.etherscan.io/api for mainnet, https://api-ropsten.etherscan.io/api for Ropsten).
            </p>

          </Col>

        </FormGroup>

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

        <FormGroup controlId="contractAddress">

          <Col componentClass={ControlLabel} sm={2}>
            Contract address
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.contractAddress} onChange={onChange} />

            <p className="text-muted">
              <a target="_blank" href={"https://testnet.etherscan.io/address/" + state.contractAddress}>View the contract on EtherScan.io</a>.
            </p>

          </Col>

        </FormGroup>

        <FormGroup controlId="privateKey">

          <Col componentClass={ControlLabel} sm={2}>
            Private key
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.privateKey} onChange={onPrivateKeyChange} />

            <p className="text-muted">
              Derived from a passphrase using sha3() function.
            </p>
          </Col>

        </FormGroup>

        <FormGroup controlId="functionSignature">

          <Col componentClass={ControlLabel} sm={2}>
            Function signature
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.functionSignature} onChange={onChange} />

            <p className="text-muted">
              See examples in <a target="_blank" href="https://github.com/ethereumjs/ethereumjs-abi">ethereumjs-abi</a>.
            </p>
          </Col>

        </FormGroup>

        <FormGroup controlId="functionParameters">

          <Col componentClass={ControlLabel} sm={2}>
            Function parameters
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.functionParameters} onChange={onChange} />
            <p className="text-muted">Comma separated list</p>
          </Col>

        </FormGroup>

        <FormGroup controlId="gasLimit">

          <Col componentClass={ControlLabel} sm={2}>
            Gas limit
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.gasLimit} onChange={onChange} placeholder="0x300000" />
            <p className="text-muted">Maximum gas to use for the transaction (hex format, e.g., 0x300000)</p>
          </Col>

        </FormGroup>

        <FormGroup controlId="gasPrice">

          <Col componentClass={ControlLabel} sm={2}>
            Gas price
          </Col>

          <Col sm={10}>
            <FormControl type="text" value={state.gasPrice} onChange={onChange} placeholder="Leave empty to fetch from network" />
            <p className="text-muted">Gas price in wei (hex format). Leave empty to fetch current gas price from network.</p>
          </Col>

        </FormGroup>

        <Button bsStyle="primary" onClick={sendTransaction}>Send transaction</Button>


        {state.rawTx && <TransactionData state={state} />}

        <AccountInfo state={state} />

      </Form>
    );
  }
}

Signer.propTypes = {
  store: React.PropTypes.object,
};

export default Signer;
