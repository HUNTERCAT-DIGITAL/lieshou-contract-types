#!/usr/bin/env node
/**
 * check-contract.mjs — 契约层导出面一致性检查。
 *
 * 背景：index.ts 对 `./business/*` 分两种导出策略——
 *   - 无跨模块同名符号的模块：`export * from "./business/<mod>"`
 *   - 含同名符号（如 STATUS_META / LetterStatus）的模块：显式白名单导出，
 *     冲突符号不导出（走深路径 @lieshoucloud/contract-types/business/<mod>）。
 *     因为 `export *` 遇同名符号会**静默跳过**，靠人工维护极易漏导/误导。
 *
 * 本脚本把上述约定固化为机器检查：
 *   1. 扫描每个 business 模块的顶层导出符号
 *   2. 检测跨模块同名符号（冲突集）
 *   3. 校验 index.ts 导出面与约定一致
 *
 * 用法：
 *   node scripts/check-contract.mjs           # 默认检查
 *   node scripts/check-contract.mjs --strict  # 默认 + 全量可见性检查
 *
 * 退出码：任何 error 级问题 → 1（CI 阻断）；仅 warning → 0。
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const strict = process.argv.includes("--strict");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const businessDir = join(root, "src", "business");
const indexFile = join(root, "src", "index.ts");

/** 匹配单行式顶层导出（本仓代码风格：`export type/interface/const/function/... X`） */
const TOP_EXPORT_RE =
  /^\s*export\s+(?:abstract\s+class|class|const|enum|function|interface|type)\s+([A-Za-z_$][\w$]*)/gm;

function topLevelExports(file) {
  const src = readFileSync(file, "utf8");
  return [...src.matchAll(TOP_EXPORT_RE)].map((m) => m[1]);
}

// ---------- 解析 index.ts 导出面 ----------
const indexSrc = readFileSync(indexFile, "utf8");

/** moduleName -> true（`export *` 全量导出） */
const starModules = new Set(
  [...indexSrc.matchAll(/export\s*\*\s*from\s*["']\.\/business\/([\w-]+)["']/g)].map((m) => m[1]),
);

/** moduleName -> Set<symbol>（显式白名单导出：`export type { }` + 普通 `export { }`） */
const explicitModules = new Map();
for (const m of indexSrc.matchAll(/export\s+type\s*\{([^}]*)\}\s*from\s*["']\.\/business\/([\w-]+)["']/gs)) {
  explicitModules.set(m[2], new Set([...m[1].matchAll(/[A-Za-z_$][\w$]*/g)].map((x) => x[0])));
}
// 普通 `export { value } from`（函数/常量等 value 导出，与类型白名单合并）
for (const m of indexSrc.matchAll(/export\s*\{([^}]*)\}\s*from\s*["']\.\/business\/([\w-]+)["']/gs)) {
  const prev = explicitModules.get(m[2]) ?? new Set();
  for (const s of m[1].matchAll(/[A-Za-z_$][\w$]*/g)) prev.add(s[0]);
  explicitModules.set(m[2], prev);
}

// ---------- 扫描 business 模块 ----------
const modules = readdirSync(businessDir)
  .filter((f) => f.endsWith(".ts"))
  .sort()
  .map((file) => ({ file, symbols: topLevelExports(join(businessDir, file)) }));

// ---------- 跨模块同名冲突检测 ----------
const ownerCount = new Map();
for (const { symbols } of modules) {
  for (const s of new Set(symbols)) ownerCount.set(s, (ownerCount.get(s) ?? 0) + 1);
}
const conflicts = new Set([...ownerCount.entries()].filter(([, n]) => n > 1).map(([s]) => s));

const errors = [];
const warnings = [];

for (const { file, symbols } of modules) {
  const base = file.replace(/\.ts$/, "");
  const hasConflicts = symbols.some((s) => conflicts.has(s));
  const isStar = starModules.has(base);
  const explicit = explicitModules.get(base) ?? new Set();

  if (hasConflicts) {
    // 冲突模块必须显式导出（`export *` 会静默跳过冲突符号，等于漏导出）
    if (isStar) {
      errors.push(`${file}: 含跨模块同名符号（${symbols.filter((s) => conflicts.has(s)).join(", ")}），` +
        `不得使用 \`export *\`（会静默跳过冲突符号）；请改为显式白名单导出。`);
    }
    // 冲突符号不得出现在显式导出中（重复/二义）
    for (const s of symbols) {
      if (conflicts.has(s) && explicit.has(s)) {
        errors.push(`${file}: 冲突符号 ${s} 被显式导出——与其它模块同名，消费端会歧义；` +
          `请移除并走深路径 @lieshoucloud/contract-types/business/${base}。`);
      }
    }
  } else if (!isStar && explicit.size > 0) {
    // 无冲突模块应走 `export *`（保持风格统一，非硬性 → warning）
    warnings.push(`${file}: 无跨模块同名符号，建议改回 \`export * from "./business/${base}"\` 统一风格。`);
  }

  // 显式导出符号必须真实存在于源模块（防拼写错误 / 改名不同步）
  const symbolSet = new Set(symbols);
  for (const s of explicit) {
    if (!symbolSet.has(s)) {
      errors.push(`${file}: index.ts 显式导出 ${s}，但该符号不存在于源模块（拼写错误或已改名？）。`);
    }
  }

  // strict：模块被 index.ts 引用 + 全部非冲突符号可见（防漏导出 / 新增模块忘挂）
  if (strict) {
    if (!isStar && explicit.size === 0 && !hasConflicts) {
      errors.push(`${file}: 模块未被 index.ts 导出（新增模块请挂到 index.ts）。`);
    }
    const missing = symbols.filter((s) => !conflicts.has(s) && !isStar && !explicit.has(s));
    if (missing.length > 0) {
      errors.push(`${file}: 非冲突符号未在 index.ts 可见（漏导出？）：${missing.join(", ")}。`);
    }
  }
}

// ---------- 汇总 ----------
const out = [];
out.push(`check-contract${strict ? " (strict)" : ""}: ${modules.length} modules, ${conflicts.size} 个跨模块冲突符号`);
if (conflicts.size > 0) {
  out.push(`  冲突符号: ${[...conflicts].sort().join(", ")}`);
}
for (const w of warnings) out.push(`  ⚠ ${w}`);
for (const e of errors) out.push(`  ✗ ${e}`);

console.log(out.join("\n"));

if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} 个问题（${strict ? "strict" : "默认"}检查）——契约导出面不一致，请修复。`);
  process.exit(1);
}
if (warnings.length > 0) {
  console.log(`\n✓ ${warnings.length} 条建议（不阻断）。`);
} else {
  console.log("\n✓ 契约导出面与约定一致。");
}
