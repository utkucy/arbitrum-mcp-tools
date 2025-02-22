# Arbitrum MCP (Model Context Protocol) Tools

This repository contains a set of MCP tools for interacting with the Arbitrum network. Below you'll find documentation for each available tool along with examples.

## Account and Token Information

### 1. Get Native Token Balance

Retrieves the native ETH balance for an Arbitrum address.

```javascript
Example Response for 0xF977814e90dA44bFA03b6295A0616a897441aceC:
Balance: 264234.14 ETH
```

### 2. Get Token Balances

Retrieves all token balances (ERC20) for an Arbitrum address.

```javascript
Example:
Address: 0xYourAddress
Response: List of all ERC20 token balances
```

### 3. Get NFTs

Retrieves all NFTs owned by an Arbitrum address.

```javascript
Example Response:
Collection: The Nebula
Token ID: 15
Type: ERC721

Collection: KyberDAO KIP Badge
Token ID: 34081...6576
Type: ERC1155
```

## Transaction Information

### 4. Get Transaction History

Retrieves transaction history for an Arbitrum address.

```javascript
Example:
Address: 0xYourAddress
Response: List of recent transactions with details
```

### 5. Get Transaction Details

Retrieves detailed information about a specific transaction.

```javascript
Example:
Transaction Hash: 0xYourTransactionHash
Response: Detailed transaction information including:
- From/To addresses
- Value
- Gas used
- Status
```

### 6. Get Transaction Receipt

Retrieves the receipt for a completed transaction.

```javascript
Example:
Transaction Hash: 0xYourTransactionHash
Response: Transaction receipt with logs and events
```

## Block Information

### 7. Get Latest Block Number

Retrieves the current block number on Arbitrum.

```javascript
Example Response:
Latest block number: 308831599
```

### 8. Get Block Details

Retrieves detailed information about a specific block.

```javascript
Example:
Block: 308831599 or 0xBlockHash
Response: Block details including:
- Timestamp
- Transaction count
- Gas used
- Miner
```

## Gas and Network

### 9. Get Gas Price

Retrieves the current gas price on Arbitrum.

```javascript
Example:
Response: Current gas price in wei
```

### 10. Estimate Gas

Estimates gas usage for a transaction.

```javascript
Example:
To: 0xDestinationAddress
Value: "1000000000000000000" // 1 ETH
Response: Estimated gas amount
```

## Contract Interaction

### 11. Get Contract Code

Retrieves the bytecode of a deployed contract.

```javascript
Example:
Contract Address: 0xContractAddress
Response: Contract bytecode
```

### 12. Get Token Allowance

Checks ERC20 token allowance for an owner and spender.

```javascript
Example:
Token: 0xTokenAddress
Owner: 0xOwnerAddress
Spender: 0xSpenderAddress
Response: Allowance amount
```

### 13. Get NFT Metadata

Retrieves metadata for a specific NFT.

```javascript
Example:
Contract: 0xNFTContractAddress
Token ID: "1"
Response: NFT metadata (name, description, attributes)
```

## Usage Notes

- All addresses should be provided in the standard Ethereum format (0x...)
- Token amounts are typically returned in wei (18 decimals)
- Block numbers can be provided as numbers or hex strings
- Transaction hashes must include the '0x' prefix

## Error Handling

The tools will return appropriate error messages if:

- Invalid addresses are provided
- Requested resources don't exist
- Network issues occur
- Rate limits are exceeded

## Security Considerations

- Never share private keys
- Always verify transaction details before signing
- Be cautious with contract interactions
- Monitor gas prices for optimal transaction timing

---

For more detailed information about Arbitrum and its features, visit [Arbitrum's official documentation](https://docs.arbitrum.io/).
