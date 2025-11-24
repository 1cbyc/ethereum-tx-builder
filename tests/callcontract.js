/* Call the contract using web3-
*
* To run:
*
*        nvm use 7.2.1
*       ./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./tests/callcontract.js
*
*/

import fs from "fs";
import Web3  from 'web3';

let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Fetch ABI
let source = fs.readFileSync("contracts/contracts.json");
let contracts = JSON.parse(source)["contracts"];
let abi = JSON.parse(contracts.SampleContract.abi);

// Get a proxy on the contract
let SampleContract = web3.eth.contract(abi);
let contract = SampleContract.at('YOUR_CONTRACT_ADDRESS_HERE');

// Perform a transaction using ETH from the geth coinbase account
web3.personal.unlockAccount(web3.eth.coinbase, "");

// Set the account from where we perform out contract transactions
web3.eth.defaultAccount = web3.eth.coinbase;

let testValue = 3000; // Replace with your test value
let gasLimit = 200000; // Replace with your gas limit
let tx = contract.setValue(testValue, {gas: gasLimit});
console.log("Transaction hash:", tx);
