# Arbitrum MCP Tools Feature Matrix

This document provides a comprehensive list of all available tools in the Arbitrum MCP Tools project, organized by category.

## Feature Categories

The tools are categorized according to the following feature matrix:

---

## 1. Account Analysis

Tools for analyzing accounts, balances, and tokens.

1. **`getAccountBalance`** - Get native token balance for an Arbitrum address

   - **Parameters:**
     - `address`: Ethereum address to check balance for
     - `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the balance for. Defaults to 'latest' if unspecified.

2. **`getTokenBalances`** - Get ERC-20 token balances for an Arbitrum address, optionally filtered by a list of contract addresses.

   - **Parameters:**
     - `address`: The owner address or ENS name to get the token balances for
     - `contractAddresses`: Optional list of contract addresses to filter by

3. **`getNfts`** - Get NFTs owned by an address, with options for filtering, pagination, and ordering.

   - **Parameters:**
     - `owner`: The address of the owner
     - `options`: (Optional) Object containing:
       - `contractAddresses`: Optional list of contract addresses to filter by (Limit 45)
       - `omitMetadata`: Optional boolean to omit NFT metadata (default: false)
       - `excludeFilters`: Optional list of filters (SPAM, AIRDROPS) to exclude
       - `includeFilters`: Optional list of filters (SPAM, AIRDROPS) to include
       - `pageSize`: Max NFTs to return (API default 50, max 100)
       - `tokenUriTimeoutInMs`: Timeout for metadata fetch
       - `orderBy`: Order by 'TRANSFERTIME'
       - `pageKey`: Optional page key for pagination

4. **`getTransactionHistory`** - Get transaction history for an Arbitrum address, with options for filtering and pagination.

   - **Parameters:**
     - `address`: The address to check transactions for (used as fromAddress)
     - `options`: (Optional) Object containing:
       - `fromBlock`: Start block ("0x0" default)
       - `toBlock`: End block ("latest" default)
       - `toAddress`: Recipient filter
       - `contractAddresses`: Contract filter (ERC20/721/1155)
       - `excludeZeroValue`: Exclude zero value transfers (true default)
       - `order`: 'asc'/'desc' by block number ('asc' default)
       - `category`: Array of categories (EXTERNAL, INTERNAL, ERC20, ERC721, ERC1155, SPECIALNFT)
       - `maxCount`: Max results per page (50 default)
       - `withMetadata`: Include transfer metadata (false default)
       - `pageKey`: Optional page key for pagination

5. **`getNftMetadata`** - Get metadata for an NFT given its contract address and token ID, with options for caching and token type.
   - **Parameters:**
     - `contractAddress`: NFT contract address
     - `tokenId`: Token ID
     - `options`: (Optional) Object containing:
       - `tokenType`: Specify token type (ERC721, ERC1155, UNKNOWN)
       - `tokenUriTimeoutInMs`: Timeout for metadata fetch
       - `refreshCache`: Refresh metadata before response (false default)

---

## 2. Chain Data

Tools for retrieving blockchain data.

1. **`getBlockNumber`** - Get the latest block number on Arbitrum

   - **Parameters:** (No parameters)

2. **`getBlock`** - Get details of a block by number or hash

   - **Parameters:**
     - `block`: Block number (as a string), block hash, or one of the following tags: 'latest', 'pending', 'earliest'

3. **`getTransaction`** - Get details of a transaction by hash

   - **Parameters:**
     - `txHash`: Transaction hash

4. **`getTransactionReceipt`** - Get the transaction receipt for a given transaction hash

   - **Parameters:**
     - `txHash`: Transaction hash

5. **`getGasParameters`** - Get detailed Arbitrum gas price metrics

   - **Parameters:** (No parameters)

6. **`getGasPrice`** - Get the current gas price on Arbitrum
   - **Parameters:** (No parameters)

---

## 3. Contract Interaction

Tools for interacting with smart contracts.

1. **`getContractCode`** - Retrieve the bytecode of a contract at a specific address and optionally at a given block.

   - **Parameters:**
     - `contractAddress`: The address or ENS name of the account to get the code for
     - `blockTag`: The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the code for. Defaults to 'latest' if unspecified.

2. **`decodeTransactionCalldata`** - Decode transaction input data using Arbitrum contract ABIs with comprehensive error handling and detailed output formatting. Automatically detects the target contract from transaction hash and provides intelligent troubleshooting guidance.

   - **Parameters:**
     - `transactionHash`: Transaction hash to decode (automatically detects contract address from transaction). Supports contract creation detection, invalid calldata handling, and provides detailed function parameter analysis with type information.

3. **`getContractEvents`** - Query specific events from Arbitrum contracts with intelligent block range management and auto-discovery

   - **Parameters:**
     - `contractAddress`: Contract address
     - `eventSignature`: Event signature (e.g., 'Transfer(address,address,uint256)') (optional)
     - `fromBlock`: Starting block number (optional)
     - `toBlock`: Ending block number (optional)
     - `maxBlocks`: Maximum blocks per query (default: 500)
     - `limit`: Maximum number of events to return (default: 1000)
     - `topics`: Additional topic filters (optional)
     - `autoDiscover`: Automatically find active periods if no events found (default: true)
     - `searchDepth`: Number of block ranges to search when auto-discovering (default: 5)

4. **`getTokenAllowance`** - Get ERC-20 token allowance for an owner and spender
   - **Parameters:**
     - `tokenAddress`: ERC-20 token contract address
     - `owner`: Owner address
     - `spender`: Spender address

---

## 4. Cross-Chain Operations

Tools for cross-chain operations.

1. **`getTransactionLogs`** - Fetch and decode transaction logs from L1 or L2 with automatic network detection. Recognizes 15+ common Arbitrum events including cross-chain messaging, token transfers, and bridge operations with emoji indicators and structured output.
   - **Parameters:**
     - `txHash`: Transaction hash (0x-prefixed, 66 chars) that works on both L1 (Ethereum) and L2 (Arbitrum). Includes automatic fallback between networks and comprehensive event decoding.

---

## 5. Development

Tools for developers.

1. **`simulateTransaction`** - Simulate Arbitrum transaction with comprehensive asset change detection and detailed error analysis. Provides formatted output with gas usage, ETH transfers, and transaction impact assessment.

   - **Parameters:**
     - `from`: From address (0x-prefixed)
     - `to`: To address (0x-prefixed)
     - `data`: Optional transaction calldata (hex string)
     - `value`: Optional value in wei (hex string)
     - `gas`: Optional gas limit (hex string)
     - Includes automatic error detection and asset change analysis.

2. **`estimateGas`** - Estimate gas usage for a transaction
   - **Parameters:**
     - `to`: Destination address
     - `from`: Optional sender address
     - `data`: Optional transaction data (hex string)
     - `value`: Optional value in wei as a string (e.g., '1000000000000000000')
     - `gasPrice`: Optional gas price in wei as a string (e.g., '20000000000')
     - `nonce`: Optional transaction nonce as a string (e.g., '0', '1')
     - `type`: Optional EIP-2718 transaction type (e.g., 0 for legacy, 2 for EIP-1559)

---

## 6. Batch Operations

Tools for performing operations on multiple addresses.

1. **`getBatchBalances`** - Get balances for multiple addresses in single call

   - **Parameters:**
     - `addresses`: Array of addresses to check
     - `tokenAddress`: ERC-20 token address (optional)

2. **`multiAddressAnalysis`** - Compare token holdings and transactions across multiple addresses
   - **Parameters:**
     - `addresses`: Array of addresses to analyze
     - `includeNfts`: Include NFTs in analysis (optional boolean)
     - `includeTransactions`: Include transactions in analysis (optional boolean)

---

## 7. Stylus Development

Tools for Stylus development and interaction.

1. **`createStylusProject`** - Create a new Cargo Stylus project

   - **Parameters:**
     - `projectName`: Project name
     - `path`: Path to create the project (optional)

2. **`initStylusProject`** - Initialize a Stylus project in the current directory

   - **Parameters:**
     - `path`: Path to initialize the project (optional)

3. **`exportStylusAbi`** - Export a Solidity ABI for a Stylus contract

   - **Parameters:**
     - `output`: The output file
     - `path`: Path to the Stylus project (optional)
     - `json`: Write a JSON ABI instead using solc. Requires solc (default: true)
     - `rustFeatures`: Rust crate's features list. Required to include feature specific ABI (optional)

4. **`checkStylusContract`** - Check if a Stylus contract is valid for deployment

   - **Parameters:**
     - `path`: Path to the Stylus project (optional)

5. **`deployStylusContract`** - Deploy a Stylus contract to the Arbitrum network. Uses environment variables for secure authentication and supports gas estimation mode.

   - **Parameters:**
     - `endpoint`: RPC endpoint URL
     - `path`: Path to the Stylus project (optional)
     - `estimateGas`: Only estimate gas instead of deploying (optional boolean)
     - Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables for authentication.

6. **`verifyStylusContract`** - Verify the deployment of a Stylus contract

   - **Parameters:**
     - `deploymentTx`: Deployment transaction hash
     - `endpoint`: RPC endpoint URL (optional)
     - `path`: Path to the Stylus project (optional)

7. **`activateStylusContract`** - Activate an already deployed Stylus contract. Uses environment variables for secure authentication.

   - **Parameters:**
     - `contractAddress`: Deployed contract address
     - `endpoint`: RPC endpoint URL
     - `path`: Path to the Stylus project (optional)
     - Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables for authentication.

8. **`cacheStylusContract`** - Cache a contract using the Stylus CacheManager. Uses environment variables for secure authentication and supports multiple cache operations.

   - **Parameters:**
     - `subcommand`: Cache subcommand ('bid', 'status', 'suggest-bid', 'help')
     - `contractAddress`: Contract address to cache
     - `endpoint`: RPC endpoint URL
     - `path`: Path to the Stylus project (optional)
     - `bidAmount`: Bid amount for 'bid' subcommand (optional)
     - Uses STYLUS_PRIVATE_KEY, STYLUS_PRIVATE_KEY_PATH, or STYLUS_KEYSTORE_PATH environment variables.

9. **`prepareStylusCgen`** - Prepare ABI JSON for cargo stylus cgen command by exporting and formatting contract ABI into cgen-compatible structure

   - **Parameters:**
     - `projectPath`: The project path
     - `outputPath`: The output file for cgen-compatible JSON
     - `rustFeatures`: Rust crate's features list for feature-specific ABI (optional)

10. **`generateStylusBindings`** - Generate C code bindings for a Stylus contract from project source with automatic ABI preparation and cleanup

    - **Parameters:**
      - `projectPath`: The Stylus project path
      - `outDir`: Output directory for C bindings
      - `rustFeatures`: Rust features for ABI generation (optional)
      - `abiOutputPath`: Custom ABI JSON path (optional)
      - `keepAbiFile`: Keep generated ABI file (optional, default: false)

11. **`replayStylusTransaction`** - Replay a Stylus transaction in GDB debugger

    - **Parameters:**
      - `txHash`: Transaction hash to replay
      - `endpoint`: RPC endpoint URL (optional)
      - `path`: Path to the Stylus project (optional)

12. **`traceStylusTransaction`** - Trace a Stylus transaction
    - **Parameters:**
      - `txHash`: Transaction hash to trace
      - `endpoint`: RPC endpoint URL (optional)
      - `path`: Path to the Stylus project (optional)
