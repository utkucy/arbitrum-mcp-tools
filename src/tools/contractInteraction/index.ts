import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers, Interface } from "ethers";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";
import { AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

// Types for better TypeScript support
interface ArbiscanResponse {
  status: string;
  message?: string;
  result: string;
}

interface ABIInput {
  name: string;
  type: string;
  indexed?: boolean;
}

interface ABIFunction {
  type: string;
  name: string;
  inputs?: ABIInput[];
  outputs?: ABIInput[];
  stateMutability?: string;
}

interface FormattedArg {
  type: string;
  value: string;
}

interface FormattedArgs {
  [key: string]: FormattedArg;
}

export function registerContractInteractionTools(server: McpServer) {
  // 1. Code Analysis
  server.tool(
    "getContractCode",
    "Retrieve the bytecode of a contract at a specific address and optionally at a given block.",
    {
      contractAddress: z
        .string()
        .describe(
          "The address or ENS name of the account to get the code for."
        ),
      blockTag: z
        .string()
        .optional()
        .describe(
          "The optional block number, hash, or tag (e.g., 'latest', 'pending', 'safe', 'finalized', 'earliest') to get the code for. Defaults to 'latest' if unspecified."
        ),
    },
    async ({ contractAddress, blockTag }) => {
      try {
        const code = await alchemy.core.getCode(
          contractAddress,
          blockTag || "latest"
        );
        if (code === "0x") {
          return {
            content: [
              {
                type: "text",
                text: "No contract deployed at this address or block.",
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Contract code:\n${code}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [{ type: "text", text: `Error: ${handleError(error)}` }],
        };
      }
    }
  );

  // 2. ABI Decoding
  server.tool(
    "decodeTransactionCalldata",
    "Decode transaction input data using Arbitrum contract ABIs. Automatically detects the target contract from transaction hash.",
    {
      transactionHash: z
        .string()
        .describe(
          "Transaction hash to decode (automatically detects contract address from transaction)"
        ),
    },
    async ({ transactionHash }) => {
      try {
        const apiKey = process.env.ARBISCAN_API_KEY;
        if (!apiKey) {
          return {
            content: [
              {
                type: "text",
                text: "ARBISCAN_API_KEY is not configured. Please set it in your environment variables.",
              },
            ],
          };
        }

        let inputData: string;
        let contractAddress: string;
        let txDetails: any = null;

        // Get transaction details to extract input data and contract address
        try {
          const tx = await alchemy.core.getTransaction(transactionHash);
          if (!tx) {
            return {
              content: [
                {
                  type: "text",
                  text: `Transaction ${transactionHash} not found on Arbitrum network`,
                },
              ],
            };
          }

          inputData = tx.data;
          txDetails = tx;

          // Auto-detect contract address from transaction
          if (tx.to) {
            contractAddress = tx.to;
          } else {
            return {
              content: [
                {
                  type: "text",
                  text: `Transaction ${transactionHash} appears to be a contract creation. No target contract address available for ABI lookup.`,
                },
              ],
            };
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch transaction: ${errorMessage}. Make sure the transaction exists on Arbitrum.`,
              },
            ],
          };
        }

        // Validate input data
        if (!inputData || inputData === "0x") {
          return {
            content: [
              {
                type: "text",
                text: "No input data to decode. This might be a simple ETH transfer.",
              },
            ],
          };
        }

        // Validate hex format
        if (!inputData.startsWith("0x") || inputData.length < 10) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid input data format. Expected hex string starting with 0x and at least 4 bytes long.",
              },
            ],
          };
        }

        // Get contract ABI from Arbiscan
        let abiData: ArbiscanResponse;
        try {
          const abiResponse = await fetch(
            `https://api.arbiscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${apiKey}`,
            {
              headers: {
                "User-Agent": "Arbitrum-ABI-Decoder/1.0",
              },
            }
          );

          if (!abiResponse.ok) {
            throw new Error(
              `Arbiscan API returned ${abiResponse.status}: ${abiResponse.statusText}`
            );
          }

          abiData = (await abiResponse.json()) as ArbiscanResponse;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: `Failed to fetch contract ABI: ${errorMessage}. Check if the contract address is correct and verified on Arbiscan.`,
              },
            ],
          };
        }

        // Check ABI response
        if (abiData.status !== "1" || !abiData.result) {
          const errorMsg = abiData.message || "Unknown error";
          return {
            content: [
              {
                type: "text",
                text: `No verified ABI found for contract ${contractAddress}. Error: ${errorMsg}. Make sure the contract is verified on Arbiscan.`,
              },
            ],
          };
        }

        // Parse and validate ABI
        let abi: ABIFunction[];
        try {
          abi = JSON.parse(abiData.result) as ABIFunction[];
          if (!Array.isArray(abi)) {
            throw new Error("ABI is not a valid array");
          }
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          return {
            content: [
              {
                type: "text",
                text: `Invalid ABI format received from Arbiscan: ${errorMessage}`,
              },
            ],
          };
        }

        // Decode function call
        let decoded: any;
        try {
          const iface = new Interface(abi);
          decoded = iface.parseTransaction({ data: inputData });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          // Try to extract function selector for better error reporting
          const selector = inputData.slice(0, 10);
          return {
            content: [
              {
                type: "text",
                text: `Could not decode transaction data. Function selector: ${selector}. Error: ${errorMessage}. This might be a function not present in the contract ABI or invalid calldata.`,
              },
            ],
          };
        }

        if (!decoded) {
          return {
            content: [
              {
                type: "text",
                text: "Could not decode transaction data. The function signature might not match the contract ABI.",
              },
            ],
          };
        }

        // Format the decoded arguments nicely
        const formatArguments = (
          args: any[],
          inputs?: ABIInput[]
        ): FormattedArgs => {
          const formatted: FormattedArgs = {};
          if (inputs && inputs.length > 0) {
            inputs.forEach((input: ABIInput, index: number) => {
              const value = args[index];
              formatted[input.name || `param${index}`] = {
                type: input.type,
                value: value?.toString() || String(value || ""),
              };
            });
          } else {
            // Fallback if no input info available
            args.forEach((arg: any, index: number) => {
              formatted[`param${index}`] = {
                type: "unknown",
                value: arg?.toString() || String(arg || ""),
              };
            });
          }
          return formatted;
        };

        // Find function definition for parameter names
        const functionDefinition = abi.find(
          (item: ABIFunction) =>
            item.type === "function" && item.name === decoded.name
        );

        const formattedArguments = formatArguments(
          decoded.args,
          functionDefinition?.inputs
        );

        // Build comprehensive response
        let responseText = `✅ Successfully decoded transaction calldata\n\n`;
        responseText += `🔗 Transaction Hash: ${transactionHash}\n`;
        responseText += `📍 Target Contract: ${contractAddress}\n`;
        responseText += `⚡ Function Called: ${decoded.name}\n`;
        responseText += `🔧 Function Selector: ${inputData.slice(0, 10)}\n\n`;

        responseText += `📊 Function Parameters:\n`;

        if (Object.keys(formattedArguments).length > 0) {
          Object.entries(formattedArguments).forEach(
            ([paramName, paramInfo]: [string, FormattedArg]) => {
              // Handle long values by truncating if necessary
              let displayValue = paramInfo.value;
              if (paramInfo.type === "bytes" && displayValue.length > 100) {
                displayValue = `${displayValue.substring(0, 100)}... (${
                  displayValue.length
                } chars total)`;
              }
              responseText += `  • ${paramName} (${paramInfo.type}): ${displayValue}\n`;
            }
          );
        } else {
          responseText += `  • No parameters required\n`;
        }

        responseText += `\n💰 Transaction Value: ${
          txDetails.value
            ? `${parseInt(txDetails.value.toString()) / 1e18} ETH`
            : "0 ETH"
        }\n`;
        responseText += `⛽ Gas Limit: ${
          txDetails.gasLimit?.toString() || "Unknown"
        }\n`;
        responseText += `🧮 Nonce: ${txDetails.nonce}\n`;
        responseText += `👤 From Address: ${txDetails.from || "Unknown"}\n`;

        return {
          content: [
            {
              type: "text",
              text: responseText,
            },
          ],
        };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text",
              text: `❌ Decoding failed: ${errorMessage}\n\nTroubleshooting:\n1. Verify the transaction exists on Arbitrum\n2. Check if the contract is verified on Arbiscan\n3. Ensure the transaction hash is correct`,
            },
          ],
        };
      }
    }
  );

  // 3. Event Monitoring
  server.tool(
    "getContractEvents",
    "Query specific events from Arbitrum contracts with intelligent block range management and auto-discovery",
    {
      contractAddress: z.string().describe("Contract address"),
      eventSignature: z
        .string()
        .optional()
        .describe(
          "Event signature (e.g., 'Transfer(address,address,uint256)')"
        ),
      fromBlock: z.number().optional().describe("Starting block number"),
      toBlock: z.number().optional().describe("Ending block number"),
      maxBlocks: z
        .number()
        .optional()
        .default(250)
        .describe("Maximum blocks per query (default: 500)"),
      limit: z
        .number()
        .optional()
        .default(1000)
        .describe("Maximum number of events to return (default: 1000)"),
      topics: z
        .array(z.string())
        .optional()
        .describe("Additional topic filters"),
      autoDiscover: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Automatically find active periods if no events found (default: true)"
        ),
      searchDepth: z
        .number()
        .optional()
        .default(5)
        .describe(
          "Number of block ranges to search when auto-discovering (default: 5)"
        ),
    },
    async ({
      contractAddress,
      eventSignature,
      fromBlock,
      toBlock,
      maxBlocks = 250,
      limit = 1000,
      topics,
      autoDiscover = true,
      searchDepth = 5,
    }) => {
      try {
        // Ensure maxBlocks doesn't exceed API limit
        const safeMaxBlocks = Math.min(maxBlocks, 250);

        // Get current block
        const currentBlock = await alchemy.core.getBlockNumber();

        // Smart block range determination
        let startBlock: number;
        let endBlock: number;

        if (fromBlock && toBlock) {
          // User specified both blocks
          if (toBlock - fromBlock > safeMaxBlocks) {
            // Split into chunks and query the most recent chunk first
            endBlock = toBlock;
            startBlock = Math.max(fromBlock, endBlock - safeMaxBlocks);
          } else {
            startBlock = fromBlock;
            endBlock = toBlock;
          }
        } else if (fromBlock) {
          // Only fromBlock specified - search forward
          startBlock = fromBlock;
          endBlock = Math.min(fromBlock + safeMaxBlocks, currentBlock);
        } else if (toBlock) {
          // Only toBlock specified - search backward
          endBlock = toBlock;
          startBlock = Math.max(0, endBlock - safeMaxBlocks);
        } else {
          // No blocks specified - start with recent blocks
          endBlock = currentBlock;
          startBlock = Math.max(0, currentBlock - safeMaxBlocks);
        }

        // Build topics array
        let topicsArray: (string | null)[] = [];

        if (eventSignature) {
          const eventId = ethers.id(eventSignature);
          topicsArray.push(eventId);
        }

        if (topics && topics.length > 0) {
          if (topicsArray.length > 0) {
            topicsArray = topicsArray.concat(topics);
          } else {
            topicsArray = topics;
          }
        }

        // Helper function to query a specific range
        const queryRange = async (from: number, to: number) => {
          try {
            const logs = await alchemy.core.getLogs({
              address: contractAddress,
              topics: topicsArray.length > 0 ? topicsArray : undefined,
              fromBlock: `0x${from.toString(16)}`,
              toBlock: `0x${to.toString(16)}`,
            });
            return { logs, from, to, error: null };
          } catch (error) {
            return { logs: [], from, to, error: error as Error };
          }
        };

        // Initial query
        let result = await queryRange(startBlock, endBlock);
        let allLogs = result.logs;
        const queriedRanges = [
          { from: startBlock, to: endBlock, found: result.logs.length },
        ];

        // Auto-discovery: if no events found and autoDiscover is enabled
        if (allLogs.length === 0 && autoDiscover && !result.error) {
          // Try to find the contract's first transaction to get a better range
          try {
            const txHistory = await alchemy.core.getAssetTransfers({
              fromAddress: contractAddress,
              category: [
                AssetTransfersCategory.EXTERNAL,
                AssetTransfersCategory.ERC20,
                AssetTransfersCategory.ERC721,
                AssetTransfersCategory.ERC1155,
              ],
              maxCount: 1,
              order: SortingOrder.ASCENDING,
            });

            if (txHistory.transfers.length > 0) {
              const firstTxBlock = txHistory.transfers[0].blockNum;
              if (typeof firstTxBlock === "string") {
                const firstBlock = parseInt(firstTxBlock, 16);
                console.log(`Found first transaction at block ${firstBlock}`);

                // Search from first transaction forward in chunks
                for (let i = 0; i < searchDepth && allLogs.length === 0; i++) {
                  const searchStart = firstBlock + i * safeMaxBlocks;
                  const searchEnd = Math.min(
                    searchStart + safeMaxBlocks,
                    currentBlock
                  );

                  if (searchStart >= currentBlock) break;

                  const searchResult = await queryRange(searchStart, searchEnd);
                  if (searchResult.logs.length > 0) {
                    allLogs = searchResult.logs;
                    queriedRanges.push({
                      from: searchStart,
                      to: searchEnd,
                      found: searchResult.logs.length,
                    });
                    break;
                  }
                  queriedRanges.push({
                    from: searchStart,
                    to: searchEnd,
                    found: 0,
                  });
                }
              }
            }
          } catch (e) {
            console.log("Could not get transaction history for auto-discovery");
          }

          // If still no events, try recent blocks in reverse chronological order
          if (allLogs.length === 0) {
            for (let i = 1; i <= searchDepth && allLogs.length === 0; i++) {
              const searchEnd = currentBlock - (i - 1) * safeMaxBlocks;
              const searchStart = Math.max(0, searchEnd - safeMaxBlocks);

              if (searchStart < 0 || searchEnd <= searchStart) break;

              // Skip if we already queried this range
              const alreadyQueried = queriedRanges.some(
                (r) => r.from === searchStart && r.to === searchEnd
              );

              if (!alreadyQueried) {
                const searchResult = await queryRange(searchStart, searchEnd);
                if (searchResult.logs.length > 0) {
                  allLogs = searchResult.logs;
                  queriedRanges.push({
                    from: searchStart,
                    to: searchEnd,
                    found: searchResult.logs.length,
                  });
                  break;
                }
                queriedRanges.push({
                  from: searchStart,
                  to: searchEnd,
                  found: 0,
                });
              }
            }
          }
        }

        // Handle the original query error
        if (result.error) {
          throw result.error;
        }

        // Limit results if too many
        const limitedLogs = allLogs.slice(0, limit);
        const truncated = allLogs.length > limit;

        // Enhanced response with metadata
        const response = {
          contract: contractAddress,
          queriedRanges,
          eventSignature: eventSignature || "All events",
          totalFound: allLogs.length,
          returned: limitedLogs.length,
          truncated,
          autoDiscoveryUsed: autoDiscover && queriedRanges.length > 1,
          events: limitedLogs.map((log, index) => ({
            index,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            topics: log.topics,
            data: log.data,
            removed: log.removed,
          })),
        };

        // Build result text
        let resultText = `Contract Events Query Results
  =====================================
  Contract: ${contractAddress}
  Event Filter: ${eventSignature || "All events"}
  Total Found: ${allLogs.length} events
  Returned: ${limitedLogs.length} events`;

        // Show queried ranges
        resultText += `\n\nQueried Ranges:`;
        queriedRanges.forEach((range, i) => {
          resultText += `\n  ${i + 1}. Blocks ${range.from} to ${range.to} (${
            range.to - range.from
          } blocks) - Found: ${range.found} events`;
        });

        if (response.autoDiscoveryUsed) {
          resultText += `\n\n🔍 Auto-discovery was used to find active periods`;
        }

        if (truncated) {
          resultText += `\n\n⚠️  Results truncated to ${limit} events. Use smaller block ranges or more specific filters for complete results.`;
        }

        if (limitedLogs.length === 0) {
          resultText += `\n\nNo events found in any of the queried ranges.`;

          // Provide helpful suggestions based on what was tried
          resultText += `\n\nSuggestions:`;
          if (autoDiscover) {
            resultText += `\n  - The contract may not emit events, or events may be in a different time period`;
            resultText += `\n  - Try specifying a custom block range if you know when the contract was active`;
            resultText += `\n  - Verify the contract address is correct: ${contractAddress}`;
          } else {
            resultText += `\n  - Try enabling auto-discovery to search for active periods`;
            resultText += `\n  - Expand your block range or try different time periods`;
            resultText += `\n  - Verify the event signature format if specified`;
          }
          resultText += `\n  - Check if this is the correct contract address`;
          resultText += `\n  - Some contracts may have very low activity or only emit events during specific operations`;
        } else {
          resultText += `\n\nEvents:\n${JSON.stringify(
            response.events,
            null,
            2
          )}`;

          // Add helpful context about the found events
          if (response.events.length > 0) {
            const blockNumbers = response.events.map((e) => e.blockNumber);
            const minBlock = Math.min(...blockNumbers);
            const maxBlock = Math.max(...blockNumbers);
            resultText += `\n\n📊 Event Distribution:
    - Block range: ${minBlock} to ${maxBlock}
    - Unique transactions: ${
      new Set(response.events.map((e) => e.transactionHash)).size
    }
    - Event topics: ${
      new Set(response.events.flatMap((e) => e.topics)).size
    } unique`;
          }
        }

        return {
          content: [
            {
              type: "text",
              text: resultText,
            },
          ],
        };
      } catch (error: unknown) {
        // Enhanced error handling
        const errorMessage = handleError(error);
        let helpfulError = `Error querying contract events: ${errorMessage}`;

        // Provide specific guidance for common errors
        if (
          errorMessage.includes("block range") ||
          errorMessage.includes("500 block")
        ) {
          helpfulError += `\n\n💡 Block Range Issue:
    - The query exceeded the 500-block limit
    - Try specifying smaller block ranges (e.g., 250 blocks at a time)
    - Use the auto-discovery feature to find active periods automatically`;
        } else if (errorMessage.includes("invalid address")) {
          helpfulError += `\n\n💡 Address Issue:
    - Ensure the contract address is a valid Ethereum address
    - Check for typos in the address: ${contractAddress}`;
        } else if (
          errorMessage.includes("topic") ||
          errorMessage.includes("signature")
        ) {
          helpfulError += `\n\n💡 Event Signature Issue:
    - Check the event signature format
    - Example: 'Transfer(address,address,uint256)'
    - Ensure parameter types match exactly`;
        } else if (
          errorMessage.includes("timeout") ||
          errorMessage.includes("rate limit")
        ) {
          helpfulError += `\n\n💡 API Issue:
    - The request may have timed out or hit rate limits
    - Try reducing the block range or adding delays between requests`;
        }

        return {
          content: [
            {
              type: "text",
              text: helpfulError,
            },
          ],
        };
      }
    }
  );

  // 4. Allowance Checks
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
