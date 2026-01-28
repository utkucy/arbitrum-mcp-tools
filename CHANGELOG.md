# Changelog

## v2.0.0 - Universal CLI Installer (Breaking Change)

### Overview

This major release completely overhauls the installation system. The old platform-specific setup scripts have been replaced with a single, interactive CLI wizard that supports all major MCP-compatible platforms.

---

### New Features

#### Universal Interactive CLI

```bash
npx arbitrum-mcp-tools install    # Interactive installation wizard
npx arbitrum-mcp-tools uninstall  # Interactive uninstall wizard
npx arbitrum-mcp-tools list       # Show platforms and installation status
npx arbitrum-mcp-tools --help     # Help
npx arbitrum-mcp-tools --version  # Version
```

**No flags required!** All selections are made interactively within the wizard.

#### Supported Platforms

| Platform | Global Config | Local Config |
|----------|---------------|--------------|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` | `.claude/mcp.json` |
| Claude Code | `~/.claude.json` | `.mcp.json` |
| Cursor | `~/.cursor/mcp.json` | `.cursor/mcp.json` |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | `.windsurf/mcp.json` |
| VS Code | `~/.vscode/mcp.json` | `.vscode/mcp.json` |
| Gemini CLI | `~/.gemini/settings.json` | `.gemini/settings.json` |
| OpenAI Codex | `~/.codex/config.toml` | `.codex/config.toml` |

#### Installation Scopes

- **Global**: Installs to user's home directory, available for all projects
- **Local**: Installs to current project directory only

#### Cross-Platform Support

- **macOS** (darwin)
- **Windows** (win32)
- **Linux**

Platform-specific paths and environment variable instructions are handled automatically.

---

### Breaking Changes

#### Removed Files

The following platform-specific setup scripts have been deleted:

- ❌ `setup-claude-server.js`
- ❌ `setup-cursor-server.js`
- ❌ `setup-windsurf-server.js`
- ❌ `setup-gemini-server.js`

#### Removed npm Scripts

```json
// REMOVED from package.json
"setup-claude": "...",
"setup-cursor": "...",
"setup-windsurf": "...",
"setup-gemini": "..."
```

#### Migration Guide

**Old way (v1.x):**
```bash
npm run setup-claude
npm run setup-cursor
```

**New way (v2.0):**
```bash
npx arbitrum-mcp-tools install
# Then select platforms interactively
```

---

### New Project Structure

```
arbitrum-mcp-tools/
├── src/
│   ├── index.ts                          # MCP server (unchanged)
│   ├── tools/                            # MCP tools (unchanged)
│   └── cli/
│       ├── index.ts                      # CLI entry point
│       ├── commands/
│       │   ├── install.ts                # Interactive install wizard
│       │   ├── uninstall.ts              # Interactive uninstall wizard
│       │   └── list.ts                   # Platform status list
│       ├── clients/
│       │   ├── base.ts                   # Platform operations
│       │   ├── registry.ts               # Platform definitions
│       │   └── generators/
│       │       ├── json.ts               # JSON config read/write
│       │       └── toml.ts               # TOML config read/write
│       └── utils/
│           ├── platform.ts               # OS detection
│           ├── paths.ts                  # Cross-platform path resolution
│           └── ui.ts                     # Terminal UI (boxen, chalk)
├── package.json
└── tsconfig.json
```

---

### Technical Changes

#### New Dependencies

```json
{
  "@inquirer/prompts": "^8.2.0",   // Interactive prompts
  "@iarna/toml": "^2.2.5",         // TOML parsing (for Codex)
  "chalk": "^5.6.2",               // Terminal colors
  "boxen": "^8.0.1"                // Terminal boxes
}
```

#### Package.json Updates

```json
{
  "version": "2.0.0",
  "bin": {
    "arbitrum-mcp-tools": "./build/src/cli/index.js"
  },
  "scripts": {
    "build": "tsc && shx chmod +x build/src/*.js build/src/cli/*.js"
  }
}
```

#### Environment Variables

Environment variables are NO LONGER embedded in config files. The MCP server reads directly from `process.env`. This ensures:

- Cross-platform compatibility
- No sensitive data in config files
- Works with all MCP clients

**Users must set environment variables in their shell profile:**

**macOS/Linux (~/.zshrc or ~/.bashrc):**
```bash
export ALCHEMY_API_KEY="your-key-here"
export ARBISCAN_API_KEY="your-key-here"
```

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable("ALCHEMY_API_KEY", "your-key", "User")
[System.Environment]::SetEnvironmentVariable("ARBISCAN_API_KEY", "your-key", "User")
```

#### Generated Config Format

**JSON (most platforms):**
```json
{
  "mcpServers": {
    "arbitrum": {
      "command": "node",
      "args": ["/path/to/arbitrum-mcp-tools/build/src/index.js"]
    }
  }
}
```

**TOML (Codex):**
```toml
[mcp_servers.arbitrum]
command = "node"
args = ["/path/to/arbitrum-mcp-tools/build/src/index.js"]
enabled = true
```

---

### Installation Flow

```
$ npx arbitrum-mcp-tools install

╭──────────────────────────────────────────╮
│   Arbitrum MCP Tools - Installation Wizard   │
╰──────────────────────────────────────────╯

? Which platforms do you want to install to? (Space to select, Enter to confirm)
  ○ Claude Desktop ✓ detected
  ○ Claude Code ✓ detected
  ○ Cursor ✓ detected
  ○ Windsurf
  ○ VS Code
  ○ Gemini CLI ✓ detected
  ○ OpenAI Codex

? Installation scope:
  ❯ Global (All projects - recommended)
    Local (Current directory only)

Selected platforms:
  • Claude Code

? Install to 1 platform(s) (global)? Yes

✓ Claude Code config updated

╭─────────────────────────────────────────────────╮
│  ✓ Installation complete!                       │
│                                                 │
│  ⚠  IMPORTANT: Set up your API keys:            │
│                                                 │
│  # Add to ~/.zshrc:                             │
│  export ALCHEMY_API_KEY="your-key-here"         │
│  export ARBISCAN_API_KEY="your-key-here"        │
│                                                 │
│  Then restart your terminal or run:             │
│  source ~/.zshrc                                │
│                                                 │
│  Restart your editors to apply changes.         │
╰─────────────────────────────────────────────────╯
```

---

### Platform Detection

The CLI automatically detects installed platforms:

| Platform | Detection Method |
|----------|------------------|
| Claude Desktop | `/Applications/Claude.app` or config file exists |
| Claude Code | `~/.claude.json` or `~/.claude/settings.json` exists |
| Cursor | `/Applications/Cursor.app` or `~/.cursor/` exists |
| Windsurf | `~/.codeium/windsurf/` exists |
| VS Code | `/Applications/Visual Studio Code.app` or `~/.vscode/` exists |
| Gemini CLI | `~/.gemini/` exists |
| OpenAI Codex | `~/.codex/` exists |

---

### List Command Output

```
$ npx arbitrum-mcp-tools list

╭──────────────────────────────────────────────╮
│   Arbitrum MCP Tools - Supported Platforms   │
╰──────────────────────────────────────────────╯

Platform                      │ Detected │ Global │ Local
─────────────────────────────────────────────────────────────
Claude Desktop               │ ✓        │ -      │ -
Claude Code                  │ ✓        │ -      │ ✓ installed
Cursor                       │ ✓        │ -      │ -
Windsurf                     │ -        │ -      │ -
VS Code                      │ -        │ -      │ -
Gemini CLI                   │ ✓        │ -      │ -
OpenAI Codex                 │ ✓        │ -      │ -

Legend:
  Detected: Platform app/folder found on system
  Global: Installed in user's home directory (all projects)
  Local: Installed in current directory (this project only)
```

---

### MCP Server (Unchanged)

The MCP server itself (`src/index.ts` and `src/tools/`) remains unchanged. All existing tools and functionality work exactly as before. Only the installation method has changed.

---

### Summary

| Feature | v1.x | v2.0 |
|---------|------|------|
| Installation | Multiple scripts | Single interactive CLI |
| Platforms | 4 (Claude, Cursor, Windsurf, Gemini) | 7 (+ Claude Code, VS Code, Codex) |
| Config format | JSON only | JSON + TOML |
| Scope | Global only | Global or Local |
| Cross-platform | Partial | Full (macOS, Windows, Linux) |
| Env vars in config | Yes (`${VAR}`) | No (reads from process.env) |
| 3rd party dependency | None | None (CLI uses inquirer, chalk, boxen) |
