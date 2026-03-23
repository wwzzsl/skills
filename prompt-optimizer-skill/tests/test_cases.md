# 测试用例

## 测试一：基础优化（短提示词）

**用户输入**: "帮我优化这个提示词：写一篇关于环保的文章"

**预期行为**:
1. 调用 `optimize` 接口，templateId 推荐 `builtin:user-prompt-basic` 或 `builtin:user-prompt-professional`
2. 展示 `optimizedPrompt`，用代码块包裹
3. 展示 `sessionId` 并提示可继续迭代

---

## 测试二：复杂 System Prompt 优化

**用户输入**: "帮我优化这个提示词：你是一个客服机器人，专门解答用户关于我们产品的问题，要友好且简洁"

**预期行为**:
1. 调用 `optimize` 接口，templateId 推荐 `builtin:analytical-optimize`（含完整框架）
2. 优化结果应包含 Role/Goals/Constrains 等结构
3. 展示版本号"第 1 版优化结果"

---

## 测试三：迭代优化

**用户输入**: 在测试二完成后，用户说"语气再正式一些，并加上错误处理流程"

**预期行为**:
1. 从上一轮提取 `sessionId`
2. 调用 `iterate` 接口，feedback = "语气再正式一些，并加上错误处理流程"
3. 展示"第 2 版优化结果"，内容应体现更正式语气

---

## 测试四：无 sessionId 时要求迭代

**用户输入**: "把这个提示词改得更简洁：[用户粘贴一段提示词]，然后再让它更专业"

**预期行为**:
1. 先调用 `optimize` 接口（type="OPTIMIZE"）获取 sessionId
2. 用返回的 sessionId 立即调用 `iterate` 接口（feedback = "更专业"）
3. 展示最终迭代结果，版本号应为 2

---

## 测试五：API 调用失败处理

**预期行为**:
- 若网络不通，显示 `❌ 网络请求失败: ...`
- 若接口返回 401，提示用户配置 apiKey
- 严禁用模型自身输出的内容代替 API 响应
