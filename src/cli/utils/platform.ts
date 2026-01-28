import os from "os";
import fs from "fs";

export type Platform = "darwin" | "win32" | "linux";

export function getPlatform(): Platform {
  const platform = os.platform();
  if (platform === "darwin" || platform === "win32" || platform === "linux") {
    return platform;
  }
  return "linux"; // Default fallback
}

export function getHomeDir(): string {
  return os.homedir();
}

export function directoryExists(path: string): boolean {
  try {
    return fs.existsSync(path) && fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function fileExists(path: string): boolean {
  try {
    return fs.existsSync(path) && fs.statSync(path).isFile();
  } catch {
    return false;
  }
}

export function isAppInstalled(appName: string): boolean {
  const platform = getPlatform();

  switch (appName) {
    case "claude-desktop":
      if (platform === "darwin") {
        return directoryExists("/Applications/Claude.app") ||
               fileExists(`${getHomeDir()}/Library/Application Support/Claude/claude_desktop_config.json`);
      } else if (platform === "win32") {
        return directoryExists(`${process.env.LOCALAPPDATA}/Programs/Claude`) ||
               fileExists(`${process.env.APPDATA}/Claude/claude_desktop_config.json`);
      }
      return fileExists(`${getHomeDir()}/.config/Claude/claude_desktop_config.json`);

    case "claude-code":
      // Claude Code CLI - check if .claude.json exists or claude command is available
      return fileExists(`${getHomeDir()}/.claude.json`) ||
             fileExists(`${getHomeDir()}/.claude/settings.json`);

    case "cursor":
      if (platform === "darwin") {
        return directoryExists("/Applications/Cursor.app") ||
               directoryExists(`${getHomeDir()}/.cursor`);
      }
      return directoryExists(`${getHomeDir()}/.cursor`);

    case "windsurf":
      return directoryExists(`${getHomeDir()}/.codeium/windsurf`);

    case "vscode":
      if (platform === "darwin") {
        return directoryExists("/Applications/Visual Studio Code.app") ||
               directoryExists(`${getHomeDir()}/.vscode`);
      }
      return directoryExists(`${getHomeDir()}/.vscode`);

    case "gemini":
      return directoryExists(`${getHomeDir()}/.gemini`);

    case "codex":
      return directoryExists(`${getHomeDir()}/.codex`);

    default:
      return false;
  }
}
