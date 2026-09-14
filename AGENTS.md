# 项目记忆

> 由 pi 的 project-memory 扩展自动创建,后续与人类维护者共同维护。
> 记录关键事实、决策与约定;避免流水账。

## 项目身份
- 名称: lieshou-contract-types（前端共享 · L0 契约层 / Bottom-Up）
- 类型: pnpm 单包（`@lieshoucloud/contract-types`，`private: true`，无构建产物 —— `main`/`types` 直指 `src/index.ts`）
- 仓库: gitlab.ts.huntercat.cn/huntercat-digital/lieshou-contract-types（默认 main，**受保护**：push_access_level=0，一律走分支 + MR；protected tag `v*`）
- 技术栈: TypeScript 5.6 strict · eslint 9 · 运行时依赖仅 `dayjs`；`@types/react` 只用于类型（`business/edition.ts` 的 `ComponentType`/`ReactNode`）
- 上游: **无独立上游仓 —— 本仓即上游。** 2026-08-26 自时代一 GitHub `LieShouCloud-web/types` 拆出（首提交 `feat: 前端 types 层仓初始化——自 LieShouCloud-web/types 拆分`）。自身嵌套 submodule `open/config` → `lieshou-contract-config`

## 架构速览
三块，全在 `src/`（约 10.4k 行）：
- `src/index.ts` — 唯一门面：通用工具类型（`ApiResponse` / `StatusMeta` / `HealthStatus` / `IndustryId` / `getStatusMeta`）+ 转出 `business/*`
- `src/business/*.ts` — 手写业务 DTO 收敛层（**23 模块**，以 admin-web 为事实源；大头是 `legal.ts` 1681 行 / `iot.ts` 412 / `customerSuccess.ts` 239 / `supply.ts` 204）
- `src/generated*.ts` — OpenAPI 快照：`generated.ts` 底座 user-service；`generated.{crm,finance,inventory,iot,approval}.ts` L3 商业服务（`pnpm gen:api:l3`）。**仅作契约参考，勿手改**
- `scripts/check-contract.mjs` — 导出面一致性机器检查，即 `pnpm test`

下游消费（宽）：REPOS.md @2026-09-13 记 20 个引用方 —— 5 端 app 经 `open/contract-types`（`workspace:*`）+ 10 个 `lieshou-delivery-*` superproject + `lieshou-ui` / `lieshou-ui-native` / `lieshou-cloud` / `lieshou-standalone`；`lieshou-ui` 还经 `open/types` 再嵌一层。
鸿蒙分叉：`lieshou-ark-contract-types` 复制了一份本仓（REPOS.md 风险 #3）。

## 关键约定
- **导出面由 `check-contract.mjs` 固化**：
  - 无跨模块同名符号的模块 → `export * from "./business/<mod>"`
  - 含冲突符号的模块 → **必须**显式白名单导出，冲突符号不导出；消费端走深路径 `@lieshoucloud/contract-types/business/<mod>`
  - 理由：`export *` 遇同名符号是**静默跳过**，靠人工维护必然漏导/误导
  - 现役冲突符号（7）：`STATUS_META`（customer/dispatch/teacher/user 四处）、`LedgerType` / `LedgerEntry` / `LEDGER_TYPE_META`（finance ↔ legal）、`LetterStatus` / `LETTER_STATUS_META` / `ContactLetter`（customerSuccess ↔ legal）
  - `legal.ts` 参与了全部冲突 —— 它是显式白名单导出的样板
- `generated*.ts` 由 `pnpm gen:api*` 从后端 OpenAPI 生成，不手改；业务代码走 `business` 层
- 契约演进 additive 优先（加可选字段）；改名/删除要考虑 20 个消费仓的 pin
- 本仓是共享仓：**改本仓 → 先提本仓，再在消费方 bump submodule pin，分两个 PR**
- 无构建步骤（`build` = `tsc --noEmit`），无测试框架 —— 唯一测试就是 `check-contract.mjs`
- **发版流程**：改代码 → MR（`verify` 必须绿）→ 合入 main → `package.json` bump + CHANGELOG 补小节 → 打 tag `vX.Y.Z` → 自动 publish 到 Nexus。`v0.1.0` 之前无发布链路，`v0.2.0` 是首个可解析版本

## 协作纪律（硬性 · 2026-09-14 起）
- **本仓只由唯一主对话管理**：任何写入动作（commit / push / tag / MR / 改 CI 变量 / Nexus 发布）只在主对话内执行
- 其他 pi 会话、子代理、并行任务对本仓 **只读**；发现需要改动 → 上报主对话，不自己动手
- 由来：2026-09-14 两个会话同时给本仓建发布链路（一个把 publish 写进本仓 CI，一个改成 include ai-kit 单源模板），
  后者合并时覆盖前者 —— 保护分支下靠 MR 才发现（同 `lieshou-charts` 已记录的同一事故）

## 当前阶段
- 现役平台仓（时代二）；tag `v0.2.0` @2026-09-14 = **首个分发到内网 Nexus 的版本**
- `main` 已绿：`pnpm typecheck` / `pnpm lint` / `pnpm test`（`check-contract --strict`）在 CI 上全绿（pipeline 729/717/711 实测）
- CI = `.gitlab-ci.yml`（GitLab CI）：本仓只留 `verify`（install + typecheck + lint + check-contract）；
  **publish job 由 ai-kit 单源模板提供**（`include: huntercat-digital/huntercat-ai-kit → /ci/npm-nexus.yml`，禁止在本仓复制一份），
  仓特异发布前门禁放 `ci/prepublish.sh`（模板第一步调用）。runner = `wqc-server-dell` docker（tags `wqc`）
- 发布实证：`@lieshoucloud/contract-types@0.2.0`（本仓临时 job）与 **`0.2.1`（ai-kit 单源模板：pipeline 754 / job 2437）**
  均可从 `npm-group` 解析；`dist-tags.latest = 0.2.1`；消费方冒烟 `npm install @lieshoucloud/contract-types@0.2.1` → exit 0（30 个 `.ts` 落地）

## 待办
- [ ] tarball 的 `devDependencies.@lieshoucloud/contract-config` 原样带 `workspace:*`
      （模板用 `npm publish`，不重写 `workspace:` 协议；`pnpm publish` 会重写）。
      消费方不受影响（依赖的 devDeps 永不被安装），但元数据不干净；要改就改 ai-kit 模板或走 `ci/prepublish.sh` 钩子
- [ ] `include: ref: main` —— 发布逻辑钉在移动分支上；ai-kit 已有发布点 tag `release-2026-09`，但全组多个仓均写 `main`，要钉发布点是**全组统一动作**
- [ ] `gen:api:admin` 产出 `src/generated.admin.ts`，该文件**不存在**（悬空脚本：要么删要么补产物）
- [ ] `gen:api*` 硬编码 `localhost:9000` / `8084-8088`，换机即废；应走 env 或配置
- [ ] 提交信息引用的 `docs/legalmind-ai-engine-arch.md` 不在仓内（外置文档，易失效）
- [ ] 鸿蒙 `ark-contract-types` 分叉双轨 —— 归一还是承认，未决
- [ ] 20 个消费仓**未切换**到 Nexus 依赖（现仍走 submodule pin + `workspace:*`）；要切就是另一个计划
- [ ] `@lieshoucloud/contract-config` / `contract-api` 仍未发布到 Nexus → `lieshou-core-web` 的 release 门禁仍会被它们卡住

## 关键决策
- 2026-08-26: 自 `LieShouCloud-web/types` 拆出独立契约仓（初名 `@lieshoucloud/types`，后定名 `contract-types`），挂 `open/config`
- 2026-08-29: tag `upstream-unify-2026-08` / `edition-unify-2026-08` —— Edition 类型跨 5 端统一为唯一事实源，端内删除副本
- 2026-09: `.gitmodules` 内网/GitHub URL → 自建 GitLab（`d10ffb2` / `19f7ad8`）
- 2026-09-14: **版本管理四道门**（首发前确立）—— tag 必须 = `v<package.json version>`；`CHANGELOG.md` 必须有该版本小节；CI 变量 `NEXUS_DEPLOY_*` 在位；发布后从 `npm-group` 回读校验。**删/改 `business/*` 导出符号 = 破坏性变更**，必须记 `### 破坏性变更`
- 2026-09-14: **首发 0.2.0**（跳过 0.1.0：该 tag 从未分发，保留作历史标记，同 framework『0.3.0 从未分发』先例）；`package.json` 增 `files: ["src"]`（否则 submodule 目录会被卷进 tarball）、移除 `private`（否则拒发）
- 2026-09-14: **0.2.1 = 冒烟发布**（`src/` 与 0.2.0 完全相同）—— 目的就是验明切换后的 ai-kit 模板 publish 路径可用，
  不把一条从未执行过的发布链路当作已完成
- 2026-09-14: CI 由 GitHub Actions 平移到 GitLab CI，删除 `.github/workflows/ci.yml`（不触发的死文件，对齐 i18n/charts 先例）
- 2026-09-14: 本仓加入 `lieshou-contract-config` 的 **CI_JOB_TOKEN 入站白名单**（跨仓 submodule 克隆必需，ui/core-web 早已在列）
- 2026-09-14: **publish 改走 ai-kit 单源模板**（`/ci/npm-nexus.yml`，全组 7 仓统一），本仓不再复制一份；
  CHANGELOG 门禁随之下沉到 `ci/prepublish.sh`（模板的仓特异钩子）。四道门未减：tag↔version 与凭证/回读在模板，CHANGELOG 在钩子
