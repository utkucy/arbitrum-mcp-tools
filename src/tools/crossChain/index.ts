import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers, Interface } from "ethers";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

export function registerCrossChainTools(server: McpServer) {
  // 1. Message Tracking
  server.tool(
    "getCrossChainMessageStatus",
    "Check L1->L2 message status in Arbitrum bridge",
    {
      l1TxHash: z
        .string()
        .describe("L1 transaction hash that initiated message"),
    },
    async ({ l1TxHash }) => {
      try {
        // Validate transaction hash format
        if (!l1TxHash.startsWith("0x") || l1TxHash.length !== 66) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid transaction hash format. Please provide a valid Ethereum transaction hash.",
              },
            ],
          };
        }

        // Get L1 transaction receipt
        const l1Receipt = await alchemy.core.getTransactionReceipt(l1TxHash);

        if (!l1Receipt) {
          return {
            content: [
              {
                type: "text",
                text: "Transaction not found or pending. Please verify the transaction hash and try again.",
              },
            ],
          };
        }

        // Parse bridge message data
        const inboxMessageDeliveredId = ethers.id(
          "InboxMessageDelivered(uint256,bytes)"
        );
        const inboxMessageDeliveredFromOriginId = ethers.id(
          "InboxMessageDeliveredFromOrigin(uint256)"
        );

        const logs = l1Receipt.logs || [];
        const messageEvents = logs.filter(
          (log) =>
            log.topics[0] === inboxMessageDeliveredId ||
            log.topics[0] === inboxMessageDeliveredFromOriginId
        );

        if (messageEvents.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No Arbitrum bridge messages found in the transaction. This may not be a cross-chain transaction.",
              },
            ],
          };
        }

        // Get L2 execution status
        const messageStatuses = await Promise.all(
          messageEvents.map(async (log, index) => {
            try {
              const messageNum = BigInt(log.topics[1]).toString();

              try {
                const l2TxInfo = await alchemy.core.send(
                  "arb_getL2Confirmations",
                  [messageNum]
                );

                if (!l2TxInfo) {
                  return {
                    messageNum,
                    status: "Pending",
                    l2TxHash: null,
                  };
                }

                return {
                  messageNum,
                  status: "Confirmed",
                  l2TxHash: l2TxInfo.transactionHash,
                };
              } catch (rpcError) {
                const errorMsg =
                  rpcError instanceof Error
                    ? rpcError.message
                    : "Unknown RPC error";

                if (
                  errorMsg.includes("not found") ||
                  errorMsg.includes("does not exist")
                ) {
                  return {
                    messageNum,
                    status: "Not Found",
                    error: "Message may be pending or not processed yet",
                  };
                }

                return {
                  messageNum,
                  status: "Error",
                  error: errorMsg,
                };
              }
            } catch (error) {
              return {
                index: index + 1,
                status: "Processing Error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Unknown error parsing message",
              };
            }
          })
        );

        // Format the response
        const formattedMessages = messageStatuses
          .map((msg, i) => {
            if (msg.status === "Confirmed") {
              return `Message ${i + 1} (${
                msg.messageNum
              }): Confirmed on L2 (TX: ${msg.l2TxHash})`;
            } else if (msg.status === "Pending") {
              return `Message ${i + 1} (${
                msg.messageNum
              }): Pending confirmation on L2`;
            } else {
              return `Message ${i + 1} (${msg.messageNum || ""}): ${
                msg.status
              } - ${msg.error || ""}`;
            }
          })
          .join("\n\n");

        return {
          content: [
            {
              type: "text",
              text: `Arbitrum Bridge Message Status:\n\n${formattedMessages}`,
            },
          ],
        };
      } catch (error: unknown) {
        console.error("Error processing cross-chain message:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error processing cross-chain message: ${handleError(
                error
              )}`,
            },
          ],
        };
      }
    }
  );
}
