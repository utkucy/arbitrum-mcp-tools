import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatEther } from "ethers";
import { formatTokenBalance, handleError } from "../common.js";
import { alchemy } from "../../server.js";
import {
  AssetTransfersCategory,
  AssetTransfersResult,
  OwnedNft,
  TokenBalance,
  TokenBalanceType,
  TokenBalancesResponse,
  TokenBalancesResponseErc20,
  NftFilters,
  NftOrdering,
  NftTokenType,
  AssetTransfersParams,
  AssetTransfersWithMetadataParams,
} from "alchemy-sdk";

export function registerAccountAnalysisTools(server: McpServer) {
  // 1. Balance
  server.tool(
    "getAccountBalance",
    "Get native token balance for an Arbitrum address",
    {
      address: z.string().describe("Ethereum address to check balance for"),
      blockTag: z
        .string()
        .optional()
        .describe(
          "The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the balance for. Defaults to 'latest' if unspecified."
        ),
    },
    async ({ address, blockTag }) => {
      try {
        const balance = await alchemy.core.getBalance(
          address,
          blockTag || "latest"
        );
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
    "Get ERC-20 token balances for an Arbitrum address, optionally filtered by a list of contract addresses.",
    {
      address: z
        .string()
        .describe(
          "The owner address or ENS name to get the token balances for."
        ),
      contractAddresses: z
        .array(z.string())
        .optional()
        .describe("Optional list of contract addresses to filter by."),
    },
    async ({ address, contractAddresses }) => {
      try {
        let balances: TokenBalancesResponse | TokenBalancesResponseErc20;
        if (contractAddresses && contractAddresses.length > 0) {
          balances = await alchemy.core.getTokenBalances(
            address,
            contractAddresses
          );
        } else {
          balances = await alchemy.core.getTokenBalances(address, {
            type: TokenBalanceType.ERC20,
          });
        }

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

        let responseText = `Token balances for ${address}:\n\n${formattedBalances.join(
          "\n"
        )}`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
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
    "Get NFTs owned by an address, with options for filtering, pagination, and ordering.",
    {
      owner: z.string().describe("The address of the owner."),
      options: z
        .object({
          contractAddresses: z
            .array(z.string())
            .optional()
            .describe(
              "Optional list of contract addresses to filter the results by. Limit is 45."
            ),
          omitMetadata: z
            .boolean()
            .optional()
            .default(false)
            .describe(
              "Optional boolean flag to omit NFT metadata. Defaults to false."
            ),
          excludeFilters: z
            .array(z.enum([NftFilters.SPAM, NftFilters.AIRDROPS]))
            .optional()
            .describe(
              "Optional list of filters applied to the query. NFTs that match one or more of these filters are excluded from the response."
            ),
          includeFilters: z
            .array(z.enum([NftFilters.SPAM, NftFilters.AIRDROPS]))
            .optional()
            .describe(
              "Optional list of filters applied to the query. NFTs that match one or more of these filters are included in the response."
            ),
          pageSize: z
            .number()
            .optional()
            .default(50)
            .describe(
              "Sets the total number of NFTs to return in the response. API default is 50. Maximum page size is 100."
            ),
          tokenUriTimeoutInMs: z
            .number()
            .optional()
            .describe(
              "No set timeout by default - When metadata is requested, this parameter is the timeout (in milliseconds) for the website hosting the metadata to respond. If you want to only access the cache and not live fetch any metadata for cache misses then set this value to 0."
            ),
          orderBy: z
            .enum([NftOrdering.TRANSFERTIME])
            .optional()
            .describe(
              "Order in which to return results. By default, results are ordered by contract address and token ID in lexicographic order. The available option is TRANSFERTIME."
            ),
          pageKey: z
            .string()
            .optional()
            .describe("Optional page key to use for pagination."),
        })
        .optional()
        .default({
          pageSize: 50,
        }),
    },
    async ({ owner, options }) => {
      try {
        const nfts = await alchemy.nft.getNftsForOwner(
          owner,
          options ? { ...options } : undefined
        );

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

        let responseText = `NFTs owned by ${owner}:\n\n${formattedNfts.join(
          "\n"
        )}`;

        if (nfts.pageKey) {
          responseText += `\n\nPage Key: ${nfts.pageKey}`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
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
    "Get transaction history for an Arbitrum address, with options for filtering and pagination.",
    {
      address: z
        .string()
        .describe(
          "The address to check transactions for (used as fromAddress)."
        ),
      options: z
        .object({
          fromBlock: z
            .string()
            .optional()
            .describe(
              'The starting block to check for transfers. Defaults to "0x0".'
            ),
          toBlock: z
            .string()
            .optional()
            .describe(
              'Inclusive to block (hex string, int, or latest). Defaults to "latest".'
            ),
          toAddress: z
            .string()
            .optional()
            .describe(
              "The recipient address to filter transfers by. Defaults to a wildcard."
            ),
          contractAddresses: z
            .array(z.string())
            .optional()
            .describe(
              "List of contract addresses to filter for - only applies to erc20, erc721, erc1155 transfers. Defaults to all addresses if omitted."
            ),
          excludeZeroValue: z
            .boolean()
            .optional()
            .describe(
              "Whether to exclude transfers with zero value. API Defaults to true."
            ),
          order: z
            .enum(["asc", "desc"])
            .optional()
            .describe(
              "Whether to return results in ascending or descending order by block number (asc/desc). API Defaults to ascending."
            ),
          category: z
            .array(
              z.enum([
                AssetTransfersCategory.EXTERNAL,
                AssetTransfersCategory.INTERNAL,
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
                AssetTransfersCategory.SPECIALNFT,
              ])
            )
            .optional()
            .describe(
              "An array of categories to get transfers for. API defaults to all if omitted."
            ),
          maxCount: z
            .number()
            .optional()
            .default(50)
            .describe(
              "The maximum number of results to return per page. API Defaults to 1000 if omitted."
            ),
          withMetadata: z
            .boolean()
            .optional()
            .describe(
              "Whether to include additional metadata about each transfer event. API Defaults to false."
            ),
          pageKey: z
            .string()
            .optional()
            .describe(
              "Optional page key from an existing one to use for pagination."
            ),
        })
        .optional()
        .default({
          maxCount: 50,
        }),
    },
    async ({ address, options }) => {
      try {
        const baseParams: AssetTransfersParams = {
          fromAddress: address,
          fromBlock: options?.fromBlock ?? "0x0",
          category: options?.category ?? [
            AssetTransfersCategory.EXTERNAL,
            AssetTransfersCategory.ERC20,
            AssetTransfersCategory.ERC721,
            AssetTransfersCategory.ERC1155,
          ],
        };

        if (options?.toBlock !== undefined)
          baseParams.toBlock = options.toBlock;
        if (options?.toAddress !== undefined)
          baseParams.toAddress = options.toAddress;
        if (options?.contractAddresses !== undefined)
          baseParams.contractAddresses = options.contractAddresses;
        if (options?.excludeZeroValue !== undefined)
          baseParams.excludeZeroValue = options.excludeZeroValue;
        if (options?.order !== undefined)
          baseParams.order = options.order as any;
        if (options?.maxCount !== undefined)
          baseParams.maxCount = options.maxCount;
        if (options?.pageKey !== undefined)
          baseParams.pageKey = options.pageKey;

        let finalParams:
          | AssetTransfersParams
          | AssetTransfersWithMetadataParams = baseParams;

        if (options?.withMetadata === true) {
          finalParams = {
            ...baseParams,
            withMetadata: true,
          } as AssetTransfersWithMetadataParams;
        }

        const transactions = await alchemy.core.getAssetTransfers(finalParams);

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

        // Fetch full transaction data in parallel to get nonce information
        const formattedTxs = await Promise.all(
          transactions.transfers.map(async (tx: AssetTransfersResult) => {
            try {
              const fullTx = await alchemy.core.getTransaction(tx.hash);
              const nonce =
                fullTx?.nonce !== undefined ? fullTx.nonce : "Unknown";

              return `Type: ${tx.category}\nFrom: ${tx.from}\nTo: ${
                tx.to || "Unknown"
              }\nValue: ${tx.value || "0"} ${
                tx.asset || "Unknown"
              }\nNonce: ${nonce}\nHash: ${tx.hash}\n---`;
            } catch (_err) {
              return `Type: ${tx.category}\nFrom: ${tx.from}\nTo: ${
                tx.to || "Unknown"
              }\nValue: ${tx.value || "0"} ${
                tx.asset || "Unknown"
              }\nNonce: Unknown (failed to fetch)\nHash: ${tx.hash}\n---`;
            }
          })
        );

        let responseText = `Transaction history for ${address}:\n\n${formattedTxs.join(
          "\n"
        )}`;

        if (transactions.pageKey) {
          responseText += `\n\nPage Key: ${transactions.pageKey}`;
        }

        return {
          content: [
            {
              type: "text",
              text: responseText,
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
    "Get metadata for an NFT given its contract address and token ID, with options for caching and token type.",
    {
      contractAddress: z.string().describe("NFT contract address"),
      tokenId: z.string().describe("Token ID"),
      options: z
        .object({
          tokenType: z
            .enum([
              NftTokenType.ERC721,
              NftTokenType.ERC1155,
              NftTokenType.UNKNOWN,
            ])
            .optional()
            .describe(
              "Optional field to specify the type of token to speed up the query."
            ),
          tokenUriTimeoutInMs: z
            .number()
            .optional()
            .describe(
              "No set timeout by default - When metadata is requested, this parameter is the timeout (in milliseconds) for the website hosting the metadata to respond. If you want to only access the cache and not live fetch any metadata for cache misses then set this value to 0."
            ),
          refreshCache: z
            .boolean()
            .optional()
            .describe(
              "Whether to refresh the metadata for the given NFT token before returning the response. API Defaults to false for faster response times."
            ),
        })
        .optional(),
    },
    async ({ contractAddress, tokenId, options }) => {
      try {
        const metadata = await alchemy.nft.getNftMetadata(
          contractAddress,
          tokenId,
          options ? { ...options } : undefined
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

  // 6. Account Protocols Analysis
  server.tool(
    "getAccountProtocols",
    "Analyze which smart contracts (protocols) an address interacts with most frequently.",
    {
      address: z
        .string()
        .describe("The address to analyze for protocol interactions."),
      maxResults: z
        .number()
        .optional()
        .default(10)
        .describe(
          "Maximum number of top interacted protocol addresses to return. Defaults to 10."
        ),
    },
    async ({ address, maxResults }) => {
      try {
        // Helper to fetch transfers (both incoming and outgoing)
        const fetchTransfers = async (params: Partial<AssetTransfersParams>) =>
          alchemy.core.getAssetTransfers({
            fromBlock: "0x0",
            maxCount: 1000,
            category: [
              AssetTransfersCategory.EXTERNAL,
              AssetTransfersCategory.ERC20,
              AssetTransfersCategory.ERC721,
              AssetTransfersCategory.ERC1155,
            ],
            ...params,
          });

        // Fetch outgoing and incoming transfers in parallel
        const [outgoing, incoming] = await Promise.all([
          fetchTransfers({ fromAddress: address }),
          fetchTransfers({ toAddress: address }),
        ]);

        // Count interactions by contract address
        const interactionCounts: Record<string, number> = {};

        const addCounter = (addr: string | null | undefined) => {
          if (!addr) return;
          const key = addr.toLowerCase();
          if (key === address.toLowerCase()) return; // skip self
          interactionCounts[key] = (interactionCounts[key] || 0) + 1;
        };

        outgoing.transfers.forEach((tx) => addCounter(tx.to));
        incoming.transfers.forEach((tx) => addCounter(tx.from));

        // Sort by frequency
        const sorted = Object.entries(interactionCounts).sort(
          (a, b) => b[1] - a[1]
        );

        const top = sorted.slice(0, maxResults);

        // Try to enrich with token metadata when available (best-effort)
        const detailed = await Promise.all(
          top.map(async ([contractAddress, count]) => {
            try {
              const metadata = await alchemy.core.getTokenMetadata(
                contractAddress
              );
              const name = metadata.name || "Unknown Contract";
              const symbol = metadata.symbol || "";
              return `${name}${
                symbol ? ` (${symbol})` : ""
              } - ${contractAddress} : ${count} interactions`;
            } catch (_err) {
              return `${contractAddress} : ${count} interactions`;
            }
          })
        );

        if (detailed.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No protocol interactions found (or insufficient data)",
              },
            ],
          };
        }

        const responseText = `Top protocol / contract interactions for ${address} (last 1000 outgoing + 1000 incoming transfers):\n\n${detailed.join(
          "\n"
        )}`;

        return { content: [{ type: "text", text: responseText }] };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Error analyzing protocols: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );
}
