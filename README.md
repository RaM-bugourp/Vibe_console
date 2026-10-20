# Vibe Console

一个面向 OpenAI Codex Desktop / Codex CLI 的跨平台桌面操作台。本仓库基于 [mtecoYY/codex-x-pro](https://github.com/mtecoYY/codex-x-pro) 的操作台实现，聚焦把 Codex 的 Provider、Prompt、会话、Skills / MCP 和本地网关状态集中到一个可视化界面中。

> 本仓库只发布操作台本体。个人 Skills、Prompt 素材、MCP 配置、hooks、网关脚本、导入数据和本地运行状态均不包含在仓库中。

## 功能概览

- **Provider / API 管理**：添加、编辑、启用和删除供应商；维护 Base URL、Model、Wire API、API Key 与 TOML 配置。
- **Prompt 管理**：浏览分类、导入 Markdown、编辑自定义 Prompt，并切换追加或替换注入模式。
- **会话管理**：搜索、分组、检查和同步本地 Codex 会话路由。
- **Skills / MCP 管理**：查看、导入、启用或禁用 Codex Skill 与 MCP Server；保留用户数据，不内置个人扩展内容。
- **本地网关控制**：管理 direct / gateway 模式、监听状态、Provider 同步和运行状态恢复。网关实现与个人脚本不随本仓库发布。
- **实时请求观测**：在网关可用时查看脱敏后的请求、响应和运行状态。
- **对话工作台**：提供 Chat & Editor 页面；网关可用时通过本地控制 API 发送真实请求，否则保持离线界面行为。
- **跨平台桌面应用**：基于 Tauri 2、React、TypeScript、Rust、SQLite 和 Vite。

## 与原项目的关系

- 原项目：[mtecoYY/codex-x-pro](https://github.com/mtecoYY/codex-x-pro)
- 本项目：[RaM-bugourp/Vibe_console](https://github.com/RaM-bugourp/Vibe_console)

本项目保留原项目的桌面操作台架构和基础能力，并在此基础上整理了新的操作台界面、Chat & Editor 页面、Skills / MCP 管理体验、导入审计数据结构和网关状态展示。原项目的许可证和版权声明仍然适用；新增代码同样按仓库许可证发布。

## 开发环境

- Node.js 18+
- pnpm
- Rust stable 与 Cargo
- Tauri 2 所需系统依赖
- Python 3（仅在本地网关或开发辅助场景需要；个人网关脚本不属于本仓库）

```bash
pnpm install
pnpm --filter codex-x-pro dev
```

桌面应用源码位于 `apps/desktop`。具体构建命令以 `apps/desktop/package.json` 为准。

## 配置边界与安全说明

操作台会根据当前 Codex 环境管理配置和本地数据库。开发或二次开发时，建议使用独立的 `CODEX_HOME`、`CODEXX_HOME` 和 `CC_SWITCH_HOME`，不要把个人凭据、API Key、MCP command、Skills 或网关脚本写入仓库。

本仓库不会提供以下内容：

- 用户个人 Skills、`SKILL.md` 素材和 Prompt 素材；
- 个人 DBrepo、导入后的 `data/` 文件和审计结果；
- MCP Server 配置、hooks、个人脚本和可执行扩展；
- `CODEX_X_GATEWAY_SCRIPT` / `CODEX_X_GATEWAY_WATCHDOG` 指向的外部网关实现；
- `.env`、认证文件、API Key、证书和其他本地秘密。

如果需要本地网关，请在自己的机器上安装并配置外部实现，然后通过环境变量提供路径；不要把它复制进本仓库或提交到 Git。

## 目录说明

```text
apps/desktop/      Tauri 桌面应用本体
config/            示例配置
core docs/         操作台设计与开发文档
```

个人资源、运行数据、构建产物和依赖目录均由 `.gitignore` 排除。

## 许可证

本项目使用 MIT License，详见 [LICENSE](LICENSE)。本项目基于上游项目进行开发，请同时参考上游仓库的许可证和版权信息。
