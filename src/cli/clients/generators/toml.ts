import fs from "fs";
import TOML from "@iarna/toml";
import { getPackagePath, ensureDirectoryExists } from "../../utils/paths.js";

export interface TomlConfig {
  [key: string]: unknown;
}

export interface TomlMcpServer {
  command: string;
  args: string[];
  enabled?: boolean;
  env?: Record<string, string>;
}

export function readTomlConfig(filePath: string): TomlConfig {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return TOML.parse(content) as TomlConfig;
    }
  } catch (error) {
    // File doesn't exist or is invalid, return empty object
  }
  return {};
}

export function writeTomlConfig(filePath: string, config: TomlConfig): void {
  ensureDirectoryExists(filePath);
  const content = TOML.stringify(config as TOML.JsonMap);
  fs.writeFileSync(filePath, content, "utf-8");
}

export function generateTomlMcpServerEntry(): TomlMcpServer {
  const serverPath = getPackagePath();

  // Don't include env vars in config - server reads from process.env
  // This ensures cross-platform compatibility
  return {
    command: "node",
    args: [serverPath],
    enabled: true,
  };
}

export function addArbitrumToTomlConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    const config = readTomlConfig(filePath);

    // Ensure the config key exists
    if (!config[configKey]) {
      config[configKey] = {};
    }

    // Add arbitrum server
    const servers = config[configKey] as Record<string, TomlMcpServer>;
    servers["arbitrum"] = generateTomlMcpServerEntry();

    writeTomlConfig(filePath, config);
    return true;
  } catch (error) {
    console.error(`Error adding arbitrum to TOML config: ${error}`);
    return false;
  }
}

export function removeArbitrumFromTomlConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const config = readTomlConfig(filePath);

    if (!config[configKey]) {
      return false;
    }

    const servers = config[configKey] as Record<string, TomlMcpServer>;

    if (!servers["arbitrum"]) {
      return false;
    }

    delete servers["arbitrum"];

    // Clean up empty configKey
    if (Object.keys(servers).length === 0) {
      delete config[configKey];
    }

    writeTomlConfig(filePath, config);
    return true;
  } catch (error) {
    console.error(`Error removing arbitrum from TOML config: ${error}`);
    return false;
  }
}

export function isArbitrumInstalledInTomlConfig(
  filePath: string,
  configKey: string
): boolean {
  try {
    if (!fs.existsSync(filePath)) {
      return false;
    }

    const config = readTomlConfig(filePath);

    if (!config[configKey]) {
      return false;
    }

    const servers = config[configKey] as Record<string, TomlMcpServer>;
    return !!servers["arbitrum"];
  } catch {
    return false;
  }
}
