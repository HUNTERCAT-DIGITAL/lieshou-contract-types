# Changelog · lieshou-contract-types

> **破坏性变更声明**：本仓是 20 个仓共用的 **L0 契约层**（5 端 app + 10 个 delivery superproject +
> ui / ui-native / cloud / standalone / ark-contract-types），`business/*` 的导出符号是它们的公共 API。
> **删除或改名任何导出符号 = 破坏性变更**，必须在此记录并在消费方 bump 前对照评估。
> 格式：`## <版本>（YYYY-MM-DD）` → `### 破坏性变更` / `### 新增` / `### 修复`。
> CI 强制：tag `vX.Y.Z` 必须等于 `package.json` 版本，且本文件必须有对应 `## X.Y.Z` 小节，否则拒发。

## 0.2.0（2026-09-14）

### 新增
- **制品分发到内网 Nexus**（`https://nexus.ts.huntercat.cn/repository/npm-hosted/`）：新增
  `.gitlab-ci.yml`，`verify` 门禁（typecheck + lint + `check-contract --strict`）+ `publish`（**仅 `v*` tag 触发**）。
  消费方从此可**按版本依赖**（`"@lieshoucloud/contract-types": "^0.2.0"`），不再只能靠 submodule pin。
  ⚠️ 这是本仓**首个发布版本**：`v0.1.0` 从未分发（当时无发布链路），保留 tag 作历史标记。
- `package.json` 增 `files: ["src"]`（此前无该字段，submodule 目录会被卷进 tarball）、
  `publishConfig.registry` 指向 npm-hosted；移除 `private: true`（否则 npm/pnpm 拒绝发布）。
- 补 `src/business/org.ts` 到 `index.ts` 导出面（此前整模块未挂载）；`legal.ts` 73 个漏导出符号
  补进白名单（`DocumentTemplate` / `LegalArchive` / `AnalyticsDashboard` / `TimeEntryReport` /
  `KnowledgeFlow` / `AiSession` / `AiSuggestion` / `LegalReview` / `LegalArticle` / `ConsultTicket` /
  `AiMessage` / `Conversation*` / `ActivityEvent` / `TimeEntryDraftPayload` 等 + 14 个 `*_META` 常量）。
- `finance.ts` 由 `export *` 改为显式白名单导出（`LedgerType` / `LedgerEntry` / `LEDGER_TYPE_META`
  与 `legal.ts` 同名，`export *` 会静默跳过）——**有效导出集与原行为完全一致**。

### 修复
- `main` 长期红（`check-contract --strict` 4 个 error）—— 原因是没有 CI 在跑
  （`.github/workflows/ci.yml` 在内网 GitLab 上不触发），导出面漂移无人发现。

### 说明
- 无破坏性变更：以上全部为**加导出**和**等价改写**，消费方无需改代码。

## 0.1.0（2026-09-12）

- tag 标记：Edition 类型跨端统一、`EditionLogin.registerPath`、`EditionConfig.layout` 壳覆盖等已合入。
  **未分发到任何私服**（无发布链路）。
