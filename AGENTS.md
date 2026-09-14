# 项目记忆

> 由 pi 的 project-memory 扩展自动创建,后续与人类维护者共同维护。
> 记录关键事实、决策与约定;避免流水账。

## 项目身份
- 名称: lieshou-contract-types（前端共享 · L0 契约层 / Bottom-Up）
- 类型: pnpm 单包（`@lieshoucloud/contract-types`，`private: true`，无构建产物 —— `main`/`types` 直指 `src/index.ts`）
- 仓库: gitlab.ts.huntercat.cn/huntercat-digital/lieshou-contract-types（默认 main；tag `v0.1.0` @2026-09-12）
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

## 当前阶段
- 现役平台仓（时代二），最后提交 2026-09-12；`v0.1.0` 已打 tag
- ⚠️ **`main` 当前是红的**：`pnpm test`（`check-contract --strict`）4 个 error
  - `finance.ts` 用 `export *`，但其 `LedgerType` / `LedgerEntry` / `LEDGER_TYPE_META` 与 `legal.ts` 同名（默认检查即红）
  - `legal.ts` 有 **73** 个非冲突符号未在 index.ts 可见（漏导出）
  - `org.ts` 整个模块未挂到 index.ts
- CI 只定义在 `.github/workflows/ci.yml`（GitHub Actions：typecheck+build+lint+test+check:contract），仓已迁自建 GitLab 且**无 `.gitlab-ci.yml`** → 大概率未在跑，这是 main 长期红的原因（待确认）

## 待办
- [ ] 修 `main` 的红：`finance.ts` 改显式导出、`legal.ts` 补漏导出、`org.ts` 挂 index.ts
- [ ] `gen:api:admin` 产出 `src/generated.admin.ts`，该文件**不存在**（悬空脚本：要么删要么补产物）
- [ ] `gen:api*` 硬编码 `localhost:9000` / `8084-8088`，换机即废；应走 env 或配置
- [ ] 提交信息引用的 `docs/legalmind-ai-engine-arch.md` 不在仓内（外置文档，易失效）
- [ ] 鸿蒙 `ark-contract-types` 分叉双轨 —— 归一还是承认，未决
- [ ] CI 迁 GitLab（或明确 GitHub Actions 是否还在跑）

## 关键决策
- 2026-08-26: 自 `LieShouCloud-web/types` 拆出独立契约仓（初名 `@lieshoucloud/types`，后定名 `contract-types`），挂 `open/config`
- 2026-08-29: tag `upstream-unify-2026-08` / `edition-unify-2026-08` —— Edition 类型跨 5 端统一为唯一事实源，端内删除副本
- 2026-09: `.gitmodules` 内网/GitHub URL → 自建 GitLab（`d10ffb2` / `19f7ad8`）
- 2026-09-12: `v0.1.0`
