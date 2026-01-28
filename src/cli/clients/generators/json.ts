import fs from "fs";
import { getPackagePath, ensureDirectoryExists } from "../../utils/paths.js";

export interface McpServerConfig {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface JsonConfig {
  [key: string]: unknown;
}

export function readJsonConfig(filePath: string): JsonConfig {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
  }
  return {};
}

export function writeJsonConfig(filePath: string, config: JsonConfig): void {
  ensureDirectoryExists(filePath);
  const content = JSON.stringify(config, null, 2);
  fs.writeFileSync(filePath, content, "utf-8");
}

export function generateMcpServerEntry(): McpServerConfig {
  const serverPath = getPackagePath();

  // Don't include env vars in config - server reads from process.env
  // This ensures cross-platform compatibility
  return {
    command: "node",
    args: [serverPath],
  };
}

export function addArbitrumToJsonConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    const config = readJsonConfig(filePath);

    // Ensure the config key exists
    if (!config[configKey]) {
      config[configKey] = {};
    }

    // Add arbitrum server
    const servers = config[configKey] as Record<string, McpServerConfig>;
    servers["arbitrum"] = generateMcpServerEntry();

    writeJsonConfig(filePath, config);
    return true;
  } catch (error) {
    console.error(`Error adding arbitrum to config: ${error}`);
    return false;
  }
}

export function removeArbitrumFromJsonConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const config = readJsonConfig(filePath);

    if (!config[configKey]) {
      return false;
    }

    const servers = config[configKey] as Record<string, McpServerConfig>;

    if (!servers["arbitrum"]) {
      return false;
    }

    delete servers["arbitrum"];

    // Clean up empty configKey
    if (Object.keys(servers).length === 0) {
      delete config[configKey];
    }

    writeJsonConfig(filePath, config);
    return true;
  } catch (error) {
    console.error(`Error removing arbitrum from config: ${error}`);
    return false;
  }
}

export function isArbitrumInstalledInJsonConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const config = readJsonConfig(filePath);

    if (!config[configKey]) {
      return false;
    }

    const servers = config[configKey] as Record<string, McpServerConfig>;
    return !!servers["arbitrum"];
  } catch {
    return false;
  }
}
