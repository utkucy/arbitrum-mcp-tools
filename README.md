# Arbitrum MCP (Model Context Protocol) Tools

This project provides a set of tools for interacting with the Arbitrum blockchain via MCP, organized by categories according to the feature matrix.

## Project Structure

The codebase is organized into modular components for better maintainability:

```
src/
├── index.ts                # Main entry point
├── tools/                  # All tools organized by category
│   ├── common.ts           # Shared utilities and configs
│   ├── index.ts            # Tool registration
│   ├── accountAnalysis/    # Account analysis tools
│   ├── chainData/          # Chain data tools
│   ├── contractInteraction/# Contract interaction tools
│   ├── crossChain/         # Cross-chain tools
│   ├── development/        # Development tools
│   ├── batchOperations/    # Batch operation tools
│   └── stylus/             # Stylus development tools
```

## Feature Matrix

The tools are categorized according to the following feature matrix:

1. **accountAnalysis**

   - `getAccountBalance` - Get native token balance
   - `getTokenBalances` - Get ERC-20 token balances
   - `getNfts` - Get NFTs owned by an address
   - `getTransactionHistory` - Get transaction history
   - `getNftMetadata` - Get metadata for a specific NFT

2. **chainData**

   - `getBlockNumber` - Get latest block number
   - `getBlock` - Get block details
   - `getTransaction` - Get transaction details
   - `getTransactionReceipt` - Get transaction receipt
   - `getGasParameters` - Get detailed gas price metrics

3. **contractInteraction**

   - `getContractCode` - Get contract bytecode
   - `decodeCalldata` - Decode transaction input data
   - `getContractEvents` - Query contract events
   - `getTokenAllowance` - Check ERC-20 token allowances

4. **crossChain**

   - `getCrossChainMessageStatus` - Check L1->L2 message status

5. **development**

   - `simulateTransaction` - Simulate transactions
   - `estimateGas` - Estimate gas usage
   - `getGasPrice` - Get current gas price

6. **batchOperations**

   - `getBatchBalances` - Get balances for multiple addresses

7. **stylus**
   - `createStylusProject` - Create a new Stylus project
   - `initStylusProject` - Initialize a Stylus project
   - `exportStylusAbi` - Export a Solidity ABI
   - `checkStylusContract` - Check a contract for validity
   - `deployStylusContract` - Deploy a contract
   - `verifyStylusContract` - Verify a deployed contract
   - `activateStylusContract` - Activate a deployed contract
   - `cacheStylusContract` - Cache a contract
   - `generateStylusBindings` - Generate C code bindings
   - `replayStylusTransaction` - Replay a transaction in GDB
   - `traceStylusTransaction` - Trace a transaction
   - `callStylusContract` - Call a method on a deployed Stylus contract

## Getting Started

1. Install dependencies:

   ```
   npm install
   ```

2. Run the server:
   ```
   npm start
   ```

## Development

To add new tools, create them in the appropriate category folder and register them in the category's index.ts file.

## Tool Details

### Account and Token Information

#### 1. Get Native Token Balance

Retrieves the native ETH balance for an Arbitrum address.

```javascript
Example Response for 0xF977814e90dA44bFA03b6295A0616a897441aceC:
Balance: 264234.14 ETH
```

#### 2. Get Token Balances

Retrieves all token balances (ERC20) for an Arbitrum address.

```javascript
Example:
Address: 0xYourAddress
Response:
Token balances for 0xYourAddress:
USDC (USDC): 1000.00
Arbitrum (ARB): 500.00
```

#### 3. Get NFTs

Retrieves all NFTs owned by an Arbitrum address.

```javascript
Example Response:
NFTs owned by 0xYourAddress:

Collection: The Nebula
Token ID: 15
Type: ERC721
---
Collection: KyberDAO KIP Badge
Token ID: 34081
Type: ERC1155
---
```

#### 4. Get Transaction History

Retrieves transaction history for an Arbitrum address.

```javascript
Example:
Transaction history for 0xYourAddress:

Type: EXTERNAL
From: 0xYourAddress
To: 0xDestinationAddress
Value: 1.5 ETH
Hash: 0xTransactionHash
---
```

#### 5. Get NFT Metadata

Retrieves metadata for a specific NFT.

```javascript
Example:
NFT Metadata:
{
  "contract": {
    "address": "0xContractAddress"
  },
  "tokenId": "123",
  "name": "CryptoPunk #123",
  "description": "A unique digital collectible",
  "image": "https://ipfs.io/ipfs/QmHash",
  "attributes": [...]
}
```

### Block and Transaction Information

#### 6. Get Latest Block Number

Retrieves the current block number on Arbitrum.

```javascript
Example Response:
Latest block number: 308831599
```

#### 7. Get Block Details

Retrieves detailed information about a specific block.

```javascript
Example:
Block data for block 308831599:
Timestamp: 2023-10-15T14:23:45Z
Number of transactions: 150
Hash: 0xBlockHash
Gas used: 15000000
```

#### 8. Get Transaction Details

Retrieves detailed information about a specific transaction.

```javascript
Example:
Transaction data:
From: 0xSenderAddress
To: 0xRecipientAddress
Value: 1.5 ETH
Gas used: 21000
Status: Confirmed
```

#### 9. Get Transaction Receipt

Retrieves the receipt for a completed transaction.

```javascript
Example:
Transaction receipt:
Status: Success
Block number: 308831599
Gas used: 21000
Logs: [...]
```

### Gas and Network

#### 10. Get Gas Price

Retrieves the current gas price on Arbitrum.

```javascript
Example:
Current gas price: 0.1 Gwei
```

#### 11. Get Detailed Gas Parameters

Retrieves detailed gas price metrics for Arbitrum.

```javascript
Example:
Gas parameters:
Base fee: 0.05 Gwei
Max priority fee: 0.2 Gwei
Max fee: 0.25 Gwei
```

#### 12. Estimate Gas

Estimates gas usage for a transaction.

```javascript
Example:
Estimated gas: 21000 units
```

### Contract Interaction

#### 13. Get Contract Code

Retrieves the bytecode of a deployed contract.

```javascript
Example:
Contract bytecode: 0x608060405234801561001057600080fd5b50...
```

#### 14. Get Token Allowance

Checks ERC20 token allowance for an owner and spender.

```javascript
Example:
Token allowance: 1000 USDC
```

#### 15. Decode Transaction Input Data

Decodes transaction input data using contract ABIs.

```javascript
Example:
Decoded input:
Function: transfer(address,uint256)
Parameters:
- to: 0xRecipientAddress
- amount: 1000000000000000000 (1.0 tokens)
```

#### 16. Query Contract Events

Retrieves events emitted by a contract.

```javascript
Example:
Events from 0xContractAddress:
Event: Transfer
From: 0xSenderAddress
To: 0xRecipientAddress
Value: 1.0 tokens
Block: 308831599
```

### Cross-Chain Operations

#### 17. Check L1->L2 Message Status

Checks the status of a message sent from Ethereum L1 to Arbitrum L2.

```javascript
Example:
Message status: Confirmed
Initiated at: Block 17500000 (L1)
Confirmed at: Block 308831599 (L2)
```

### Batch Operations

#### 18. Get Batch Balances

Retrieves balances for multiple addresses in a single call.

```javascript
Example:
Balances:
0xAddress1: 1.5 ETH
0xAddress2: 0.75 ETH
0xAddress3: 2.25 ETH
```

### Development

#### 19. Simulate Transaction

Simulates the execution of a transaction.

```javascript
Example:
Simulation result:
Status: Success
Gas used: 21000
Return value: 0x
```

### Stylus Development

#### 20. Create Stylus Project

Creates a new Cargo Stylus project.

```javascript
Example:
Project created successfully:
Created binary (application) `my-stylus-project` package
Generated Counter contract template
```

#### 21. Initialize Stylus Project

Initializes a Stylus project in the current directory.

```javascript
Example:
Project initialized successfully:
Initialized package in current directory
Generated Counter contract template
```

#### 22. Export Stylus ABI

Exports a Solidity ABI for a Stylus contract.

```javascript
Example:
ABI exported successfully:

/**
 * This file was automatically generated by Stylus and represents a Rust program.
 * For more information, please see [The Stylus SDK](https://github.com/OffchainLabs/stylus-sdk-rs).
 */

// SPDX-License-Identifier: MIT-OR-APACHE-2.0
pragma solidity ^0.8.23;

interface ICounter {
    function number() external view returns (uint256);
    function setNumber(uint256 new_number) external;
    function increment() external;
}
```

#### 23. Check Stylus Contract

Checks if a Stylus contract is valid for deployment.

```javascript
Example:
Contract check results:
Finished release [optimized] target(s) in 1.88s
Reading WASM file at target/wasm32-unknown-unknown/release/my-project.wasm
Compressed WASM size: 3 KB
Program succeeded Stylus onchain activation checks with Stylus version: 1
```

#### 24. Deploy Stylus Contract

Deploys a Stylus contract to the Arbitrum network.

```javascript
Example:
Deployment results:
deployed code at address: 0x33f54de59419570a9442e788f5dd5cf635b3c7ac
deployment tx hash: 0xa55efc05c45efc63647dff5cc37ad328a47ba5555009d92ad4e297bf4864de36
wasm already activated!
```

#### 25. Verify Stylus Contract Deployment

Verifies the deployment of a Stylus contract.

```javascript
Example:
Verification results:
Contract at 0x33f54de59419570a9442e788f5dd5cf635b3c7ac verified successfully
```

#### 26. Activate Stylus Contract

Activates an already deployed Stylus contract.

```javascript
Example:
Activation results:
Contract at 0x33f54de59419570a9442e788f5dd5cf635b3c7ac activated successfully
activation tx hash: 0xb66efc05c45efc63647dff5cc37ad328a47ba5555009d92ad4e297bf4864de47
```

#### 27. Cache Stylus Contract

Caches a contract using the Stylus CacheManager.

```javascript
Example:
Cache results:
Contract 0x33f54de59419570a9442e788f5dd5cf635b3c7ac cached successfully
```

#### 28. Generate C Code Bindings

Generates C code bindings for a Stylus contract.

```javascript
Example:
C bindings generation results:
Generated C bindings at ./bindings/counter.h
Generated C bindings at ./bindings/counter.c
```

#### 29. Replay Stylus Transaction

Replays a Stylus transaction in GDB debugger.

```javascript
Example:
Transaction replay results:
Starting GDB session...
Loaded program state at transaction 0xTransactionHash
(gdb)
```

#### 30. Trace Stylus Transaction

Traces a Stylus transaction.

```javascript
Example:
Transaction trace results:
Function: increment()
Gas used: 97334
```

#### 31. Call Stylus Contract

Calls a method on a deployed Stylus smart contract using Foundry's Cast tool.

```javascript
Example:
// Read-only call to get counter value
Contract call results:
0x0000000000000000000000000000000000000000000000000000000000000000

// Example with method signature, endpoint and contract address
callStylusContract({
  contractAddress: "0x33f54de59419570a9442e788f5dd5cf635b3c7ac",
  methodSignature: "number()(uint256)",
  endpoint: "http://localhost:8547"
})

// Example with private key for authenticated calls
callStylusContract({
  contractAddress: "0x33f54de59419570a9442e788f5dd5cf635b3c7ac",
  methodSignature: "increment()",
  endpoint: "http://localhost:8547",
  privateKey: "0xb6b15c8cb491557369f3c7d2c287b053eb229daa9c22138887752191c9520659"
})
```
