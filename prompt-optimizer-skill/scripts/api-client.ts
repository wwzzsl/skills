#!/usr/bin/env npx tsx
/**
 * 提示词优化平台 HTTP 客户端
 *
 * 用法：
 *   npx tsx api-client.ts optimize   '{"input":"...","type":"OPTIMIZE","stream":false}'
 *   npx tsx api-client.ts iterate    '{"sessionId":"...","feedback":"语气更专业"}'
 *
 * apiKey 读取顺序：
 *   1. .env 文件中的 PROMPT_OPTIMIZER_API_KEY
 *   2. 系统环境变量 PROMPT_OPTIMIZER_API_KEY
 *   3. 均无 → 不传 apiKey（匿名请求）
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ─── 常量 ──────────────────────────────────────────────────────────────────
const BASE_URL = "https://xiaomiyoga.com/mojian";

const ENDPOINTS: Record<string, string> = {
  optimize: "/api/prompt-optimizer/optimize",
  iterate: "/api/prompt-optimizer/iterate",
};

// ─── 读取 apiKey ────────────────────────────────────────────────────────────
function loadApiKey(): string | undefined {
  // 1. 从 .env 文件读取
  const envPath = resolve(process.cwd(), ".env");
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const match = line.match(/^PROMPT_OPTIMIZER_API_KEY\s*=\s*(.+)$/);
      if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  // 2. 从环境变量读取
  return process.env.PROMPT_OPTIMIZER_API_KEY;
}

// ─── 主逻辑 ─────────────────────────────────────────────────────────────────
async function main() {
  const [, , action, bodyArg] = process.argv;

  if (!action || !ENDPOINTS[action]) {
    console.error(`❌ 用法: npx tsx api-client.ts <action> [JSON参数]`);
    console.error(`   可用 action: ${Object.keys(ENDPOINTS).join(", ")}`);
    process.exit(1);
  }

  let body: Record<string, unknown> = {};
  if (bodyArg) {
    try {
      body = JSON.parse(bodyArg);
    } catch {
      console.error("❌ JSON 参数解析失败，请检查格式");
      process.exit(1);
    }
  }

  const apiKey = loadApiKey();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["apiKey"] = apiKey;
  }

  const url = `${BASE_URL}${ENDPOINTS[action]}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error(`❌ 网络请求失败: ${(err as Error).message}`);
    process.exit(1);
  }

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    console.error(`❌ 响应解析失败（HTTP ${res.status}）:\n${text}`);
    process.exit(1);
  }

  if (!res.ok || json.code !== 200) {
    const msg = json.message || json.msg || res.statusText;
    console.error(`❌ 接口错误（HTTP ${res.status}）: ${msg}`);
    console.error(JSON.stringify(json, null, 2));
    process.exit(1);
  }

  // 成功：输出 data 字段
  console.log(JSON.stringify(json.data, null, 2));
}

main().catch((err) => {
  console.error("❌ 未预期错误:", err);
  process.exit(1);
});
