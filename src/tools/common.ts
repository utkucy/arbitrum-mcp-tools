import { Alchemy, Network } from "alchemy-sdk";
import { formatUnits } from "ethers";

// Helper function to format token balance
export function formatTokenBalance(balance: bigint, decimals: number): string {
  return formatUnits(balance, decimals);
}

// Helper function for error handling
export function handleError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error occurred";
}
