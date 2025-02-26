import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers, Interface } from "ethers";
import { alchemy, handleError } from "../common.js";

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
        // Get L1 transaction receipt
        const l1Receipt = await alchemy.core.getTransactionReceipt(l1TxHash);

        // Parse bridge message data
        const iface = new Interface([
          "event InboxMessageDelivered(uint256 indexed messageNum, bytes data)",
          "event InboxMessageDeliveredFromOrigin(uint256 indexed messageNum)",
        ]);

        // Compute event hash ID for topics matching
        const inboxMessageDeliveredId = ethers.id(
          "InboxMessageDelivered(uint256,bytes)"
        );
        const inboxMessageDeliveredFromOriginId = ethers.id(
          "InboxMessageDeliveredFromOrigin(uint256)"
        );

        const logs = l1Receipt?.logs || [];
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
                text: "No cross-chain messages found in transaction",
              },
            ],
          };
        }

        // Get L2 execution status
        const l2TxHashes = await Promise.all(
          messageEvents.map(async (log) => {
            const messageNum = parseInt(log.topics[1], 16);
            const l2Tx = await alchemy.core.send("arb_getL2Confirmations", [
              messageNum,
            ]);
            return l2Tx ? l2Tx.transactionHash : "Pending";
          })
        );

        return {
          content: [
            {
              type: "text",
              text: `Message execution status:\n${messageEvents
                .map((_, i) => `Message ${i + 1}: ${l2TxHashes[i]}`)
                .join("\n")}`,
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
