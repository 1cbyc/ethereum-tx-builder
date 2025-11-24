/* Make sure we get a same ABI data encode result using native web3 and hand crafted ABI call.
*
* This is a little test script I wrote as something was mess up transaction payload encoding.
*
* To run:
*
*        nvm use 7.2.1
*       ./node_modules/babel-cli/bin/babel-node.js --presets es2015 ./tests/abiencode.js
*
*/

import fs from "fs";
import Web3  from 'web3';
import {encodeDataPayload} from '../src/txbuilder';

// Create a web3 connection to a running geth node over JSON-RPC running at
// http://localhost:8545
let web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Read the compiled contract code
// Compile with
// solc SampleContract.sol --combined-json abi,asm,ast,bin,bin-runtime,clone-bin,devdoc,interface,opcodes,srcmap,srcmap-runtime,userdoc > contracts.json
let source = fs.readFileSync("contracts/contracts.json");
let contracts = JSON.parse(source)["contracts"];

// ABI description as JSON structure
let abi = JSON.parse(contracts.SampleContract.abi);

// Smart contract EVM bytecode as hex
let code = contracts.SampleContract.bin;

// Create Contract proxy class
let SampleContract = web3.eth.contract(abi);
let contract = SampleContract.at('YOUR_CONTRACT_ADDRESS_HERE');

let testValue = 3000; // Replace with your test value
let dataPayloadABI = contract.setValue.getData(testValue);
let dataPayloadDirect = encodeDataPayload("setValue(uint)", String(testValue));

// Should be the same
console.log(dataPayloadABI);
console.log(dataPayloadDirect);

// Do a call using web3 ABI

