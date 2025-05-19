# Arbitrum MCP Tools Feature Matrix

This document provides a comprehensive list of all available tools in the Arbitrum MCP Tools project, organized by category.

## Feature Categories

The tools are categorized according to the following feature matrix:

## 1. Account Analysis

Tools for analyzing accounts, balances, and tokens.

| Tool                    | Description                                                                                               | Parameters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getAccountBalance`     | Get native token balance for an Arbitrum address                                                          | `address`: Ethereum address to check balance for, `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the balance for. Defaults to 'latest' if unspecified.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `getTokenBalances`      | Get ERC-20 token balances for an Arbitrum address, optionally filtered by a list of contract addresses.   | `address`: The owner address or ENS name to get the token balances for, `contractAddresses`: Optional list of contract addresses to filter by.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `getNfts`               | Get NFTs owned by an address, with options for filtering, pagination, and ordering.                       | `owner`: The address of the owner. `options`: (Optional) { `contractAddresses`: Optional list of contract addresses to filter by (Limit 45), `omitMetadata`: Optional boolean to omit NFT metadata (default: false), `excludeFilters`: Optional list of filters (SPAM, AIRDROPS) to exclude, `includeFilters`: Optional list of filters (SPAM, AIRDROPS) to include, `pageSize`: Max NFTs to return (API default 100, max 100), `tokenUriTimeoutInMs`: Timeout for metadata fetch, `orderBy`: Order by 'TRANSFERTIME', `pageKey`: Optional page key for pagination }                                                                                 |
| `getTransactionHistory` | Get transaction history for an Arbitrum address, with options for filtering and pagination.               | `address`: The address to check transactions for (used as fromAddress). `options`: (Optional) { `fromBlock`: Start block ("0x0" default), `toBlock`: End block ("latest" default), `toAddress`: Recipient filter, `contractAddresses`: Contract filter (ERC20/721/1155), `excludeZeroValue`: Exclude zero value transfers (true default), `order`: 'asc'/'desc' by block number ('asc' default), `category`: Array of categories (EXTERNAL, INTERNAL, ERC20, ERC721, ERC1155, SPECIALNFT), `maxCount`: Max results per page (1000 default), `withMetadata`: Include transfer metadata (false default), `pageKey`: Optional page key for pagination } |
| `getNftMetadata`        | Get metadata for an NFT given its contract address and token ID, with options for caching and token type. | `contractAddress`: NFT contract address, `tokenId`: Token ID. `options`: (Optional) { `tokenType`: Specify token type (ERC721, ERC1155, UNKNOWN), `tokenUriTimeoutInMs`: Timeout for metadata fetch, `refreshCache`: Refresh metadata before response (false default) }                                                                                                                                                                                                                                                                                                                                                                              |

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

| Tool                    | Description                                              | Parameters                                                                                                     |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `getBlockNumber`        | Get the latest block number on Arbitrum                  | (No parameters)                                                                                                |
| `getBlock`              | Get details of a block by number or hash                 | `block`: Block number (as a string), block hash, or one of the following tags: 'latest', 'pending', 'earliest' |
| `getTransaction`        | Get details of a transaction by hash                     | `txHash`: Transaction hash                                                                                     |
| `getTransactionReceipt` | Get the transaction receipt for a given transaction hash | `txHash`: Transaction hash                                                                                     |
| `getGasParameters`      | Get detailed Arbitrum gas price metrics                  | (No parameters)                                                                                                |
| `getGasPrice`           | Get the current gas price on Arbitrum                    | (No parameters)                                                                                                |

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

| Tool                | Description                                                                                | Parameters                                                                                                                                                                                                                                              |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getContractCode`   | Retrieve the bytecode of a contract at a specific address and optionally at a given block. | `addressOrName`: The address or ENS name of the account to get the code for. `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the code for. Defaults to 'latest' if unspecified. |
| `decodeCalldata`    | Decode transaction input data using Arbitrum contract ABIs                                 | `contractAddress`: Contract address, `data`: Transaction input data                                                                                                                                                                                     |
| `getContractEvents` | Query specific events from Arbitrum contracts                                              | `contractAddress`: Contract address, `eventSignature`: Event signature, `fromBlock`: Starting block number (optional), `toBlock`: Ending block number (optional)                                                                                        |
| `getTokenAllowance` | Get ERC-20 token allowance for an owner and spender                                        | `tokenAddress`: ERC-20 token contract address, `owner`: Owner address, `spender`: Spender address                                                                                                                                                       |

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

| Tool                 | Description                                                                                    | Parameters                                            |
| -------------------- | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `getTransactionLogs` | Fetch and comment on all logs from a given transaction hash (L1 or L2), decoding known events. | `txHash`: Transaction hash (0x…66) on either L1 or L2 |

### Example Responses

#### Get Transaction Logs

```
Logs for L2 (Arbitrum) TX 0xYourTxHash:

🔖 MessageDelivered #1 → messageIndex=123, beforeInboxAcc=0xabc..., inbox=0xdef..., kind=0, sender=0x123..., messageDataHash=0x456..., baseFeeL1=1000, timestamp=1678886400

🔖 Transfer #2 → from=0xsender..., to=0xreceiver..., value=1000000000000000000
```

## 5. Development

Tools for developers.

| Tool                  | Description                                       | Parameters                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `simulateTransaction` | Simulate Arbitrum transaction with state override | `from`: From address, `to`: To address, `data`: Transaction calldata, `value`: Value in wei (optional), `gas`: Optional gas limit as a hex string (e.g., '0x5208'), `gasPrice`: Optional gas price as a hex string (e.g., '0x4A817C800'), `blockIdentifier`: Optional block identifier (number, hash, or tag like 'latest') to simulate the transaction in                                                       |
| `estimateGas`         | Estimate gas usage for a transaction              | `to`: Destination address, `from`: Optional sender address, `data`: Optional transaction data (hex string), `value`: Optional value in wei as a string (e.g., '1000000000000000000'), `gasPrice`: Optional gas price in wei as a string (e.g., '20000000000'), `nonce`: Optional transaction nonce as a string (e.g., '0', '1'), `type`: Optional EIP-2718 transaction type (e.g., 0 for legacy, 2 for EIP-1559) |

### Example Responses

#### Estimate Gas

```
Estimated gas: 21000 units
```

## 6. Batch Operations

Tools for performing operations on multiple addresses.

| Tool                   | Description                                                       | Parameters                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getBatchBalances`     | Get balances for multiple addresses in single call                | `addresses`: Array of addresses to check, `tokenAddress`: ERC-20 token address (optional)                                                                                          |
| `multiAddressAnalysis` | Compare token holdings and transactions across multiple addresses | `addresses`: Array of addresses to analyze, `includeNfts`: Include NFTs in analysis (optional boolean), `includeTransactions`: Include transactions in analysis (optional boolean) |

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

| Tool                      | Description                                          | Parameters                                                                                                                                                                                                                                                                                                          |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createStylusProject`     | Create a new Cargo Stylus project                    | `projectName`: Project name, `path`: Path to create the project (optional)                                                                                                                                                                                                                                          |
| `initStylusProject`       | Initialize a Stylus project in the current directory | `path`: Path to initialize the project (optional)                                                                                                                                                                                                                                                                   |
| `exportStylusAbi`         | Export a Solidity ABI for a Stylus contract          | `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                                                       |
| `checkStylusContract`     | Check if a Stylus contract is valid for deployment   | `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                                                       |
| `deployStylusContract`    | Deploy a Stylus contract to the Arbitrum network     | `privateKey`: Private key for deployment (optional), `privateKeyPath`: Path to private key file (optional), `keystorePath`: Path to keystore file (optional), `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional), `estimateGas`: Only estimate gas instead of deploying (optional boolean) |
| `verifyStylusContract`    | Verify the deployment of a Stylus contract           | `deploymentTx`: Deployment transaction hash, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                 |
| `activateStylusContract`  | Activate an already deployed Stylus contract         | `contractAddress`: Deployed contract address, `privateKey`: Private key for activation (optional), `privateKeyPath`: Path to private key file (optional), `keystorePath`: Path to keystore file (optional), `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional)                             |
| `cacheStylusContract`     | Cache a contract using the Stylus CacheManager       | `subcommand`: Cache subcommand to execute ('bid', 'status', 'suggest-bid', 'help'), `contractAddress`: Contract address to cache, `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional)                                                                                                       |
| `generateStylusBindings`  | Generate C code bindings for a Stylus contract       | `input`: Input file or contract ABI, `outDir`: Output directory for the generated bindings, `path`: Path to the Stylus project (optional)                                                                                                                                                                           |
| `replayStylusTransaction` | Replay a Stylus transaction in GDB debugger          | `txHash`: Transaction hash to replay, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                        |
| `traceStylusTransaction`  | Trace a Stylus transaction                           | `txHash`: Transaction hash to trace, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                         |

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
