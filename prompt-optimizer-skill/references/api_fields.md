# API 字段说明

## POST /api/prompt-optimizer/optimize

### 请求体字段

| 字段 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `input` | string | ✅ | 需要优化的原始提示词文本 |
| `type` | string | ✅ | 固定传 `"OPTIMIZE"` |
| `stream` | boolean | ❌ | 是否流式返回，建议传 `false` |
| `templateId` | string | ❌ | 指定内置模板 ID（见 templates.md），不传则服务端自动选择 |

### 请求 Header

| 字段 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `apiKey` | string | ✅ | 鉴权 Key，若平台开放则可不传 |

### 成功响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "string",         // 会话 ID，迭代时使用
    "version": 1,                  // 版本号，初始为 1
    "originalPrompt": "string",    // 用户传入的原始提示词
    "optimizedPrompt": "string",   // 优化后的完整提示词
    "templateId": "string"         // 实际使用的模板 ID
  },
  "extra": {}
}
```

---

## POST /api/prompt-optimizer/iterate

### 请求体字段

| 字段 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `sessionId` | string | ✅ | 上次 optimize/iterate 返回的会话 ID |
| `feedback` | string | ✅ | 迭代需求，如"语气更专业"、"去掉示例部分" |

### 成功响应结构

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "sessionId": "string",         // 同一会话 ID，保持不变
    "version": 2,                  // 版本号，每次迭代 +1
    "originalPrompt": "string",    // 最初的原始提示词
    "optimizedPrompt": "string",   // 本次迭代后的完整提示词
    "templateId": "iterate"        // 迭代模板固定为 "iterate"
  },
  "extra": {}
}
```

---

## 错误码

| code | 含义 |
|------|------|
| 200 | 成功 |
| 401 | 未授权，需传入有效 apiKey |
| 400 | 请求参数错误，检查必填字段 |
| 500 | 服务端错误，稍后重试 |
