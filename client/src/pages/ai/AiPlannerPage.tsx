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
  DraftMissingField,
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
  missingFields?: DraftMissingField[];
  canConfirmDraft?: boolean;
};

type ChatState = {
  messages: ChatMessage[];
  taskContext: string;
  confirmedDraftIds: string[];
  lastDraft: AiTaskDraft | null;
};

type LoadingKey = "" | "plan" | "conflict" | "summary" | "parse" | "confirm";

const CHAT_STORAGE_KEY = "schedule.todo.aiPlanner.chat.v2";

const draftFieldOrder: DraftMissingField[] = [
  "title",
  "description",
  "startTime",
  "endTime",
  "dueTime",
  "importance",
  "urgency",
  "status",
  "tags",
];

const draftFieldLabels: Record<DraftMissingField, string> = {
  title: "标题",
  description: "备注",
  startTime: "开始时间",
  endTime: "结束时间",
  dueTime: "截止时间",
  importance: "重要程度",
  urgency: "紧急程度",
  status: "当前状态",
  tags: "标签",
};

const draftFieldQuestions: Record<DraftMissingField, string> = {
  title: "这条日程的标题是什么？",
  description: "需要添加备注吗？不需要的话可以回复“无备注”。",
  startTime: "什么时候开始？",
  endTime: "预计什么时候结束？",
  dueTime: "截止时间是什么时候？",
  importance: "重要程度是低、中还是高？",
  urgency: "紧急程度是低、中还是高？",
  status: "当前状态是待处理、进行中、已完成还是已取消？",
  tags: "要绑定哪些标签？不需要的话可以回复“无标签”。",
};

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

function getErrorCode(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: unknown }).code ?? "");
  }

  return "";
}

function getFriendlyErrorMessage(error: unknown, fallback: string) {
  const code = getErrorCode(error);
  if (code === "AI_RESPONSE_INVALID") {
    return "这次没有整理出可用结果，对话已经保留。请再试一次，或换个说法让我重新整理。";
  }
  if (code === "AI_PROVIDER_TIMEOUT") {
    return "这次思考时间有点久，请稍后再试一次。";
  }
  if (code === "AI_PROVIDER_ERROR") {
    return "智能规划服务暂时没有响应，请稍后再试。";
  }
  if (code === "AI_NOT_CONFIGURED") {
    return "智能规划还没有准备好，配置完成后刷新页面即可继续。";
  }

  return error instanceof Error ? error.message : fallback;
}

function createMessage(message: Omit<ChatMessage, "id">): ChatMessage {
  return {
    ...message,
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  };
}

function createWelcomeMessage() {
  return createMessage({
    role: "assistant",
    content:
      "你好，我可以帮你安排今天、看看时间是否冲突，也能把一句话整理成日程。你直接说要做什么，我会把信息确认完整后再保存。",
  });
}

function createInitialChatState(): ChatState {
  return {
    messages: [createWelcomeMessage()],
    taskContext: "",
    confirmedDraftIds: [],
    lastDraft: null,
  };
}

function loadStoredChatState(): ChatState {
  if (typeof window === "undefined") {
    return createInitialChatState();
  }

  try {
    const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!raw) return createInitialChatState();

    const parsed = JSON.parse(raw) as Partial<ChatState>;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return createInitialChatState();
    }

    return {
      messages: parsed.messages,
      taskContext: typeof parsed.taskContext === "string" ? parsed.taskContext : "",
      confirmedDraftIds: Array.isArray(parsed.confirmedDraftIds) ? parsed.confirmedDraftIds : [],
      lastDraft: parsed.lastDraft ?? null,
    };
  } catch {
    return createInitialChatState();
  }
}

function saveStoredChatState(state: ChatState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(state));
}

function contextHasNoDescription(context: string) {
  return /无备注|不用备注|不需要备注|没有备注|无描述|不用描述|不需要描述|没有描述/.test(context);
}

function contextHasNoTags(context: string) {
  return /无标签|不用标签|不需要标签|没有标签/.test(context);
}

function contextHasImportance(context: string) {
  return /重要程度|重要|不重要|高优先|中优先|低优先|普通优先|一般重要|低重要/.test(context);
}

function contextHasUrgency(context: string) {
  return /紧急程度|紧急|不急|不紧急|尽快|马上|立刻|普通紧急|一般紧急/.test(context);
}

function contextHasStatus(context: string) {
  return /状态|待处理|待办|未开始|进行中|已完成|完成了|已取消|取消/.test(context);
}

function getDraftMissingFields(draft: AiTaskDraft, context: string): DraftMissingField[] {
  const fields = new Set<DraftMissingField>(draft.missingFields ?? []);

  if (draft.title.trim()) fields.delete("title");
  else fields.add("title");

  if (draft.description.trim() || contextHasNoDescription(context)) fields.delete("description");
  else fields.add("description");

  if (draft.startTime) fields.delete("startTime");
  else fields.add("startTime");

  if (draft.endTime) fields.delete("endTime");
  else fields.add("endTime");

  if (draft.dueTime) fields.delete("dueTime");
  else fields.add("dueTime");

  if (contextHasImportance(context)) fields.delete("importance");
  else fields.add("importance");

  if (contextHasUrgency(context)) fields.delete("urgency");
  else fields.add("urgency");

  if (contextHasStatus(context)) fields.delete("status");
  else fields.add("status");

  if (draft.suggestedTags.length > 0 || contextHasNoTags(context)) fields.delete("tags");
  else fields.add("tags");

  return draftFieldOrder.filter((field) => fields.has(field));
}

function buildClarifyingQuestions(draft: AiTaskDraft, fields: DraftMissingField[]) {
  const questions = [...draft.clarifyingQuestions, ...fields.map((field) => draftFieldQuestions[field])];
  return [...new Set(questions)].slice(0, 6);
}

function isClearlyUnrelatedDuringDraft(text: string) {
  const hasScheduleSignal =
    /今天|明天|后天|下周|上午|下午|晚上|点|分钟|小时|开始|结束|截止|重要|紧急|状态|待处理|进行中|完成|取消|标签|备注|描述|无标签|无备注|不需要|不用|\d/.test(
      text,
    );
  const hasUnrelatedSignal = /天气|新闻|笑话|你是谁|闲聊|电影|音乐|游戏|股票|旅游|哈哈|无聊/.test(text);
  return hasUnrelatedSignal && !hasScheduleSignal;
}

function buildTaskPrompt({
  taskContext,
  lastDraft,
  missingFields,
  text,
}: {
  taskContext: string;
  lastDraft: AiTaskDraft | null;
  missingFields: DraftMissingField[];
  text: string;
}) {
  if (!taskContext) {
    return `用户希望创建日程：${text}`;
  }

  return [
    taskContext,
    lastDraft
      ? `已有草稿：${JSON.stringify({
          title: lastDraft.title,
          description: lastDraft.description,
          startTime: lastDraft.startTime,
          endTime: lastDraft.endTime,
          dueTime: lastDraft.dueTime,
          importance: lastDraft.importance,
          urgency: lastDraft.urgency,
          status: lastDraft.status,
          suggestedTags: lastDraft.suggestedTags,
        })}`
      : "",
    missingFields.length > 0
      ? `仍需确认：${missingFields.map((field) => draftFieldLabels[field]).join("、")}`
      : "",
    `用户补充：${text}`,
    "如果用户补充与日程创建无关，请保持已有草稿，并继续询问仍需确认的信息。",
  ]
    .filter(Boolean)
    .join("\n");
}

export function AiPlannerPage() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [input, setInput] = useState("");
  const [loadingKey, setLoadingKey] = useState<LoadingKey>("");
  const [chatState, setChatState] = useState<ChatState>(() => loadStoredChatState());
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const configured = Boolean(status?.configured);
  const busy = loadingKey !== "";
  const confirmedDraftIds = useMemo(() => new Set(chatState.confirmedDraftIds), [chatState.confirmedDraftIds]);

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
    setChatState((state) => ({ ...state, messages: [...state.messages, next] }));
    return next.id;
  }, []);

  useEffect(() => {
    saveStoredChatState(chatState);
  }, [chatState]);

  useEffect(() => {
    if (typeof chatEndRef.current?.scrollIntoView === "function") {
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [chatState.messages, loadingKey]);

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
          content: "我暂时没能载入你的智能规划配置，刷新页面后可以再试一次。",
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
      content: "我现在还连不上智能规划服务。配置完成后刷新页面，就可以继续使用。",
    });
    return false;
  }

  function clearConversation() {
    const nextState = createInitialChatState();
    setChatState(nextState);
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
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
        addMessage({ role: "assistant", content: "我看了一下今天的安排，可以这样推进：", plan });
      }
      if (action === "conflict") {
        const conflictAdvice = await generateConflictAdvice();
        addMessage({ role: "assistant", content: "我帮你检查了时间安排：", conflictAdvice });
      }
      if (action === "summary") {
        const summary = await generateSummary("today");
        addMessage({ role: "assistant", content: "这是今天目前的任务状态：", summary });
      }
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getFriendlyErrorMessage(error, "这次没有生成成功，请稍后再试。"),
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

    const currentMissing = chatState.lastDraft
      ? getDraftMissingFields(chatState.lastDraft, chatState.taskContext)
      : [];

    if (chatState.taskContext && chatState.lastDraft && isClearlyUnrelatedDuringDraft(text)) {
      const questions = buildClarifyingQuestions(chatState.lastDraft, currentMissing);
      addMessage({
        role: "assistant",
        content: "我们先把这条日程补完整，确认好后我再帮你保存。",
        draft: { ...chatState.lastDraft, clarifyingQuestions: questions, missingFields: currentMissing },
        missingFields: currentMissing,
        canConfirmDraft: false,
      });
      return;
    }

    if (!ensureConfigured()) return;

    const nextContext = buildTaskPrompt({
      taskContext: chatState.taskContext,
      lastDraft: chatState.lastDraft,
      missingFields: currentMissing,
      text,
    });
    setChatState((state) => ({ ...state, taskContext: nextContext }));
    setLoadingKey("parse");

    try {
      const draft = await parseTask(nextContext);
      const missingFields = getDraftMissingFields(draft, nextContext);
      const clarifyingQuestions = buildClarifyingQuestions(draft, missingFields);
      const normalizedDraft: AiTaskDraft = {
        ...draft,
        clarifyingQuestions,
        missingFields,
      };
      const isComplete = missingFields.length === 0;

      addMessage({
        role: "assistant",
        content: isComplete
          ? "这条日程已经整理好了。你确认后，我再把它保存到日程里。"
          : "还差几项信息，我确认好之后再帮你保存：",
        draft: normalizedDraft,
        missingFields,
        canConfirmDraft: isComplete,
      });

      setChatState((state) => ({
        ...state,
        taskContext: isComplete ? "" : nextContext,
        lastDraft: isComplete ? null : normalizedDraft,
      }));
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getFriendlyErrorMessage(error, "我暂时没能整理出日程，请补充更多信息后再试。"),
      });
    } finally {
      setLoadingKey("");
    }
  }

  async function confirmDraft(messageId: string, draft: AiTaskDraft, missingFields: DraftMissingField[]) {
    if (missingFields.length > 0) {
      addMessage({
        role: "assistant",
        content: `还需要确认：${missingFields.map((field) => draftFieldLabels[field]).join("、")}。补齐后我再保存。`,
      });
      return;
    }

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
      setChatState((state) => ({
        ...state,
        confirmedDraftIds: [...new Set([...state.confirmedDraftIds, messageId])],
        taskContext: "",
        lastDraft: null,
      }));
      addMessage({
        role: "assistant",
        tone: "success",
        content: `已保存「${draft.title}」。`,
      });
      toast.success("日程已保存");
    } catch (error) {
      addMessage({
        role: "assistant",
        tone: "error",
        content: getFriendlyErrorMessage(error, "日程暂时没有保存成功，请稍后再试。"),
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
          <p>把想做的事说出来，我会帮你补齐时间、优先级和标签，再由你确认保存。</p>
        </div>
        <Button variant="secondary" onClick={clearConversation} disabled={busy}>
          清空对话
        </Button>
      </header>

      <section className="ai-chat-shell" aria-label="智能规划对话">
        <div className="ai-chat-messages" aria-live="polite">
          {chatState.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              tags={tags}
              confirmed={confirmedDraftIds.has(message.id)}
              confirming={loadingKey === "confirm"}
              onConfirmDraft={() => {
                if (message.draft) {
                  void confirmDraft(message.id, message.draft, message.missingFields ?? []);
                }
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
                  <span>正在整理...</span>
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
              placeholder="例如：明天 15:00 到 16:00 写数据库实验报告，今晚 22:00 截止，很重要很紧急，待处理，课程标签，无备注。"
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
            missingFields={message.missingFields ?? []}
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
      {plan.recommendedTasks.length === 0 ? (
        <div className="ai-inline-success">今天没有需要特别调整顺序的任务，保持当前节奏就好。</div>
      ) : null}
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
    return <div className="ai-inline-success">目前没有明显的时间冲突，可以按原安排推进。</div>;
  }

  return (
    <div className="ai-chat-result">
      <p>我发现 {advice.conflictCount} 处时间重叠，建议先确认下面这些安排。</p>
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
      <ListBlock title="标签观察" items={summary.tagInsights} />
      <ListBlock title="接下来可以这样做" items={summary.suggestions} />
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
  missingFields,
  canConfirm,
  confirmed,
  confirming,
  onConfirm,
}: {
  draft: AiTaskDraft;
  tags: Tag[];
  missingFields: DraftMissingField[];
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
        <Badge tone={canConfirm ? "success" : "warning"}>{canConfirm ? "待你确认" : "还需补充"}</Badge>
      </div>
      {draft.description ? <p>{draft.description}</p> : <p>没有备注。</p>}
      <div className="ai-draft-grid">
        <Metric label="开始" value={formatDateTime(draft.startTime)} />
        <Metric label="结束" value={formatDateTime(draft.endTime)} />
        <Metric label="截止" value={formatDateTime(draft.dueTime)} />
        <Metric
          label="优先级"
          value={`重要 ${importanceLabels[draft.importance]} / 紧急 ${urgencyLabels[draft.urgency]}`}
        />
        <Metric label="状态" value={statusLabels[draft.status]} />
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
      {draft.suggestedTags.length === 0 ? <small>不绑定标签。</small> : null}
      {missingTags.length > 0 ? <small>这些标签还不存在：{missingTags.join("、")}，保存时不会自动创建。</small> : null}
      {missingFields.length > 0 ? (
        <div className="ai-missing-fields" aria-label="仍需确认">
          {missingFields.map((field) => (
            <span key={field}>{draftFieldLabels[field]}</span>
          ))}
        </div>
      ) : null}
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
          {confirmed ? "已保存" : "确认保存日程"}
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
