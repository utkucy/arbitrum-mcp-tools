import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatEther } from "ethers";
import { alchemy, formatTokenBalance, handleError } from "../common.js";
import {
  AssetTransfersCategory,
  AssetTransfersResult,
  OwnedNft,
  TokenBalance,
} from "alchemy-sdk";

export function registerAccountAnalysisTools(server: McpServer) {
  // 1. Balance
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
        return {
          content: [
            {
              type: "text",
              text: `Error fetching balance: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 2. Token Balances
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
        return {
          content: [
            {
              type: "text",
              text: `Error fetching token balances: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 3. NFTs
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
        return {
          content: [
            {
              type: "text",
              text: `Error fetching NFTs: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 4. Transaction History
  server.tool(
    "getTransactionHistory",
    "Get transaction history for an Arbitrum address",
    {
      address: z
        .string()
        .describe("Ethereum address to check transactions for"),
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
        return {
          content: [
            {
              type: "text",
              text: `Error fetching transaction history: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 5. NFT Metadata
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
        return {
          content: [
            {
              type: "text",
              text: `Error: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
}
