# Arbitrum MCP Tools Feature Matrix

This document provides a comprehensive list of all available tools in the Arbitrum MCP Tools project, organized by category.

## Feature Categories

The tools are categorized according to the following feature matrix:

## 1. Account Analysis

Tools for analyzing accounts, balances, and tokens.

| Tool                    | Description                             | Parameters                                                   |
| ----------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `getAccountBalance`     | Get native token balance for an address | `address`: Ethereum address to check balance for             |
| `getTokenBalances`      | Get all token balances for an address   | `address`: Ethereum address to check token balances for      |
| `getNfts`               | Get NFTs owned by an address            | `address`: Ethereum address to check NFTs for                |
| `getTransactionHistory` | Get transaction history for an address  | `address`: Ethereum address to check transactions for        |
| `getNftMetadata`        | Get metadata for a specific NFT         | `contractAddress`: NFT contract address, `tokenId`: Token ID |

### Example Responses

#### Get Account Balance

```
Balance: 264.14 ETH
```

#### Get Token Balances

```
Token balances for 0xYourAddress:
USDC (USDC): 1000.00
Arbitrum (ARB): 500.00
```

#### Get NFTs

```
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

## 2. Chain Data

Tools for retrieving blockchain data.

| Tool                    | Description                    | Parameters                                        |
| ----------------------- | ------------------------------ | ------------------------------------------------- |
| `getBlockNumber`        | Get latest block number        | None                                              |
| `getBlock`              | Get block details              | `block`: Block number (as a string) or block hash |
| `getTransaction`        | Get transaction details        | `txHash`: Transaction hash                        |
| `getTransactionReceipt` | Get transaction receipt        | `txHash`: Transaction hash                        |
| `getGasParameters`      | Get detailed gas price metrics | None                                              |

### Example Responses

#### Get Block Number

```
Latest block number: 308831599
```

#### Get Block Details

```
Block data for block 308831599:
Timestamp: 2023-10-15T14:23:45Z
Number of transactions: 150
Hash: 0xBlockHash
Gas used: 15000000
```

## 3. Contract Interaction

Tools for interacting with smart contracts.

| Tool                | Description                   | Parameters                                                                                                                                         |
| ------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getContractCode`   | Get contract bytecode         | `contractAddress`: Contract address                                                                                                                |
| `decodeCalldata`    | Decode transaction input data | `contractAddress`: Contract address, `data`: Transaction input data                                                                                |
| `getContractEvents` | Query contract events         | `contractAddress`: Contract address, `eventSignature`: Event signature, `fromBlock`: Starting block (optional), `toBlock`: Ending block (optional) |
| `getTokenAllowance` | Check ERC-20 token allowances | `tokenAddress`: ERC-20 token contract address, `owner`: Owner address, `spender`: Spender address                                                  |

### Example Responses

#### Decode Calldata

```
Decoded input:
Function: transfer(address,uint256)
Parameters:
- to: 0xRecipientAddress
- amount: 1000000000000000000 (1.0 tokens)
```

## 4. Cross-Chain Operations

Tools for cross-chain operations.

| Tool                         | Description                 | Parameters                                             |
| ---------------------------- | --------------------------- | ------------------------------------------------------ |
| `getCrossChainMessageStatus` | Check L1->L2 message status | `l1TxHash`: L1 transaction hash that initiated message |

### Example Responses

#### Get Cross-Chain Message Status

```
Message status: Confirmed
Initiated at: Block 17500000 (L1)
Confirmed at: Block 308831599 (L2)
```

## 5. Development

Tools for developers.

| Tool                  | Description           | Parameters                                                                                               |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `simulateTransaction` | Simulate transactions | `from`: From address, `to`: To address, `data`: Transaction calldata, `value`: Value in wei (optional)   |
| `estimateGas`         | Estimate gas usage    | `to`: Destination address, `data`: Optional transaction data, `value`: Optional value in wei as a string |
| `getGasPrice`         | Get current gas price | None                                                                                                     |

### Example Responses

#### Get Gas Price

```
Current gas price: 0.1 Gwei
```

#### Estimate Gas

```
Estimated gas: 21000 units
```

## 6. Batch Operations

Tools for performing operations on multiple addresses.

| Tool                   | Description                                      | Parameters                                                                                                                                                         |
| ---------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `getBatchBalances`     | Get balances for multiple addresses              | `addresses`: Array of addresses to check, `tokenAddress`: ERC-20 token address (optional)                                                                          |
| `multiAddressAnalysis` | Compare tokens and transactions across addresses | `addresses`: Array of addresses to analyze, `includeNfts`: Include NFTs in analysis (optional), `includeTransactions`: Include transactions in analysis (optional) |

### Example Responses

#### Get Batch Balances

```
Balances:
0xAddress1: 1.5 ETH
0xAddress2: 0.75 ETH
0xAddress3: 2.25 ETH
```

## 7. Stylus Development

Tools for Stylus development and interaction.

| Tool                      | Description                  | Parameters                                                                                                                                                                                                     |
| ------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createStylusProject`     | Create a new Stylus project  | `projectName`: Project name, `path`: Path to create the project (optional)                                                                                                                                     |
| `initStylusProject`       | Initialize a Stylus project  | `path`: Path to initialize the project (optional)                                                                                                                                                              |
| `exportStylusAbi`         | Export a Solidity ABI        | `path`: Path to the Stylus project (optional)                                                                                                                                                                  |
| `checkStylusContract`     | Check contract validity      | `path`: Path to the Stylus project (optional)                                                                                                                                                                  |
| `deployStylusContract`    | Deploy a contract            | `endpoint`: RPC endpoint URL, `privateKey`/`privateKeyPath`/`keystorePath`: Authentication, `path`: Project path (optional), `estimateGas`: Only estimate gas (optional)                                       |
| `verifyStylusContract`    | Verify a deployed contract   | `deploymentTx`: Deployment transaction hash, `endpoint`: RPC endpoint URL (optional), `path`: Project path (optional)                                                                                          |
| `activateStylusContract`  | Activate a deployed contract | `contractAddress`: Deployed contract address, `endpoint`: RPC endpoint URL, Authentication params, `path`: Project path (optional)                                                                             |
| `cacheStylusContract`     | Cache a contract             | `subcommand`: Cache subcommand, `contractAddress`: Contract address, `endpoint`: RPC endpoint URL, `path`: Project path (optional)                                                                             |
| `generateStylusBindings`  | Generate C code bindings     | `input`: Input file or contract ABI, `outDir`: Output directory, `path`: Project path (optional)                                                                                                               |
| `replayStylusTransaction` | Replay a transaction in GDB  | `txHash`: Transaction hash to replay, `endpoint`: RPC endpoint URL (optional), `path`: Project path (optional)                                                                                                 |
| `traceStylusTransaction`  | Trace a transaction          | `txHash`: Transaction hash to trace, `endpoint`: RPC endpoint URL (optional), `path`: Project path (optional)                                                                                                  |
| `callStylusContract`      | Call a method on a contract  | `contractAddress`: Contract address, `methodSignature`: Method signature, Authentication params, `args`: Function arguments (optional), `value`: ETH value (optional), `endpoint`: RPC endpoint URL (optional) |

### Example Responses

#### Create Stylus Project

```
Project created successfully:
Created binary (application) `my-stylus-project` package
Generated Counter contract template
```

#### Deploy Stylus Contract

```
Deployment results:
deployed code at address: 0x33f54de59419570a9442e788f5dd5cf635b3c7ac
deployment tx hash: 0xa55efc05c45efc63647dff5cc37ad328a47ba5555009d92ad4e297bf4864de36
wasm already activated!
```
