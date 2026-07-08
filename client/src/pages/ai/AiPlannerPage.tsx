import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  Bot,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Send,
  Sparkles,
  Split,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import {
  fetchAiStatus,
  generateConflictAdvice,
  generateSummary,
  generateTodayPlan,
  parseTask,
} from "../../services/ai";
import { createSchedule, type SchedulePayload } from "../../services/schedules";
import { fetchTags } from "../../services/tags";
import type {
  AiConflictAdvice,
  AiStatus,
  AiSummary,
  AiTaskDraft,
  AiTodayPlan,
  RiskLevel,
  Tag,
} from "../../types/domain";
import { formatDateTime } from "../../utils/date";
import { importanceLabels, statusLabels, urgencyLabels } from "../../utils/labels";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  tone?: "normal" | "error" | "success";
  plan?: AiTodayPlan;
  conflictAdvice?: AiConflictAdvice;
  summary?: AiSummary;
  draft?: AiTaskDraft;
  canConfirmDraft?: boolean;
};

type LoadingKey = "" | "plan" | "conflict" | "summary" | "parse" | "confirm";

const riskLabels: Record<RiskLevel, string> = {
  low: "低风险",
  medium: "中风险",
  high: "高风险",
};

function riskTone(risk: RiskLevel) {
  if (risk === "high") return "danger";
  if (risk === "medium") return "warning";
  return "success";
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createMessage(message: Omit<ChatMessage, "id">): ChatMessage {
  return {
    ...message,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
}

export function AiPlannerPage() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [taskContext, setTaskContext] = useState("");
  const [loadingKey, setLoadingKey] = useState<LoadingKey>("");
  const [confirmedDraftIds, setConfirmedDraftIds] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<ChatMessage[]>([
    createMessage({
      role: "assistant",
      content:
        "你好，我可以帮你生成今日智能计划、检查时间冲突、总结任务，也可以把自然语言整理成日程草稿。你可以直接描述要创建的日程。",
    }),
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const configured = Boolean(status?.configured);
  const busy = loadingKey !== "";

  const quickActions = useMemo(
    () => [
      { key: "plan" as const, label: "今日智能计划", icon: Sparkles },
      { key: "conflict" as const, label: "时间冲突建议", icon: Split },
      { key: "summary" as const, label: "任务总结", icon: FileText },
    ],
    [],
  );

  const addMessage = useCallback((message: Omit<ChatMessage, "id">) => {
    const next = createMessage(message);
    setMessages((items) => [...items, next]);
    return next.id;
  }, []);

  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === "function") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, loadingKey]);

  useEffect(() => {
    let mounted = true;
    void Promise.all([fetchAiStatus(), fetchTags()])
      .then(([nextStatus, nextTags]) => {
        if (!mounted) return;
        setStatus(nextStatus);
        setTags(nextTags);
      })
      .catch(() => {
        if (!mounted) return;
        addMessage({
          role: "assistant",
          tone: "error",
          content: "智能规划初始化失败，请稍后刷新页面重试。",
        });
      });

    return () => {
      mounted = false;
    };
  }, [addMessage]);

  function ensureConfigured() {
    if (configured) {
      return true;
    }

    addMessage({
      role: "assistant",
      tone: "error",
      content: "智能规划当前不可用，请确认后端环境变量已配置。配置完成后刷新页面再试。",
    });
    return false;
  }

  async function handleQuickAction(action: "plan" | "conflict" | "summary") {
    const label =
      action === "plan" ? "今日智能计划" : action === "conflict" ? "时间冲突建议" : "任务总结";
    addMessage({ role: "user", content: label });

    if (!ensureConfigured()) return;

    setLoadingKey(action);
    try {
      if (action === "plan") {
        const plan = await generateTodayPlan();
        addMessage({ role: "assistant", content: "已生成今日智能计划。", plan });
      }
      if (action === "conflict") {
        const conflictAdvice = await generateConflictAdvice();
        addMessage({ role: "assistant", content: "已完成时间冲突检查。", conflictAdvice });
      }
      if (action === "summary") {
        const summary = await generateSummary("today");
        addMessage({ role: "assistant", content: "已生成今日任务总结。", summary });
      }
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getErrorMessage(error, "AI 生成失败，请稍后重试。"),
      });
    } finally {
      setLoadingKey("");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    addMessage({ role: "user", content: text });
    setInput("");

    if (!ensureConfigured()) return;

    const nextContext = taskContext
      ? `${taskContext}\n用户补充：${text}`
      : `用户希望创建日程：${text}`;
    setTaskContext(nextContext);
    setLoadingKey("parse");

    try {
      const draft = await parseTask(nextContext);
      const hasQuestions = draft.clarifyingQuestions.length > 0;
      addMessage({
        role: "assistant",
        content: hasQuestions
          ? "我还需要确认几个信息，回答后我会继续整理日程草稿。"
          : "我已整理出日程草稿，确认后会创建到你的日程里。",
        draft,
        canConfirmDraft: !hasQuestions,
      });

      if (!hasQuestions) {
        setTaskContext("");
      }
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getErrorMessage(error, "任务草稿解析失败，请补充更多信息后重试。"),
      });
    } finally {
      setLoadingKey("");
    }
  }

  async function confirmDraft(messageId: string, draft: AiTaskDraft) {
    const tagIds = tags
      .filter((tag) => draft.suggestedTags.includes(tag.name))
      .map((tag) => tag.id);
    const payload: SchedulePayload = {
      title: draft.title,
      description: draft.description,
      startTime: draft.startTime ?? undefined,
      endTime: draft.endTime ?? undefined,
      dueTime: draft.dueTime ?? undefined,
      importance: draft.importance,
      urgency: draft.urgency,
      status: draft.status,
      tagIds,
    };

    setLoadingKey("confirm");
    try {
      await createSchedule(payload);
      setConfirmedDraftIds((ids) => new Set(ids).add(messageId));
      setTaskContext("");
      addMessage({
        role: "assistant",
        tone: "success",
        content: `已创建日程「${draft.title}」。`,
      });
      toast.success("日程已创建");
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getErrorMessage(error, "日程创建失败，请稍后重试。"),
      });
    } finally {
      setLoadingKey("");
    }
  }

  return (
    <div className="ai-chat-page">
      <header className="ai-chat-hero">
        <div>
          <h1>智能规划</h1>
          <p>像聊天一样规划日程。按钮可直接生成结果，也可以输入自然语言创建日程。</p>
        </div>
        <Button variant="secondary" onClick={() => setMessages([messages[0]])} disabled={busy}>
          清空对话
        </Button>
      </header>

      <section className="ai-chat-shell" aria-label="智能规划对话">
        <div className="ai-chat-messages" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              tags={tags}
              confirmed={confirmedDraftIds.has(message.id)}
              confirming={loadingKey === "confirm"}
              onConfirmDraft={() => {
                if (message.draft) void confirmDraft(message.id, message.draft);
              }}
            />
          ))}
          {busy && loadingKey !== "confirm" ? (
            <div className="ai-message ai-message--assistant">
              <div className="ai-message__avatar" aria-hidden="true">
                <Bot />
              </div>
              <div className="ai-message__bubble">
                <div className="ai-thinking">
                  <Loader2 className="spin" aria-hidden="true" />
                  <span>正在思考...</span>
                </div>
              </div>
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <form className="ai-composer" onSubmit={handleSubmit}>
          <div className="ai-quick-actions" aria-label="快捷功能">
            {quickActions.map((action) => (
              <Button
                key={action.key}
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => void handleQuickAction(action.key)}
              >
                <action.icon aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
          <div className="ai-input-row">
            <textarea
              aria-label="输入自然语言日程或问题"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="例如：明天下午三点提醒我完成数据库实验报告，很重要很紧急，加上课程标签。"
              rows={2}
            />
            <Button type="submit" disabled={busy || input.trim().length < 2} aria-label="发送">
              <Send aria-hidden="true" />
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MessageBubble({
  message,
  tags,
  confirmed,
  confirming,
  onConfirmDraft,
}: {
  message: ChatMessage;
  tags: Tag[];
  confirmed: boolean;
  confirming: boolean;
  onConfirmDraft: () => void;
}) {
  const isAssistant = message.role === "assistant";
  return (
    <div className={`ai-message ai-message--${message.role}`}>
      <div className="ai-message__avatar" aria-hidden="true">
        {isAssistant ? <Bot /> : <UserRound />}
      </div>
      <div className={`ai-message__bubble ai-message__bubble--${message.tone ?? "normal"}`}>
        <p>{message.content}</p>
        {message.plan ? <TodayPlanView plan={message.plan} /> : null}
        {message.conflictAdvice ? <ConflictAdviceView advice={message.conflictAdvice} /> : null}
        {message.summary ? <SummaryView summary={message.summary} /> : null}
        {message.draft ? (
          <DraftView
            draft={message.draft}
            tags={tags}
            canConfirm={Boolean(message.canConfirmDraft)}
            confirmed={confirmed}
            confirming={confirming}
            onConfirm={onConfirmDraft}
          />
        ) : null}
      </div>
    </div>
  );
}

function TodayPlanView({ plan }: { plan: AiTodayPlan }) {
  return (
    <div className="ai-chat-result">
      <p>{plan.overview}</p>
      {plan.recommendedTasks.map((task) => (
        <div className="ai-result-item" key={`${task.taskId}-${task.title}`}>
          <div className="ai-result-item__title">
            <strong>{task.title}</strong>
            <Badge tone={riskTone(task.riskLevel)}>{riskLabels[task.riskLevel]}</Badge>
          </div>
          <span>{task.suggestedTimeRange}</span>
          <p>{task.priorityReason}</p>
          <small>{task.actionSuggestion}</small>
        </div>
      ))}
      {plan.warnings.map((warning) => (
        <div className="ai-inline-warning" key={`${warning.type}-${warning.message}`}>
          {warning.message}
        </div>
      ))}
      <div className="ai-inline-success">
        <CheckCircle2 aria-hidden="true" />
        <span>{plan.productivityTip}</span>
      </div>
    </div>
  );
}

function ConflictAdviceView({ advice }: { advice: AiConflictAdvice }) {
  if (advice.conflictCount === 0) {
    return <div className="ai-inline-success">当前没有检测到时间冲突。</div>;
  }

  return (
    <div className="ai-chat-result">
      <p>检测到 {advice.conflictCount} 个时间冲突。</p>
      {advice.conflicts.map((conflict) => (
        <div className="ai-result-item" key={conflict.taskIds.join("-")}>
          <div className="ai-result-item__title">
            <strong>{conflict.conflictTimeRange}</strong>
            <Badge tone="warning">{conflict.taskIds.length} 个任务</Badge>
          </div>
          <p>{conflict.explanation}</p>
          <small>{conflict.adjustmentSuggestion}</small>
          <small>{conflict.priorityRecommendation}</small>
        </div>
      ))}
    </div>
  );
}

function SummaryView({ summary }: { summary: AiSummary }) {
  return (
    <div className="ai-chat-result">
      <div className="ai-summary-strip">
        <Metric label="已完成" value={summary.completedCount} />
        <Metric label="未完成" value={summary.pendingCount} />
        <Metric label="已逾期" value={summary.overdueCount} />
        <Metric label="高优先级" value={summary.highPriorityCount} />
      </div>
      <p>{summary.summary}</p>
      <ListBlock title="标签洞察" items={summary.tagInsights} />
      <ListBlock title="调整建议" items={summary.suggestions} />
      <div className="ai-inline-success">
        <Clock3 aria-hidden="true" />
        <span>{summary.nextFocus}</span>
      </div>
    </div>
  );
}

function DraftView({
  draft,
  tags,
  canConfirm,
  confirmed,
  confirming,
  onConfirm,
}: {
  draft: AiTaskDraft;
  tags: Tag[];
  canConfirm: boolean;
  confirmed: boolean;
  confirming: boolean;
  onConfirm: () => void;
}) {
  const matchedTags = tags.filter((tag) => draft.suggestedTags.includes(tag.name));
  const missingTags = draft.suggestedTags.filter((name) => !matchedTags.some((tag) => tag.name === name));

  return (
    <div className="ai-draft-card">
      <div className="ai-result-item__title">
        <strong>{draft.title}</strong>
        <Badge tone="primary">置信度 {Math.round(draft.confidence * 100)}%</Badge>
      </div>
      {draft.description ? <p>{draft.description}</p> : null}
      <div className="ai-draft-grid">
        <Metric label="开始" value={formatDateTime(draft.startTime)} />
        <Metric label="结束" value={formatDateTime(draft.endTime)} />
        <Metric label="截止" value={formatDateTime(draft.dueTime)} />
        <Metric
          label="属性"
          value={`重要 ${importanceLabels[draft.importance]} / 紧急 ${urgencyLabels[draft.urgency]} / ${statusLabels[draft.status]}`}
        />
      </div>
      {matchedTags.length > 0 ? (
        <div className="ai-chat-tags">
          {matchedTags.map((tag) => (
            <span key={tag.id} style={{ borderColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      ) : null}
      {missingTags.length > 0 ? <small>建议标签未存在：{missingTags.join("、")}。不会自动创建。</small> : null}
      {draft.clarifyingQuestions.length > 0 ? (
        <div className="ai-question-list">
          {draft.clarifyingQuestions.map((question) => (
            <span key={question}>{question}</span>
          ))}
        </div>
      ) : null}
      {canConfirm ? (
        <Button size="sm" loading={confirming} disabled={confirmed} onClick={onConfirm}>
          <CalendarPlus aria-hidden="true" />
          {confirmed ? "已创建" : "确认创建日程"}
        </Button>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="ai-chat-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;

  return (
    <div className="ai-list-block">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
