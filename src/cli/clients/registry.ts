export interface PlatformConfig {
  name: string;
  format: "json" | "toml";
  configKey: string;
  global: {
    darwin: string;
    win32: string;
    linux: string;
  };
  local: string;
}

export const platforms: Record<string, PlatformConfig> = {
  "claude-desktop": {
    name: "Claude Desktop",
    format: "json",
    configKey: "mcpServers",
    global: {
      darwin: "~/Library/Application Support/Claude/claude_desktop_config.json",
      win32: "%APPDATA%/Claude/claude_desktop_config.json",
      linux: "~/.config/Claude/claude_desktop_config.json",
    },
    local: ".claude/mcp.json",
  },
  "claude-code": {
    name: "Claude Code",
    format: "json",
    configKey: "mcpServers",
    global: {
      darwin: "~/.claude.json",
      win32: "~/.claude.json",
      linux: "~/.claude.json",
    },
    local: ".mcp.json",
  },
  cursor: {
    name: "Cursor",
    format: "json",
    configKey: "mcpServers",
    global: {
      darwin: "~/.cursor/mcp.json",
      win32: "~/.cursor/mcp.json",
      linux: "~/.cursor/mcp.json",
    },
    local: ".cursor/mcp.json",
  },
  windsurf: {
    name: "Windsurf",
    format: "json",
    configKey: "mcpServers",
    global: {
      darwin: "~/.codeium/windsurf/mcp_config.json",
      win32: "%USERPROFILE%/.codeium/windsurf/mcp_config.json",
      linux: "~/.codeium/windsurf/mcp_config.json",
    },
    local: ".windsurf/mcp.json",
  },
  vscode: {
    name: "VS Code",
    format: "json",
    configKey: "servers",
    global: {
      darwin: "~/.vscode/mcp.json",
      win32: "~/.vscode/mcp.json",
      linux: "~/.vscode/mcp.json",
    },
    local: ".vscode/mcp.json",
  },
  gemini: {
    name: "Gemini CLI",
    format: "json",
    configKey: "mcpServers",
    global: {
      darwin: "~/.gemini/settings.json",
      win32: "~/.gemini/settings.json",
      linux: "~/.gemini/settings.json",
    },
    local: ".gemini/settings.json",
  },
  codex: {
    name: "OpenAI Codex",
    format: "toml",
    configKey: "mcp_servers",
    global: {
      darwin: "~/.codex/config.toml",
      win32: "~/.codex/config.toml",
      linux: "~/.codex/config.toml",
    },
    local: ".codex/config.toml",
  },
};

export function getPlatformIds(): string[] {
  return Object.keys(platforms);
}

export function getPlatformConfig(platformId: string): PlatformConfig | undefined {
  return platforms[platformId];
}
