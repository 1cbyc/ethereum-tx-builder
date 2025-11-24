/**
 * Sign an Ethereum transaction offline.
 *
 *
 * To run:
 *
 *   nvm use 7.2.1
 *   ./node_modules/babel-cli/bin/babel-node.js --presets es2015 --plugins transform-async-to-generator ./src/offlinetx.js --private-key YOUR_PRIVATE_KEY --value 0.95 --to YOUR_CONTRACT_ADDRESS --api-key YOUR_API_KEY

 *
 */

import Web3 from 'web3'; // https://www.npmjs.com/package/web3
import argv from 'optimist';
import {buildTx, getAddressFromPrivateKey} from './txbuilder';
import {API} from './etherscan';

let web3 = new Web3();

let _argv = argv.usage("ethereum-tx-builder $0 --api-key 0x0000000 --private-key 0x00000000000000 --value 1.20 --to 0x1231231231")
  .describe("value", "Transaction amount in ETH")
  .describe("private-key", "32 bytes private key has hexadecimal format")
  .describe("to", "Ethereum 0x address where to send")
  .describe("nonce", "Nonce as hexacimal format, like 0x1")
  .describe("api-key", "etherscan.io API key used to get network status")
  .describe("api-url", "Etherscan API base URL (default: https://api.etherscan.io/api)")
  .describe("gas-limit", "Maximum gas limit for the transaction as a hexadecimal")
  .string("private-key")  // Heurestics is number by default which doesn't work for bigints
  .string("api-url")
  .string("to")
  .string("api-key")
  .string("value")
  .string("nonce")
  .string("gas-limit")
  .demand(["private-key", "value", "to"]);

async function run(argv) {

  // Parse command line
  let apiKey = argv["api-key"];
  let privateKey = argv["private-key"];
  let value = argv["value"];
  let to = argv["to"];
  let nonce = argv["nonce"];
  let gasLimit = argv["gas-limit"];

  if(!privateKey) {
    console.error("No private key given");
    process.exit(1);
  }

  if(!apiKey) {
    console.error("No EtherScan.io API key given");
    process.exit(1);
  }

  const apiURL = argv["api-url"] || "https://api.etherscan.io/api";
  const api = new API(apiURL, apiKey);

  // If nonce is not given get it usig Etherscan
  if(!nonce) {
    // Build ethescan.io wrapper API
    let fromAddress = getAddressFromPrivateKey(privateKey);

    nonce = await api.getTransactionCount(fromAddress);
  }

  let gasPrice = await api.getGasPrice();

  value = web3.toHex(web3.toWei(value, "ether"));

  let txData = {
    contractAddress: to,
    privateKey: privateKey,
    nonce: nonce,
    functionSignature: null,
    functionParameters: null,
    value: value,
    gasLimit: gasLimit,
    gasPrice: gasPrice,
  };

  console.log("Building transaction with parameters", txData);

  let tx = buildTx(txData);

  console.log("Your raw transaction is: ", tx);
  console.log("Visit at https://etherscan.io/pushTx");

}

run(_argv.argv)
  .catch(function(e) {
    console.error(e);
  });

