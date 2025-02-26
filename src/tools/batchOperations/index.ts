import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatEther } from "ethers";
import { alchemy, handleError } from "../common.js";
import { AssetTransfersCategory } from "alchemy-sdk";

export function registerBatchOperationsTools(server: McpServer) {
  // 1. Bulk Balances
  server.tool(
    "getBatchBalances",
    "Get balances for multiple addresses in single call",
    {
      addresses: z.array(z.string()).describe("Array of addresses to check"),
      tokenAddress: z
        .string()
        .optional()
        .describe("ERC-20 token address (optional)"),
    },
    async ({ addresses, tokenAddress }) => {
      try {
        const balances = await Promise.all(
          addresses.map(async (address) => {
            if (tokenAddress) {
              // Use getTokenBalances instead and filter for the specific token
              const tokenBalances = await alchemy.core.getTokenBalances(
                address,
                [tokenAddress]
              );
              const tokenBalance = tokenBalances.tokenBalances[0];
              return `${address}: ${tokenBalance.tokenBalance}`;
            }
            const balance = await alchemy.core.getBalance(address);
            return `${address}: ${formatEther(balance.toString())} ETH`;
          })
        );

        return {
          content: [
            {
              type: "text",
              text: `Balances:\n${balances.join("\n")}`,
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

  // 2. Multi-Address Analysis
  server.tool(
    "multiAddressAnalysis",
    "Compare token holdings and transactions across multiple addresses",
    {
      addresses: z.array(z.string()).describe("Array of addresses to analyze"),
      includeNfts: z.boolean().optional().describe("Include NFTs in analysis"),
      includeTransactions: z
        .boolean()
        .optional()
        .describe("Include transactions in analysis"),
    },
    async ({ addresses, includeNfts, includeTransactions }) => {
      try {
        // Get balances for all addresses
        const balancePromises = addresses.map(async (address) => {
          const ethBalance = await alchemy.core.getBalance(address);
          const tokenBalances = await alchemy.core.getTokenBalances(address);

          // Format the balances
          const formattedEthBalance = formatEther(ethBalance.toString());
          const tokens = await Promise.all(
            tokenBalances.tokenBalances.map(async (token) => {
              const metadata = await alchemy.core.getTokenMetadata(
                token.contractAddress
              );
              return {
                name: metadata.name || "Unknown",
                symbol: metadata.symbol || "???",
                balance: token.tokenBalance || "0",
              };
            })
          );

          return {
            address,
            ethBalance: formattedEthBalance,
            tokens,
          };
        });

        // Add NFT data if requested
        const nftPromises = includeNfts
          ? addresses.map(async (address) => {
              const nfts = await alchemy.nft.getNftsForOwner(address);
              return {
                address,
                nftCount: nfts.totalCount,
                collections: nfts.ownedNfts.reduce((acc, nft) => {
                  const collectionName =
                    nft.contract.name || "Unknown Collection";
                  acc[collectionName] = (acc[collectionName] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>),
              };
            })
          : [];

        // Add transaction data if requested
        const txPromises = includeTransactions
          ? addresses.map(async (address) => {
              const transactions = await alchemy.core.getAssetTransfers({
                fromBlock: "0x0",
                fromAddress: address,
                category: [
                  AssetTransfersCategory.EXTERNAL,
                  AssetTransfersCategory.INTERNAL,
                  AssetTransfersCategory.ERC20,
                ],
              });
              return {
                address,
                txCount: transactions.transfers.length,
              };
            })
          : [];

        // Wait for all promises to resolve
        const [balances, nfts, txs] = await Promise.all([
          Promise.all(balancePromises),
          Promise.all(nftPromises),
          Promise.all(txPromises),
        ]);

        // Format the output
        let output = "Multi-address analysis:\n\n";

        balances.forEach((balance) => {
          output += `Address: ${balance.address}\n`;
          output += `ETH Balance: ${balance.ethBalance} ETH\n`;
          output += `Token Count: ${balance.tokens.length}\n`;

          if (includeNfts) {
            const addressNfts = nfts.find((n) => n.address === balance.address);
            if (addressNfts) {
              output += `NFT Count: ${addressNfts.nftCount}\n`;
            }
          }

          if (includeTransactions) {
            const addressTxs = txs.find((t) => t.address === balance.address);
            if (addressTxs) {
              output += `Transaction Count: ${addressTxs.txCount}\n`;
            }
          }

          output += "---\n";
        });

        return {
          content: [{ type: "text", text: output }],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Analysis failed: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
}
