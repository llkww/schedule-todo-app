type PromptPayload = Record<string, unknown>;

export function buildSystemPrompt() {
  return [
    "你是日程规划助手。",
    "只能根据给定任务数据生成建议，不要编造不存在的任务。",
    "不要请求、输出或推断用户密码、token、API Key、secret 或任何凭据。",
    "不要输出 Markdown，不要输出解释性前后缀，只返回 JSON。",
    "不要直接要求系统修改数据库，所有建议必须由用户确认后才可执行。",
    "如果任务信息不足，请通过 clarifyingQuestions 字段返回问题。",
    "所有输出必须符合指定 JSON schema。",
    "所有自然语言字段必须使用简体中文。",
  ].join("\n");
}

export function buildUserPrompt(task: string, schemaDescription: PromptPayload, payload: PromptPayload) {
  return JSON.stringify(
    {
      task,
      outputRules: {
        language: "简体中文",
        format: "strict-json-only",
        noMarkdown: true,
      },
      schema: schemaDescription,
      data: payload,
    },
    null,
    2,
  );
}
