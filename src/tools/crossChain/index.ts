import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ethers, Interface } from "ethers";
import { handleError } from "../common.js";
import { alchemy } from "../../index.js";
import { Alchemy, Network } from "alchemy-sdk";

export function registerCrossChainTools(server: McpServer) {
  // 1. Message Tracking
  server.tool(
    "getTransactionLogs",
    "Fetch and comment on all logs from a given transaction hash (L1 or L2), decoding known events.",
    {
      txHash: z
        .string()
        .describe("Transaction hash (0x…66) on either L1 or L2"),
    },
    async ({ txHash }) => {
      try {
        // 1) Validate
        if (!txHash.startsWith("0x") || txHash.length !== 66) {
          return {
            content: [
              {
                type: "text",
                text: "Invalid tx hash format. Must be 0x-prefixed + 64 hex chars.",
              },
            ],
          };
        }

        // 2) Try Arbitrum L2…
        let receipt = await alchemy.core
          .getTransactionReceipt(txHash)
          .catch(() => null);
        let which = "L2 (Arbitrum)";

        // 3) …then fall back to Ethereum Mainnet
        if (!receipt) {
          const l1 = new Alchemy({
            apiKey: process.env.ALCHEMY_API_KEY!,
            network: Network.ETH_MAINNET,
          });
          receipt = await l1.core
            .getTransactionReceipt(txHash)
            .catch(() => null);
          which = "L1 (Ethereum)";
        }

        if (!receipt) {
          return {
            content: [
              {
                type: "text",
                text: `TX ${txHash} not found or pending on both L2 and L1.`,
              },
            ],
          };
        }

        // 4) List out your events with both canonical (hash) sig and full (decode) ABI:
        const EVENTS = [
          {
            name: "MessageDelivered",
            hashSig:
              "MessageDelivered(uint256,bytes32,address,uint8,address,bytes32,uint256,uint64)",
            abiSig:
              "event MessageDelivered(uint256 indexed messageIndex, bytes32 indexed beforeInboxAcc, address inbox, uint8 kind, address sender, bytes32 messageDataHash, uint256 baseFeeL1, uint64 timestamp)",
          },
          {
            name: "InboxMessageDelivered",
            hashSig: "InboxMessageDelivered(uint256,bytes)",
            abiSig:
              "event InboxMessageDelivered(uint256 indexed messageNum, bytes data)",
          },
          {
            name: "TicketCreated",
            hashSig: "TicketCreated(bytes32)",
            abiSig: "event TicketCreated(bytes32 indexed userTxHash)",
          },
          {
            name: "InboxMessageDeliveredFromOrigin",
            hashSig: "InboxMessageDeliveredFromOrigin(uint256)",
            abiSig:
              "event InboxMessageDeliveredFromOrigin(uint256 indexed messageIndex)",
          },
          {
            name: "OutboxEntryCreated",
            hashSig: "OutboxEntryCreated(uint256,bytes32)",
            abiSig:
              "event OutboxEntryCreated(uint256 indexed batchNumber, bytes32 batchRoot)",
          },
          {
            name: "ERC20DepositInitiated",
            hashSig:
              "ERC20DepositInitiated(address,address,address,uint256,uint256)",
            abiSig:
              "event ERC20DepositInitiated(address indexed l1Token, address indexed from, address indexed to, uint256 amount, uint256 l1Gas)",
          },
          {
            name: "ERC20WithdrawalFinalized",
            hashSig:
              "ERC20WithdrawalFinalized(address,address,address,uint256)",
            abiSig:
              "event ERC20WithdrawalFinalized(address indexed l2Token, address indexed from, address indexed to, uint256 amount)",
          },
          {
            name: "ETHDepositInitiated",
            hashSig: "ETHDepositInitiated(address,address,uint256,uint256)",
            abiSig:
              "event ETHDepositInitiated(address indexed from, address indexed to, uint256 amount, uint256 l1Gas)",
          },
          {
            name: "ETHWithdrawalFinalized",
            hashSig: "ETHWithdrawalFinalized(address,address,uint256)",
            abiSig:
              "event ETHWithdrawalFinalized(address indexed from, address indexed to, uint256 amount)",
          },
          {
            name: "Transfer",
            hashSig: "Transfer(address,address,uint256)",
            abiSig:
              "event Transfer(address indexed from, address indexed to, uint256 value)",
          },
          {
            name: "Approval",
            hashSig: "Approval(address,address,uint256)",
            abiSig:
              "event Approval(address indexed owner, address indexed spender, uint256 value)",
          },
        ];

        // 5) Precompute topic hashes and interfaces
        const TOPICS: Record<string, string> = {};
        const IFACES: Record<string, Interface> = {};
        for (const e of EVENTS) {
          TOPICS[e.name] = ethers.id(e.hashSig);
          IFACES[e.name] = new Interface([e.abiSig]);
        }

        // 6) Decode logs
        const out: string[] = [];
        for (let i = 0; i < receipt.logs.length; i++) {
          const log = receipt.logs[i];
          const t0 = log.topics[0] as string;
          let found = false;

          for (const { name } of EVENTS) {
            if (t0 === TOPICS[name]) {
              // decode
              const parsed = IFACES[name].parseLog(log)!;
              // turn args into key=val pairs
              const argsList = parsed.args.map((argValue, idx) => {
                const key = parsed.fragment.inputs[idx].name || `arg${idx}`;
                const val = argValue;
                return `${key}=${
                  val !== null && val !== undefined ? val.toString() : "null"
                }`;
              });
              out.push(`🔖 ${name} #${i + 1} → ${argsList.join(", ")}`);
              found = true;
              break;
            }
          }

          if (!found) {
            out.push(`🔍 Unknown Log #${i + 1}
  • address: ${log.address}
  • topics:  ${log.topics.join(", ")}
  • data:    ${log.data}`);
          }
        }

        // 7) Return
        return {
          content: [
            {
              type: "text",
              text: `Logs for ${which} TX ${txHash}:\n\n${out.join("\n\n")}`,
            },
          ],
        };
      } catch (err: any) {
        console.error(err);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${handleError(err)}`,
            },
          ],
        };
      }
    }
  );
}
