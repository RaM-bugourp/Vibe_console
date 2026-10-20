# Vibe Console

Vibe Console is a cross-platform desktop control panel for OpenAI Codex Desktop and Codex CLI. It is based on the desktop control-panel implementation from [mtecoYY/codex-x-pro](https://github.com/mtecoYY/codex-x-pro), with a focused fork for managing providers, prompts, sessions, Skills / MCP, local gateway state, and an integrated chat editor.

> This repository publishes the control-panel application only. Personal Skills, prompt collections, MCP configuration, hooks, gateway scripts, import data, credentials, and local runtime state are intentionally excluded.

## Features

- **Provider / API management**: create, edit, enable, remove, test, and route providers.
- **Prompt management**: browse categories, import Markdown, edit custom prompts, and switch append/replace injection modes.
- **Session management**: search, group, inspect, and synchronize local Codex sessions.
- **Skills / MCP management**: inspect and manage Codex Skills and MCP servers without shipping personal extensions.
- **Local gateway control**: manage direct/gateway state, provider synchronization, health, and recovery. The external personal gateway implementation is not included.
- **Request observation**: inspect redacted request and response state when a local gateway is available.
- **Chat & Editor**: use the integrated conversation and code-editing workspace; real requests are sent through the local gateway when configured.
- **Cross-platform desktop stack**: Tauri 2, React, TypeScript, Rust, SQLite, and Vite.

## Relationship to the upstream project

- Upstream: [mtecoYY/codex-x-pro](https://github.com/mtecoYY/codex-x-pro)
- This fork: [RaM-bugourp/Vibe_console](https://github.com/RaM-bugourp/Vibe_console)

The fork keeps the upstream desktop control-panel architecture and core capabilities while organizing the Vibe Console UI, Chat & Editor page, Skills / MCP experience, import-audit data model, and gateway state presentation. The upstream license and copyright notices remain applicable; new code is distributed under the repository license as well.

## Development

Requirements:

- Node.js 18+
- pnpm
- Rust stable and Cargo
- Tauri 2 system dependencies
- Python 3 only when a locally installed gateway or development helper requires it

```bash
pnpm install
pnpm --filter codex-x-pro dev
```

The desktop application lives in `apps/desktop`. Use the scripts in `apps/desktop/package.json` for type checking, tests, and builds.

## Configuration and security boundaries

For development, use isolated `CODEX_HOME`, `CODEXX_HOME`, and `CC_SWITCH_HOME` directories. Never commit API keys, credentials, MCP commands, Skills, hooks, gateway scripts, or local databases.

This repository deliberately does not contain:

- Personal Skills, `SKILL.md` files, or private prompt collections;
- DBrepo content, imported `data/` files, or audit output;
- MCP server definitions, hooks, personal scripts, or executable extensions;
- The external implementation referenced by `CODEX_X_GATEWAY_SCRIPT` or `CODEX_X_GATEWAY_WATCHDOG`;
- `.env` files, authentication files, API keys, certificates, or other secrets.

If you use a local gateway, install it separately and provide its path through environment variables. Do not copy it into this repository.

## License

MIT License. See [LICENSE](LICENSE). Because this project is based on the upstream repository, also review the upstream license and copyright information.
