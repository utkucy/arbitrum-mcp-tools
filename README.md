# Arbitrum MCP Tools 🚀🦾

This project provides a set of tools for interacting with the Arbitrum blockchain via the Model Context Protocol (MCP), enabling AI assistants like Claude Desktop, Claude Code, Cursor, Windsurf, VS Code, Gemini CLI, and OpenAI Codex to perform blockchain operations.

## Table of Contents 📚

- [Quick Start](#quick-start)
- [Prerequisites](#prerequisites)
- [Supported Platforms](#supported-platforms)
- [Environment Variables](#environment-variables)
- [CLI Commands](#cli-commands)
- [Available Tools](#available-tools)
- [Example Usage](#example-usage)
- [Development Guide](#development-guide)

## Quick Start 🚀

Install Arbitrum MCP Tools to your AI assistant with a single command:

```bash
npx arbitrum-mcp-tools install
```

This launches an interactive wizard that guides you through the setup process.

## Prerequisites 📝

- Node.js v20.x or higher
- npm (comes with Node.js)
- Alchemy API Key (sign up at https://www.alchemy.com/)
- Arbiscan API Key (optional, sign up at https://arbiscan.io) - Required for the `decodeTransactionCalldata` tool

## Supported Platforms 🖥️

Arbitrum MCP Tools supports **7 platforms** across macOS, Windows, and Linux:

| Platform | Format | Status |
|----------|--------|--------|
| Claude Desktop | JSON | ✅ Supported |
| Claude Code | JSON | ✅ Supported |
| Cursor | JSON | ✅ Supported |
| Windsurf | JSON | ✅ Supported |
| VS Code | JSON | ✅ Supported |
| Gemini CLI | JSON | ✅ Supported |
| OpenAI Codex | TOML | ✅ Supported |

## Environment Variables 🔐

Set these environment variables in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
# Required
export ALCHEMY_API_KEY="your_alchemy_api_key_here"

# Optional (for transaction decoding)
export ARBISCAN_API_KEY="your_arbiscan_api_key_here"

# Stylus Contract Authentication (choose one method)
# Option 1: Direct private key
export STYLUS_PRIVATE_KEY="your_private_key_here"

# Option 2: Path to private key file
export STYLUS_PRIVATE_KEY_PATH="/path/to/your/private/key/file"

# Option 3: Path to keystore file (most secure)
export STYLUS_KEYSTORE_PATH="/path/to/your/keystore/file"
```

Then reload your shell: `source ~/.zshrc`

### Windows (PowerShell)

```powershell
[Environment]::SetEnvironmentVariable("ALCHEMY_API_KEY", "your_key_here", "User")
```

## CLI Commands 🛠️

### install

Interactive installation wizard for setting up MCP tools.

```bash
npx arbitrum-mcp-tools install
```

### uninstall

Remove MCP tools from selected platforms.

```bash
npx arbitrum-mcp-tools uninstall
```

### list

Display all supported platforms and their installation status.

```bash
npx arbitrum-mcp-tools list
```

### serve

Start the MCP server (used internally by MCP clients).

```bash
npx arbitrum-mcp-tools serve
```

### --help / --version

```bash
npx arbitrum-mcp-tools --help
npx arbitrum-mcp-tools --version
```

## Available Tools 🧰

The tools are organized into several categories:

1. **Account Analysis** - Tools for checking balances, transactions, and tokens
2. **Chain Data** - Tools for retrieving blockchain data like blocks and transactions
3. **Contract Interaction** - Tools for interacting with smart contracts
4. **Cross-Chain** - Tools for cross-chain operations
5. **Development** - Tools for developers (simulation, gas estimation)
6. **Batch Operations** - Tools for performing operations on multiple addresses
7. **Stylus** - Tools for Stylus development and deployment

For a detailed list of all tools, see the [Feature Matrix](./FEATURES.md).

## Example Usage 📝

When using any supported AI assistant, you can simply ask for blockchain data using natural language:

- "What's the ETH balance of 0x123...?"
- "Check NFTs owned by 0xabc..."
- "How much gas is needed to transfer 1 ETH?"
- "Show me the latest block on Arbitrum"
- "Decode this transaction input data: 0x..."
- "Deploy my Stylus contract to Arbitrum Sepolia"

## Development Guide 🏗️

### Project Structure 🗂️

```
src/
├── index.ts                # Entry point (runs server)
├── server.ts               # MCP server setup and Alchemy config
├── cli/                    # CLI installer
│   ├── index.ts            # CLI entry point
│   ├── commands/           # CLI commands (install, uninstall, list, serve)
│   ├── clients/            # Platform config generators
│   └── utils/              # CLI utilities
├── tools/                  # All tools organized by category
│   ├── common.ts           # Shared utilities and configs
│   ├── index.ts            # Tool registration
│   ├── accountAnalysis/    # Account analysis tools
│   ├── chainData/          # Chain data tools
│   ├── contractInteraction/# Contract interaction tools
│   ├── crossChain/         # Cross-chain tools
│   ├── development/        # Development tools
│   ├── batchOperations/    # Batch operation tools
│   └── stylus/             # Stylus development tools
```

### Adding New Tools 🛠️

**Arbitrum MCP Tools uses an active registration pattern** – every tool is registered at runtime with `server.tool(...)`. To add a new tool:

1. **Add the tool to its category's `registerXTools` function**

```typescript
// src/tools/myCategory/index.ts
import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerMyCategoryTools(server: McpServer) {
  server.tool(
    "myNewTool",
    "Short description of what it does",
    {
      param1: z.string().describe("Example parameter"),
    },
    async ({ param1 }) => {
      return {
        content: [{ type: "text", text: `You sent ${param1}` }],
      };
    }
  );
}
```

2. **Hook the category into the global registry**

```typescript
// src/tools/index.ts
import { registerMyCategoryTools } from "./myCategory/index.js";

export function registerAllTools(server: McpServer) {
  // …existing categories
  registerMyCategoryTools(server);
}
```

### Testing Your Tools 🧪

1. Build the project:

```bash
npm run build
```

2. Test the MCP server directly:

```bash
node build/src/index.js
```

3. For testing with an AI assistant, temporarily modify your platform's config to point to the local build:

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

## Tool Documentation Links 🔗

- **Alchemy SDK**: [Alchemy SDK Quickstart](https://www.alchemy.com/docs/reference/alchemy-sdk-quickstart)
- **Arbitrum Stylus**: [Stylus CLI Usage](https://docs.arbitrum.io/stylus/using-cli#using-cargo-stylus)

## Contributing 🙌

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📜

This project is licensed under the MIT License - see the LICENSE file for details.
