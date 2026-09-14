#!/usr/bin/env bash
# 发布前门禁（由 ai-kit 的 ci/npm-nexus.yml 在发布第一步调用）
# L0 契约是 20 个消费仓的公共 API ⇒ 发版必须先写清变更（破坏性变更另记 ### 破坏性变更）
set -euo pipefail

ver=$(node -p "require('./package.json').version")
grep -q "^## $ver" CHANGELOG.md || {
  echo "❌ CHANGELOG.md 缺少 \`## $ver\` 小节，先补变更说明再发版" >&2
  exit 1
}
echo "  CHANGELOG.md 已有 ## $ver"
