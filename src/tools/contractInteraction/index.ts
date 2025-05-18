import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers, Interface } from "ethers";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";

export function registerContractInteractionTools(server: McpServer) {
  // 1. Code Analysis
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
        return {
          content: [{ type: "text", text: `Error: ${handleError(error)}` }],
        };
      }
    }
  );

  // 2. ABI Decoding
  server.tool(
    "decodeCalldata",
    "Decode transaction input data using Arbitrum contract ABIs",
    {
      contractAddress: z.string().describe("Contract address"),
      data: z.string().describe("Transaction input data"),
    },
    async ({ contractAddress, data }) => {
      try {
        // Get contract ABI from Etherscan or another source
        const abiResponse = await fetch(
          `https://api.arbiscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=YourApiKeyToken`
        );
        const abiData = await abiResponse.json();

        if (abiData.status !== "1" || !abiData.result) {
          return {
            content: [
              {
                type: "text",
                text: "No verified ABI found for contract",
              },
            ],
          };
        }

        // Decode function call
        const abi = JSON.parse(abiData.result);
        const iface = new Interface(abi);
        const decoded = iface.parseTransaction({ data });

        if (!decoded) {
          return {
            content: [
              {
                type: "text",
                text: "Could not decode transaction data",
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: `Decoded call:\nFunction: ${
                decoded.name
              }\nArgs: ${JSON.stringify(decoded.args, null, 2)}`,
            },
          ],
        };
      } catch (error: unknown) {
        return {
          content: [
            {
              type: "text",
              text: `Decoding failed: ${handleError(error)}`,
            },
          ],
        };
      }
    }
  );

  // 3. Event Monitoring
  server.tool(
    "getContractEvents",
    "Query specific events from Arbitrum contracts",
    {
      contractAddress: z.string().describe("Contract address"),
      eventSignature: z.string().describe("Event signature"),
      fromBlock: z.number().optional().describe("Starting block number"),
      toBlock: z.number().optional().describe("Ending block number"),
    },
    async ({ contractAddress, eventSignature, fromBlock, toBlock }) => {
      try {
        const eventId = ethers.id(eventSignature);
        const logs = await alchemy.core.getLogs({
          address: contractAddress,
          topics: [eventId],
          fromBlock: fromBlock ? `0x${fromBlock.toString(16)}` : "earliest",
          toBlock: toBlock ? `0x${toBlock.toString(16)}` : "latest",
        });

        return {
          content: [
            {
              type: "text",
              text: `Found ${logs.length} events:\n${JSON.stringify(
                logs,
                null,
                2
              )}`,
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
