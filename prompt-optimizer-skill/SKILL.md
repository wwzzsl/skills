---
name: prompt-optimizer
version: "1.0.0"
homepage: https://xiaomiyoga.com/mojian

# 必需的环境变量（运行前必须配置）
env:
  optional:
    - name: PROMPT_OPTIMIZER_API_KEY
      description: "提示词优化 API 密钥，在请求 Header 中以 apiKey 传入，从 https://aipmedia.cn/ 个人中心获取"
      secret: true

# 运行时依赖
runtime:
  requires:
    - node  # Node.js >= 18（内置 fetch API）
    - npx   # 用于执行 tsx
  scripts:
    - path: scripts/api-client.ts
      runner: "npx tsx"
      description: "提示词优化接口 HTTP 客户端，访问 api.aipmedia.cn"

# 网络访问声明
network:
  allowed_hosts:
    - xiaomiyoga.com

description: >
  AI提示词优化与迭代助手。当用户需要优化、改写、结构化或迭代提示词（Prompt）时，使用此技能。
  触发词包括但不限于：优化提示词、提示词优化、prompt优化、改进prompt、结构化prompt、迭代提示词、
  让提示词更专业、帮我优化这段提示、prompt engineer、提示词工程。
  即使用户没有明确说"调用API"，只要问题涉及提示词的改进、重写、规范化，都应使用此 Skill。
  平台内置多种优化策略，由服务端自动选择，无需客户端指定。内置能力涵盖：**通用结构化优化**（重组角色/技能/规则）、**分析式深度优化**（输出完整 Role/Goals/Constrains 框架）、**输出格式规范化**（增加 OutputFormat 控制块）、**用户提示词精简优化**（消除模糊表达）、**专业化改写**（泛泛描述转为精准具体）、**步骤化规划**（复杂需求拆解为执行步骤）
  【重要】所有接口调用必须使用 `npx tsx ~/.claude/skills/prompt-optimizer-skill/scripts/api-client.ts`，严禁直接使用 curl。
---

# 提示词优化 Skill

## 🚫 调用方式硬性规定

> **严禁使用 `curl` 调用接口。唯一允许的调用方式是：**
>
> - ✅ `npx tsx ~/.claude/skills/prompt-optimizer-skill/scripts/api-client.ts optimize '{...}'` — 正确
> 
> api-client.ts 会自动从 `.env` 文件或环境变量读取 `PROMPT_OPTIMIZER_API_KEY`，无需在命令行传入。

---

## 概述

此 Skill 通过调用提示词优化平台接口，帮助用户一键优化、迭代 AI 提示词，并以清晰格式展示优化结果。

**API Base URL**: `https://api.aipmedia.cn`  
**认证方式**: 请求 Header 中传入 `apiKey`

---

## ⚠️ 核心约束（必须遵守）

**所有提示词优化操作必须通过下方 API 接口执行，禁止仅凭模型自身直接输出"优化结果"后声称已调用接口。**

- ✅ 正确：用 `bash_tool` 执行 TypeScript 脚本调用接口
- ❌ 错误：跳过脚本直接输出一段优化后的文本，假装调用了 API

如果接口调用失败，明确告知用户失败原因，不要用模型自身的改写结果替代。

### apiKey 配置规则

若平台需要鉴权，优先级如下：
1. 项目根目录 `.env` 文件中的 `PROMPT_OPTIMIZER_API_KEY`
2. 系统环境变量 `PROMPT_OPTIMIZER_API_KEY`
3. **以上均无** → 不传 apiKey，尝试匿名调用；若返回 401，则告知用户需要配置 Key

---

## 工作流程

1. **理解用户意图** → 判断是首次优化（optimize）还是在上一次结果上继续迭代（iterate）
2. **收集必要参数** → 原始提示词文本（若缺失，向用户询问）
3. **用 `bash_tool` 执行 TypeScript 脚本** → 调用 `scripts/api-client.ts`
4. **解析并展示** → 将返回的 `optimizedPrompt` 以 Markdown 代码块展示
5. **询问是否继续迭代** → 提示用户"如需调整风格/语气/结构，请告知，我将调用迭代接口继续优化"

---

## 模块一：提示词优化（首次）

### 接口
- **方法**: `POST /api/prompt-optimizer/optimize`
- **说明**: 对原始提示词进行结构化优化，返回优化后的完整提示词及会话 ID
- **必填参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `input` | string | 需要优化的原始提示词 |
| `type` | string | 固定传 `"OPTIMIZE"` |
|         |        |                      |

- **返回关键字段**:
  - `data.sessionId` — 会话 ID，迭代时必须使用
  - `data.optimizedPrompt` — 优化后的提示词文本
  - `data.version` — 当前版本号

### 服务端内置优化能力

平台内置多种优化策略，由服务端自动选择，无需客户端指定。内置能力涵盖：**通用结构化优化**（重组角色/技能/规则）、**分析式深度优化**（输出完整 Role/Goals/Constrains 框架）、**输出格式规范化**（增加 OutputFormat 控制块）、**用户提示词精简优化**（消除模糊表达）、**专业化改写**（泛泛描述转为精准具体）、**步骤化规划**（复杂需求拆解为执行步骤）。

---

## 模块二：提示词迭代

### 接口
- **方法**: `POST /api/prompt-optimizer/iterate`
- **说明**: 基于已有会话对优化结果进行持续迭代，必须携带上一次返回的 `sessionId`
- **必填参数**:

| 参数 | 类型 | 说明 |
|------|------|------|
| `sessionId` | string | 上次 optimize/iterate 返回的会话 ID |
| `feedback` | string | 迭代需求，例如"语气更专业"、"增加错误处理步骤" |

- **返回关键字段**:
  - `data.optimizedPrompt` — 迭代后的新提示词
  - `data.version` — 版本号（每次迭代 +1）
  - `data.sessionId` — 同一会话 ID，可继续迭代

> ⚠️ **迭代前必须有 sessionId**：若用户直接说"再专业一点"但当前无 sessionId，需先调用 optimize 接口获取 sessionId，再执行迭代。

---

## 调用示例（bash_tool — 每次查询都必须执行此步骤）

**每次涉及提示词优化，必须先用 bash_tool 执行 TypeScript 脚本，再展示结果。**

### 标准调用模式

```bash
# 示例1：首次优化
npx tsx ~/.claude/skills/prompt-optimizer-skill/scripts/api-client.ts \
  optimize '{"input":"帮我生成一条AI最新动态的小红书文案","type":"OPTIMIZE","stream":false}'

# 示例2：迭代优化
npx tsx ~/.claude/skills/prompt-optimizer-skill/scripts/api-client.ts \
  iterate '{"sessionId":"4735d32dad2f405fa0785ac05c685ae0","feedback":"语气更专业一点"}'
```

### 接口与参数速查

| 意图 | action | 必填参数 |
|---|---|---|
| 首次优化提示词 | `optimize` | `input`, `type="OPTIMIZE"` |
| 迭代已有结果 | `iterate` | `sessionId`, `feedback` |

### 返回值处理

脚本成功时输出 `data` 字段的 JSON，失败时打印 ❌ 错误信息。

- `data.optimizedPrompt` — 核心结果，以 Markdown 代码块展示
- `data.sessionId` — 必须保存，供后续迭代使用
- `data.version` — 展示"第 N 版"，让用户感知迭代进度

---

## 展示规范

- **代码块展示**：`optimizedPrompt` 全文用 ` ```markdown ` 代码块包裹
- **版本标记**：在结果标题处注明"第 N 版优化结果"
- **sessionId 告知**：在结果下方注明会话 ID，提示用户"可继续迭代"
- **模板说明**：告知用户实际使用了哪个模板（`templateId`）及其特点
- **迭代引导**：每次输出后主动询问"是否需要进一步调整？例如：语气更严肃、增加约束条件、改变输出格式等"

---

## 参考文档

接口字段详细说明见 `references/api_fields.md`
