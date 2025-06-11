# Arbitrum MCP Tools Feature Matrix

This document provides a comprehensive list of all available tools in the Arbitrum MCP Tools project, organized by category.

## Feature Categories

The tools are categorized according to the following feature matrix:

## 1. Account Analysis

Tools for analyzing accounts, balances, and tokens.

| Tool                    | Description                                                                                               | Parameters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Demo |
| ----------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `getAccountBalance`     | Get native token balance for an Arbitrum address                                                          | `address`: Ethereum address to check balance for, `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the balance for. Defaults to 'latest' if unspecified.                                                                                                                                                                                                                                                                                                                                                                                                                    |      |
| `getTokenBalances`      | Get ERC-20 token balances for an Arbitrum address, optionally filtered by a list of contract addresses.   | `address`: The owner address or ENS name to get the token balances for, `contractAddresses`: Optional list of contract addresses to filter by.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |      |
| `getNfts`               | Get NFTs owned by an address, with options for filtering, pagination, and ordering.                       | `owner`: The address of the owner. `options`: (Optional) { `contractAddresses`: Optional list of contract addresses to filter by (Limit 45), `omitMetadata`: Optional boolean to omit NFT metadata (default: false), `excludeFilters`: Optional list of filters (SPAM, AIRDROPS) to exclude, `includeFilters`: Optional list of filters (SPAM, AIRDROPS) to include, `pageSize`: Max NFTs to return (API default 50, max 100), `tokenUriTimeoutInMs`: Timeout for metadata fetch, `orderBy`: Order by 'TRANSFERTIME', `pageKey`: Optional page key for pagination }                                                                                |      |
| `getTransactionHistory` | Get transaction history for an Arbitrum address, with options for filtering and pagination.               | `address`: The address to check transactions for (used as fromAddress). `options`: (Optional) { `fromBlock`: Start block ("0x0" default), `toBlock`: End block ("latest" default), `toAddress`: Recipient filter, `contractAddresses`: Contract filter (ERC20/721/1155), `excludeZeroValue`: Exclude zero value transfers (true default), `order`: 'asc'/'desc' by block number ('asc' default), `category`: Array of categories (EXTERNAL, INTERNAL, ERC20, ERC721, ERC1155, SPECIALNFT), `maxCount`: Max results per page (50 default), `withMetadata`: Include transfer metadata (false default), `pageKey`: Optional page key for pagination } |      |
| `getNftMetadata`        | Get metadata for an NFT given its contract address and token ID, with options for caching and token type. | `contractAddress`: NFT contract address, `tokenId`: Token ID. `options`: (Optional) { `tokenType`: Specify token type (ERC721, ERC1155, UNKNOWN), `tokenUriTimeoutInMs`: Timeout for metadata fetch, `refreshCache`: Refresh metadata before response (false default) }                                                                                                                                                                                                                                                                                                                                                                            |      |

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

| Tool                    | Description                                              | Parameters                                                                                                     | Demo |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---- |
| `getBlockNumber`        | Get the latest block number on Arbitrum                  | (No parameters)                                                                                                |      |
| `getBlock`              | Get details of a block by number or hash                 | `block`: Block number (as a string), block hash, or one of the following tags: 'latest', 'pending', 'earliest' |      |
| `getTransaction`        | Get details of a transaction by hash                     | `txHash`: Transaction hash                                                                                     |      |
| `getTransactionReceipt` | Get the transaction receipt for a given transaction hash | `txHash`: Transaction hash                                                                                     |      |
| `getGasParameters`      | Get detailed Arbitrum gas price metrics                  | (No parameters)                                                                                                |      |
| `getGasPrice`           | Get the current gas price on Arbitrum                    | (No parameters)                                                                                                |      |

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

| Tool                        | Description                                                                                                                                                                                                                                     | Parameters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Demo |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `getContractCode`           | Retrieve the bytecode of a contract at a specific address and optionally at a given block.                                                                                                                                                      | `contractAddress`: The address or ENS name of the account to get the code for. `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the code for. Defaults to 'latest' if unspecified.                                                                                                                                                                                                                                                                                                           |      |
| `decodeTransactionCalldata` | Decode transaction input data using Arbitrum contract ABIs with comprehensive error handling and detailed output formatting. Automatically detects the target contract from transaction hash and provides intelligent troubleshooting guidance. | `transactionHash`: Transaction hash to decode (automatically detects contract address from transaction). Supports contract creation detection, invalid calldata handling, and provides detailed function parameter analysis with type information.                                                                                                                                                                                                                                                                                                                  |      |
| `getContractEvents`         | Query specific events from Arbitrum contracts with intelligent block range management and auto-discovery                                                                                                                                        | `contractAddress`: Contract address, `eventSignature`: Event signature (e.g., 'Transfer(address,address,uint256)') (optional), `fromBlock`: Starting block number (optional), `toBlock`: Ending block number (optional), `maxBlocks`: Maximum blocks per query (default: 500), `limit`: Maximum number of events to return (default: 1000), `topics`: Additional topic filters (optional), `autoDiscover`: Automatically find active periods if no events found (default: true), `searchDepth`: Number of block ranges to search when auto-discovering (default: 5) |      |
| `getTokenAllowance`         | Get ERC-20 token allowance for an owner and spender                                                                                                                                                                                             | `tokenAddress`: ERC-20 token contract address, `owner`: Owner address, `spender`: Spender address                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |      |

### Example Responses

#### Decode Transaction Calldata

```
Decoded input:
Function: transfer(address,uint256)
Parameters:
- to: 0xRecipientAddress
- amount: 1000000000000000000 (1.0 tokens)
```

## 4. Cross-Chain Operations

Tools for cross-chain operations.

| Tool                 | Description                                                                                                                                                                                                                                  | Parameters                                                                                                                                                                            | Demo |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `getTransactionLogs` | Fetch and decode transaction logs from L1 or L2 with automatic network detection. Recognizes 15+ common Arbitrum events including cross-chain messaging, token transfers, and bridge operations with emoji indicators and structured output. | `txHash`: Transaction hash (0x-prefixed, 66 chars) that works on both L1 (Ethereum) and L2 (Arbitrum). Includes automatic fallback between networks and comprehensive event decoding. |      |

### Example Responses

#### Get Transaction Logs

```
Logs for L2 (Arbitrum) TX 0xYourTxHash:

🔖 MessageDelivered #1 → messageIndex=123, beforeInboxAcc=0xabc..., inbox=0xdef..., kind=0, sender=0x123..., messageDataHash=0x456..., baseFeeL1=1000, timestamp=1678886400

🔖 Transfer #2 → from=0xsender..., to=0xreceiver..., value=1000000000000000000
```

## 5. Development

Tools for developers.

| Tool                  | Description                                                                                                                                                                                      | Parameters                                                                                                                                                                                                                                                                                                                                                                                                       | Demo |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `simulateTransaction` | Simulate Arbitrum transaction with comprehensive asset change detection and detailed error analysis. Provides formatted output with gas usage, ETH transfers, and transaction impact assessment. | `from`: From address (0x-prefixed), `to`: To address (0x-prefixed), `data`: Optional transaction calldata (hex string), `value`: Optional value in wei (hex string), `gas`: Optional gas limit (hex string). Includes automatic error detection and asset change analysis.                                                                                                                                       |      |
| `estimateGas`         | Estimate gas usage for a transaction                                                                                                                                                             | `to`: Destination address, `from`: Optional sender address, `data`: Optional transaction data (hex string), `value`: Optional value in wei as a string (e.g., '1000000000000000000'), `gasPrice`: Optional gas price in wei as a string (e.g., '20000000000'), `nonce`: Optional transaction nonce as a string (e.g., '0', '1'), `type`: Optional EIP-2718 transaction type (e.g., 0 for legacy, 2 for EIP-1559) |      |

### Example Responses

#### Estimate Gas

```
Estimated gas: 21000 units
```

## 6. Batch Operations

Tools for performing operations on multiple addresses.

| Tool                   | Description                                                       | Parameters                                                                                                                                                                         | Demo |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `getBatchBalances`     | Get balances for multiple addresses in single call                | `addresses`: Array of addresses to check, `tokenAddress`: ERC-20 token address (optional)                                                                                          |      |
| `multiAddressAnalysis` | Compare token holdings and transactions across multiple addresses | `addresses`: Array of addresses to analyze, `includeNfts`: Include NFTs in analysis (optional boolean), `includeTransactions`: Include transactions in analysis (optional boolean) |      |

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

| Tool                      | Description                                                                                                                                  | Parameters                                                                                                                                                                                                                                                                                                                                                    | Demo |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| `createStylusProject`     | Create a new Cargo Stylus project                                                                                                            | `projectName`: Project name, `path`: Path to create the project (optional)                                                                                                                                                                                                                                                                                    |      |
| `initStylusProject`       | Initialize a Stylus project in the current directory                                                                                         | `path`: Path to initialize the project (optional)                                                                                                                                                                                                                                                                                                             |      |
| `exportStylusAbi`         | Export a Solidity ABI for a Stylus contract                                                                                                  | `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                                                                                                 |      |
| `checkStylusContract`     | Check if a Stylus contract is valid for deployment                                                                                           | `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                                                                                                 |      |
| `deployStylusContract`    | Deploy a Stylus contract to the Arbitrum network. Uses environment variables for secure authentication and supports gas estimation mode.     | `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional), `estimateGas`: Only estimate gas instead of deploying (optional boolean). Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables for authentication.                                                                                    |      |
| `verifyStylusContract`    | Verify the deployment of a Stylus contract                                                                                                   | `deploymentTx`: Deployment transaction hash, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                           |      |
| `activateStylusContract`  | Activate an already deployed Stylus contract. Uses environment variables for secure authentication.                                          | `contractAddress`: Deployed contract address, `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional). Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables for authentication.                                                                                                                |      |
| `cacheStylusContract`     | Cache a contract using the Stylus CacheManager. Uses environment variables for secure authentication and supports multiple cache operations. | `subcommand`: Cache subcommand ('bid', 'status', 'suggest-bid', 'help'), `contractAddress`: Contract address to cache, `endpoint`: RPC endpoint URL, `path`: Path to the Stylus project (optional), `bidAmount`: Bid amount for 'bid' subcommand (optional). Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables. |      |
| `prepareStylusCgen`       | Prepare ABI JSON for cargo stylus cgen command by exporting and formatting contract ABI into cgen-compatible structure                       | `projectPath`: The project path, `outputPath`: The output file for cgen-compatible JSON, `rustFeatures`: Rust crate's features list for feature-specific ABI (optional)                                                                                                                                                                                       |      |
| `generateStylusBindings`  | Generate C code bindings for a Stylus contract from project source with automatic ABI preparation and cleanup                                | `projectPath`: The Stylus project path, `outDir`: Output directory for C bindings, `rustFeatures`: Rust features for ABI generation (optional), `abiOutputPath`: Custom ABI JSON path (optional), `keepAbiFile`: Keep generated ABI file (optional, default: false)                                                                                           |      |
| `replayStylusTransaction` | Replay a Stylus transaction in GDB debugger                                                                                                  | `txHash`: Transaction hash to replay, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                  |      |
| `traceStylusTransaction`  | Trace a Stylus transaction                                                                                                                   | `txHash`: Transaction hash to trace, `endpoint`: RPC endpoint URL (optional), `path`: Path to the Stylus project (optional)                                                                                                                                                                                                                                   |      |

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
