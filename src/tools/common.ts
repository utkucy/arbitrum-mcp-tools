import { Alchemy, Network } from "alchemy-sdk";
import { formatUnits } from "ethers";

// Initialize Alchemy SDK
const ALCHEMY_API_KEY = "seo1fGnfF8ptB8mLEEyNUk78t619rUxP";
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY environment variable is required");
}

const alchemyConfig = {
  apiKey: ALCHEMY_API_KEY,
  network: Network.ARB_MAINNET,
};

export const alchemy = new Alchemy(alchemyConfig);

// Helper function to format token balance
export function formatTokenBalance(balance: bigint, decimals: number): string {
  return formatUnits(balance, decimals);
}

// Helper function for error handling
export function handleError(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error occurred";
}
