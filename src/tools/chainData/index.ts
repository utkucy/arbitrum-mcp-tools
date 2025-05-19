import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { formatEther } from "ethers";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

export function registerChainDataTools(server: McpServer) {
  // 1. Block Number
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
        return {
          content: [{ type: "text", text: `Error: ${handleError(error)}` }],
        };
      }
    }
  );

  // 2. Block Details
  server.tool(
    "getBlock",
    "Get details of a block by number or hash",
    {
      block: z
        .string()
        .describe(
          "Block number (as a string), block hash, or one of the following tags: 'latest', 'pending', 'earliest'"
        ),
    },
    async ({ block }) => {
      try {
        const blockData = await alchemy.core.getBlock(block);
        if (!blockData) {
          return {
            content: [{ type: "text", text: "Block not found." }],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Block details:\n${JSON.stringify(blockData, null, 2)}`,
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

  // 3. Gas Metrics
  server.tool(
    "getGasParameters",
    "Get detailed Arbitrum gas price metrics",
    {},
    async () => {
      try {
        const [gasPrice, feeData] = await Promise.all([
          alchemy.core.getGasPrice(),
          alchemy.core.getFeeData(),
        ]);

        return {
          content: [
            {
              type: "text",
              text: `Current gas metrics:
          - Base Fee: ${formatEther(
            feeData.lastBaseFeePerGas
              ? feeData.lastBaseFeePerGas.toString()
              : "0"
          )} ETH
          - Max Priority Fee: ${formatEther(
            feeData.maxPriorityFeePerGas
              ? feeData.maxPriorityFeePerGas.toString()
              : "0"
          )} ETH
          - Max Fee: ${formatEther(
            feeData.maxFeePerGas ? feeData.maxFeePerGas.toString() : "0"
          )} ETH
          - Gas Price: ${formatEther(gasPrice.toString())} ETH`,
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

  // 4. Get Transaction Details
  server.tool(
    "getTransaction",
    "Get details of a transaction by hash",
    { txHash: z.string().describe("Transaction hash") },
    async ({ txHash }) => {
      try {
        const txData = await alchemy.core.getTransaction(txHash);
        if (!txData) {
          return {
            content: [
              {
                type: "text",
                text: "Transaction not found or not yet indexed.",
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Transaction details:\n${JSON.stringify(txData, null, 2)}`,
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

  // 5. Get Transaction Receipt
  server.tool(
    "getTransactionReceipt",
    "Get the transaction receipt for a given transaction hash",
    { txHash: z.string().describe("Transaction hash") },
    async ({ txHash }) => {
      try {
        const receipt = await alchemy.core.getTransactionReceipt(txHash);
        if (!receipt) {
          return {
            content: [
              {
                type: "text",
                text: "Transaction receipt not found or not yet indexed.",
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: `Transaction Receipt:\n${JSON.stringify(receipt, null, 2)}`,
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

  // 6. Get Gas Price
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
        return {
          content: [{ type: "text", text: `Error: ${handleError(error)}` }],
        };
      }
    }
  );
}
