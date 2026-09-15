# Changelog · lieshou-contract-types

> **破坏性变更声明**：本仓是 20 个仓共用的 **L0 契约层**（5 端 app + 10 个 delivery superproject +
> ui / ui-native / cloud / standalone / ark-contract-types），`business/*` 的导出符号是它们的公共 API。
> **删除或改名任何导出符号 = 破坏性变更**，必须在此记录并在消费方 bump 前对照评估。
> 格式：`## <版本>（YYYY-MM-DD）` → `### 破坏性变更` / `### 新增` / `### 修复`。
> CI 强制：tag `vX.Y.Z` 必须等于 `package.json` 版本，且本文件必须有对应 `## X.Y.Z` 小节，否则拒发。

## 0.3.2（2026-09-15）

### 新增
- `EditionConfig.theme?: Record<string, string>` —— 品牌主题：端内 CSS 自定义属性覆盖。
  运行时注入 `document.body.style`，用于覆盖端内默认品牌变量（`--c-accent` / `--c-deep-a` 等）。
  端间变量集不同，故用开放字典而非固定 schema：新增一个端内变量不需要改契约。
  补 0.3.0/0.3.1 漏掉的最后一块：端内默认品牌变量此前直接写死客户主色，无法用已有字段表达。

### 说明
- 导出面只增字段（无新 interface），`check-contract --strict` 通过，消费方无需适配。

## 0.3.1（2026-09-15）

### 新增
- `EditionConfig.profileRows?: EditionProfileRow[]` —— 个人中心自定义行（客户功能入口挂到「我的」页）。
  上游只渲染与跳转，行文案/路径/图标由版别声明；未声明不渲染。补 0.3.0 漏掉的一处：
  端内「我的」页原有的客户功能行（如成长档案）无法用 0.3.0 的字段表达。

### 说明
- 导出面只增不减（新增 `EditionProfileRow` interface），`check-contract --strict` 通过，消费方无需适配。

## 0.3.0（2026-09-15）

### 新增
- `EditionConfig` 增 4 个**版别声明字段**（全部可选 · 无破坏性变更，不声明则行为与 0.2.x 一致）：
  - `workspace?: EditionWorkspace` —— 顶栏工作空间切换器。上游只提供机制（下拉 + 切换事件 + 可选持久化），
    选项文案、持久化键、广播事件名由版别声明；未声明则不渲染。
  - `primaryEntry?: EditionPrimaryEntry` —— 底栏中部主入口（客户助手/中枢入口）。声明后在 tab 为偶数且 ≥4 时
    插在正中，底栏隐藏时降级为右下浮球；点击广播版别声明的事件名。
  - `productLine?: string` / `productLineDesc?: string` —— 产品线名与副标（关于页标题 / 设置页脚），
    缺省回退 `brandName` / `slogan ?? companyName`。

  动机：客户端行业语义此前以「版别 id 字面量集合」形式写在端内（如 mobile-web 的 `clientFlavor.ts`），
  上游因此认识具体客户。统一改为版别声明的同一模式（对齐 `notifications.source`）。

### 修复
- `business/edition.ts` 注释移除客户品牌名与客户主色值（上游仓洁净纪律：客户内容不入上游）。

### 说明
- 导出面**只增不减**（新增 `EditionWorkspace` / `EditionPrimaryEntry` 两个 interface），
  `check-contract --strict` 通过；消费方无需适配即可升级。

## 0.2.1（2026-09-14）

### 说明
- **`src/` 与 0.2.0 完全相同**（无新增/修改/删除导出符号，消费方无需适配）。
  本版存在的唯一目的：把 publish 链路从「本仓临时 job」切换到 **ai-kit 单源模板**
  （`include: huntercat-digital/huntercat-ai-kit → /ci/npm-nexus.yml` + `ci/prepublish.sh`）后
  **实跑一次验明可用**（对齐 ai-kit 模板文档的“冒烟验证”要求）。
- 发布门禁未变：tag `v0.2.1` == `package.json` 版本；`CHANGELOG.md` 有本小节（`ci/prepublish.sh` 强制）；
  发布后从 `npm-group` 回读。

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
