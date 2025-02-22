import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  Alchemy,
  Network,
  TokenBalanceType,
  OwnedNft,
  AssetTransfersCategory,
  AssetTransfersResult,
  TokenBalance,
  TokenMetadataResponse,
  BigNumber,
} from "alchemy-sdk";
import { formatEther, formatUnits, BigNumberish } from "ethers";
import { Interface } from "ethers";

// Initialize Alchemy SDK
const ALCHEMY_API_KEY = "YOUR_ALCHEMY_API_KEY";
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY environment variable is required");
}

const alchemyConfig = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ARB_MAINNET,
};

const alchemy = new Alchemy(alchemyConfig);

// Helper function to format token balance
function formatTokenBalance(balance: bigint, decimals: number): string {
  return formatUnits(balance, decimals);
}

// Create server instance
const server = new McpServer({
  name: "arbitrum",
  version: "1.0.0",
});

// Register blockchain data tools
server.tool(
  "getAccountBalance",
  "Get native token balance for an Arbitrum address",
  {
    address: z.string().describe("Ethereum address to check balance for"),
  },
  async ({ address }) => {
    try {
      const balance = await alchemy.core.getBalance(address);
      return {
        content: [
          {
            type: "text",
            text: `Balance: ${formatEther(balance.toString())} ETH`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error fetching balance: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "getTokenBalances",
  "Get all token balances for an Arbitrum address",
  {
    address: z
      .string()
      .describe("Ethereum address to check token balances for"),
  },
  async ({ address }) => {
    try {
      const balances = await alchemy.core.getTokenBalances(address);

      if (balances.tokenBalances.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No token balances found",
            },
          ],
        };
      }

      const formattedBalances = await Promise.all(
        balances.tokenBalances.map(async (token: TokenBalance) => {
          const metadata = await alchemy.core.getTokenMetadata(
            token.contractAddress
          );
          const balance = formatTokenBalance(
            BigInt(token.tokenBalance || "0"),
            metadata.decimals || 18
          );
          const name = metadata.name || "Unknown Token";
          const symbol = metadata.symbol || "???";
          return `${name} (${symbol}): ${balance}`;
        })
      );

      return {
        content: [
          {
            type: "text",
            text: `Token balances for ${address}:\n\n${formattedBalances.join(
              "\n"
            )}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error fetching token balances: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "getNfts",
  "Get NFTs owned by an Arbitrum address",
  {
    address: z.string().describe("Ethereum address to check NFTs for"),
  },
  async ({ address }) => {
    try {
      const nfts = await alchemy.nft.getNftsForOwner(address);

      if (nfts.totalCount === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No NFTs found",
            },
          ],
        };
      }

      const formattedNfts = nfts.ownedNfts.map(
        (nft: OwnedNft) =>
          `Collection: ${
            nft.contract.name || "Unknown Collection"
          }\nToken ID: ${nft.tokenId}\nType: ${nft.tokenType}\n---`
      );

      return {
        content: [
          {
            type: "text",
            text: `NFTs owned by ${address}:\n\n${formattedNfts.join("\n")}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error fetching NFTs: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "getTransactionHistory",
  "Get transaction history for an Arbitrum address",
  {
    address: z.string().describe("Ethereum address to check transactions for"),
  },
  async ({ address }) => {
    try {
      const transactions = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        fromAddress: address,
        category: [
          AssetTransfersCategory.EXTERNAL,
          AssetTransfersCategory.INTERNAL,
          AssetTransfersCategory.ERC20,
          AssetTransfersCategory.ERC721,
          AssetTransfersCategory.ERC1155,
        ],
      });

      if (transactions.transfers.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No transactions found",
            },
          ],
        };
      }

      const formattedTxs = transactions.transfers.map(
        (tx: AssetTransfersResult) =>
          `Type: ${tx.category}\nFrom: ${tx.from}\nTo: ${
            tx.to || "Unknown"
          }\nValue: ${tx.value || "0"} ${tx.asset || "Unknown"}\nHash: ${
            tx.hash
          }\n---`
      );

      return {
        content: [
          {
            type: "text",
            text: `Transaction history for ${address}:\n\n${formattedTxs.join(
              "\n"
            )}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [
          {
            type: "text",
            text: `Error fetching transaction history: ${errorMessage}`,
          },
        ],
      };
    }
  }
);

// New Tools

// 1. Get Current Block Number
server.tool(
  "getBlockNumber",
  "Get the latest block number on Arbitrum",
  {}, // no input needed
  async () => {
    try {
      const blockNumber = await alchemy.core.getBlockNumber();
      return {
        content: [
          { type: "text", text: `Latest block number: ${blockNumber}` },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 2. Get Block Details
server.tool(
  "getBlock",
  "Get details of a block by number or hash",
  { block: z.string().describe("Block number (as a string) or block hash") },

  async ({ block }) => {
    try {
      const blockData = await alchemy.core.getBlock(block);
      return {
        content: [
          {
            type: "text",
            text: `Block details:\n${JSON.stringify(blockData, null, 2)}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 3. Get Transaction Details
server.tool(
  "getTransaction",
  "Get details of a transaction by hash",
  { txHash: z.string().describe("Transaction hash") },
  async ({ txHash }) => {
    try {
      const txData = await alchemy.core.getTransaction(txHash);
      return {
        content: [
          {
            type: "text",
            text: `Transaction details:\n${JSON.stringify(txData, null, 2)}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 4. Get Transaction Receipt
server.tool(
  "getTransactionReceipt",
  "Get the transaction receipt for a given transaction hash",
  { txHash: z.string().describe("Transaction hash") },
  async ({ txHash }) => {
    try {
      const receipt = await alchemy.core.getTransactionReceipt(txHash);
      return {
        content: [
          {
            type: "text",
            text: `Transaction Receipt:\n${JSON.stringify(receipt, null, 2)}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 5. Get Current Gas Price
server.tool(
  "getGasPrice",
  "Get the current gas price on Arbitrum",
  {},
  async () => {
    try {
      const gasPrice = await alchemy.core.getGasPrice();
      return {
        content: [
          {
            type: "text",
            text: `Current gas price: ${gasPrice.toString()} wei`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 6. Estimate Gas Usage
server.tool(
  "estimateGas",
  "Estimate gas usage for a transaction",
  {
    to: z.string().describe("Destination address"),
    data: z.string().optional().describe("Optional transaction data"),
    value: z.string().optional().describe("Optional value in wei as a string"),
  },
  async ({ to, data, value }) => {
    try {
      const estimate = await alchemy.core.estimateGas({
        to,
        data,
        value: value ? BigNumber.from(value) : undefined,
      });
      return {
        content: [
          {
            type: "text",
            text: `Estimated gas: ${estimate.toString()}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 7. Get Contract Code
server.tool(
  "getContractCode",
  "Retrieve the bytecode of a contract",
  { contractAddress: z.string().describe("Contract address") },
  async ({ contractAddress }) => {
    try {
      const code = await alchemy.core.getCode(contractAddress);
      return {
        content: [
          {
            type: "text",
            text: `Contract code:\n${code}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 8. Get ERC-20 Token Allowance
server.tool(
  "getTokenAllowance",
  "Get ERC-20 token allowance for an owner and spender",
  {
    tokenAddress: z.string().describe("ERC-20 token contract address"),
    owner: z.string().describe("Owner address"),
    spender: z.string().describe("Spender address"),
  },
  async ({ tokenAddress, owner, spender }) => {
    try {
      // Define minimal ABI for allowance
      const abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
      ];
      const iface = new Interface(abi);
      const data = iface.encodeFunctionData("allowance", [owner, spender]);
      const result = await alchemy.core.call({ to: tokenAddress, data });
      const [allowance] = iface.decodeFunctionResult("allowance", result);
      return {
        content: [
          {
            type: "text",
            text: `Token allowance: ${allowance.toString()}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// 9. Get NFT Metadata
server.tool(
  "getNftMetadata",
  "Get metadata for an NFT given its contract address and token ID",
  {
    contractAddress: z.string().describe("NFT contract address"),
    tokenId: z.string().describe("Token ID"),
  },
  async ({ contractAddress, tokenId }) => {
    try {
      const metadata = await alchemy.nft.getNftMetadata(
        contractAddress,
        tokenId
      );
      return {
        content: [
          {
            type: "text",
            text: `NFT Metadata:\n${JSON.stringify(metadata, null, 2)}`,
          },
        ],
      };
    } catch (error: unknown) {
      const errMsg =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        content: [{ type: "text", text: `Error: ${errMsg}` }],
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Arbitrum MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
