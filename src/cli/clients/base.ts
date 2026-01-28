import { PlatformConfig } from "./registry.js";
import { getGlobalConfigPath, getLocalConfigPath } from "../utils/paths.js";
import { isAppInstalled } from "../utils/platform.js";
import {
  addArbitrumToJsonConfig,
  removeArbitrumFromJsonConfig,
  isArbitrumInstalledInJsonConfig,
} from "./generators/json.js";
import {
  addArbitrumToTomlConfig,
  removeArbitrumFromTomlConfig,
  isArbitrumInstalledInTomlConfig,
} from "./generators/toml.js";

export type Scope = "global" | "local";

export interface InstallResult {
  success: boolean;
  path: string;
  error?: string;
}

export function getConfigPath(
  platform: PlatformConfig,
  scope: Scope
): string {
  if (scope === "global") {
    return getGlobalConfigPath(platform.global);
  } else {
    return getLocalConfigPath(platform.local);
  }
}

export function installToPlatform(
  platformId: string,
  platform: PlatformConfig,
  scope: Scope
): InstallResult {
  const configPath = getConfigPath(platform, scope);

  try {
    let success: boolean;

    if (platform.format === "json") {
      success = addArbitrumToJsonConfig(configPath, platform.configKey);
    } else {
      success = addArbitrumToTomlConfig(configPath, platform.configKey);
    }

    return {
      success,
      path: configPath,
    };
  } catch (error) {
    return {
      success: false,
      path: configPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function uninstallFromPlatform(
  platformId: string,
  platform: PlatformConfig,
  scope: Scope
): InstallResult {
  const configPath = getConfigPath(platform, scope);

  try {
    let success: boolean;

    if (platform.format === "json") {
      success = removeArbitrumFromJsonConfig(configPath, platform.configKey);
    } else {
      success = removeArbitrumFromTomlConfig(configPath, platform.configKey);
    }

    return {
      success,
      path: configPath,
    };
  } catch (error) {
    return {
      success: false,
      path: configPath,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export function isPlatformInstalled(
  platformId: string,
  platform: PlatformConfig,
  scope: Scope
): boolean {
  const configPath = getConfigPath(platform, scope);

  if (platform.format === "json") {
    return isArbitrumInstalledInJsonConfig(configPath, platform.configKey);
  } else {
    return isArbitrumInstalledInTomlConfig(configPath, platform.configKey);
  }
}

export function isPlatformDetected(platformId: string): boolean {
  return isAppInstalled(platformId);
}
