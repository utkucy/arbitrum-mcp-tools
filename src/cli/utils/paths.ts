import path from "path";
import fs from "fs";
import { getPlatform, getHomeDir } from "./platform.js";

export function resolvePath(pathTemplate: string): string {
  const platform = getPlatform();
  const homeDir = getHomeDir();

  let resolved = pathTemplate;

  // Handle ~ (home directory) - works on all platforms
  if (resolved.startsWith("~")) {
    resolved = resolved.replace("~", homeDir);
  }

  // Handle Windows environment variables
  if (platform === "win32") {
    resolved = resolved.replace("%APPDATA%", process.env.APPDATA || "");
    resolved = resolved.replace("%USERPROFILE%", process.env.USERPROFILE || homeDir);
    resolved = resolved.replace("%LOCALAPPDATA%", process.env.LOCALAPPDATA || "");
  }

  // Normalize path separators for current platform
  return path.normalize(resolved);
}

export function getLocalConfigPath(localTemplate: string): string {
  const cwd = process.cwd();
  return path.join(cwd, localTemplate);
}

export function getGlobalConfigPath(globalPaths: Record<string, string>): string {
  const platform = getPlatform();
  const pathTemplate = globalPaths[platform];

  if (!pathTemplate) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return resolvePath(pathTemplate);
}

export function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
