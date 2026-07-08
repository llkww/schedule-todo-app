import type { z } from "zod";

import { config } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { buildSystemPrompt } from "../utils/aiPromptBuilder.js";
import { parseJsonSafely } from "../utils/aiResponseParser.js";

type DeepSeekMessage = {
  role: "system" | "user";
  content: string;
};

type CallDeepSeekJsonInput<T> = {
  userPrompt: string;
  schema: z.ZodSchema<T>;
};

type DeepSeekResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function readAiConfig() {
  return {
    provider: process.env.AI_PROVIDER ?? config.aiProvider,
    apiKey: process.env.DEEPSEEK_API_KEY ?? config.deepseekApiKey,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? config.deepseekBaseUrl,
    model: process.env.DEEPSEEK_MODEL ?? config.deepseekModel,
    timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? config.aiTimeoutMs),
    maxOutputTokens: Number(process.env.AI_MAX_OUTPUT_TOKENS ?? config.aiMaxOutputTokens),
  };
}

export function getDeepSeekStatus() {
  const aiConfig = readAiConfig();
  return {
    provider: "deepseek",
    configured: Boolean(aiConfig.apiKey.trim()),
    model: aiConfig.model,
  };
}

export function assertDeepSeekConfigured() {
  const aiConfig = readAiConfig();
  if (aiConfig.provider !== "deepseek" || !aiConfig.apiKey.trim()) {
    throw new AppError(503, "AI_NOT_CONFIGURED", "AI Planner 未配置，请在后端 .env 中设置 DEEPSEEK_API_KEY");
  }

  if (aiConfig.model === "deepseek-chat" || aiConfig.model === "deepseek-reasoner") {
    throw new AppError(500, "AI_MODEL_NOT_ALLOWED", "AI 模型配置不符合要求");
  }

  return aiConfig;
}

function buildDeepSeekUrl(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

async function requestDeepSeek(messages: DeepSeekMessage[]) {
  const aiConfig = assertDeepSeekConfigured();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), aiConfig.timeoutMs);

  try {
    const response = await fetch(buildDeepSeekUrl(aiConfig.baseUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${aiConfig.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages,
        temperature: 0.2,
        max_tokens: aiConfig.maxOutputTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AppError(502, "AI_PROVIDER_ERROR", "AI 服务调用失败，请稍后重试");
    }

    return (await response.json()) as DeepSeekResponse;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError(504, "AI_PROVIDER_TIMEOUT", "AI 服务响应超时，请稍后重试");
    }

    throw new AppError(502, "AI_PROVIDER_ERROR", "AI 服务调用失败，请稍后重试");
  } finally {
    clearTimeout(timeout);
  }
}

export async function callDeepSeekJson<T>({ userPrompt, schema }: CallDeepSeekJsonInput<T>) {
  const response = await requestDeepSeek([
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: userPrompt },
  ]);
  const content = response.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return retryJsonRepair(userPrompt, "", schema);
  }

  try {
    return parseJsonSafely(content, schema);
  } catch (error) {
    if (error instanceof AppError && error.code === "AI_RESPONSE_INVALID") {
      return retryJsonRepair(userPrompt, content, schema);
    }

    throw error;
  }
}

async function retryJsonRepair<T>(userPrompt: string, previousContent: string, schema: z.ZodSchema<T>) {
  const repairPrompt = [
    "上一次模型输出不是可解析的 JSON 或不符合 schema。",
    "请根据原始任务重新生成，必须只返回一个 JSON 对象。",
    "不要 Markdown，不要解释，不要代码块，不要省略字段。",
    "原始任务：",
    userPrompt,
    "上一次输出：",
    previousContent ? previousContent.slice(0, 4000) : "(empty)",
  ].join("\n");
  const repaired = await requestDeepSeek([
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: repairPrompt },
  ]);
  const content = repaired.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new AppError(502, "AI_RESPONSE_INVALID", "这次智能规划没有整理成功，请稍后重试");
  }

  return parseJsonSafely(content, schema);
}
