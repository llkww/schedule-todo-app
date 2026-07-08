import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  BrainCircuit,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Sparkles,
  Split,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Select, Textarea } from "../../components/ui/Field";
import { SkeletonList } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { TagPill } from "../../components/ui/TagPill";
import {
  fetchAiStatus,
  generateConflictAdvice,
  generateSummary,
  generateTodayPlan,
  parseTask,
} from "../../services/ai";
import { createSchedule, type SchedulePayload } from "../../services/schedules";
import { fetchTags } from "../../services/tags";
import type { AiConflictAdvice, AiStatus, AiSummary, AiTaskDraft, AiTodayPlan, RiskLevel, Tag } from "../../types/domain";
import { formatDateTime } from "../../utils/date";
import { importanceLabels, statusLabels, urgencyLabels } from "../../utils/labels";

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

export function AiPlannerPage() {
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState("");
  const [plan, setPlan] = useState<AiTodayPlan | null>(null);
  const [conflictAdvice, setConflictAdvice] = useState<AiConflictAdvice | null>(null);
  const [summary, setSummary] = useState<AiSummary | null>(null);
  const [summaryRange, setSummaryRange] = useState<"today" | "week">("today");
  const [taskText, setTaskText] = useState("");
  const [draft, setDraft] = useState<AiTaskDraft | null>(null);
  const [operationError, setOperationError] = useState("");
  const [loadingKey, setLoadingKey] = useState<"" | "plan" | "conflict" | "parse" | "summary" | "confirm">("");

  const configured = Boolean(status?.configured);

  const matchedTagIds = useMemo(() => {
    if (!draft) return [];
    const names = new Set(draft.suggestedTags);
    return tags.filter((tag) => names.has(tag.name)).map((tag) => tag.id);
  }, [draft, tags]);

  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    setInitialError("");
    try {
      const [nextStatus, nextTags] = await Promise.all([fetchAiStatus(), fetchTags()]);
      setStatus(nextStatus);
      setTags(nextTags);
    } catch (error) {
      setInitialError(getErrorMessage(error, "智能日程助理加载失败"));
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  async function runPlan() {
    setLoadingKey("plan");
    setOperationError("");
    try {
      setPlan(await generateTodayPlan());
      toast.success("今日智能计划已生成");
    } catch (error) {
      setOperationError(getErrorMessage(error, "今日计划生成失败"));
    } finally {
      setLoadingKey("");
    }
  }

  async function runConflictAdvice() {
    setLoadingKey("conflict");
    setOperationError("");
    try {
      setConflictAdvice(await generateConflictAdvice());
      toast.success("时间冲突建议已生成");
    } catch (error) {
      setOperationError(getErrorMessage(error, "时间冲突建议生成失败"));
    } finally {
      setLoadingKey("");
    }
  }

  async function runParseTask() {
    setLoadingKey("parse");
    setOperationError("");
    try {
      setDraft(await parseTask(taskText));
      toast.success("任务草稿已生成");
    } catch (error) {
      setOperationError(getErrorMessage(error, "任务草稿解析失败"));
    } finally {
      setLoadingKey("");
    }
  }

  async function runSummary() {
    setLoadingKey("summary");
    setOperationError("");
    try {
      setSummary(await generateSummary(summaryRange));
      toast.success("任务总结已生成");
    } catch (error) {
      setOperationError(getErrorMessage(error, "任务总结生成失败"));
    } finally {
      setLoadingKey("");
    }
  }

  async function confirmDraft() {
    if (!draft) return;

    const payload: SchedulePayload = {
      title: draft.title,
      description: draft.description,
      startTime: draft.startTime ?? undefined,
      endTime: draft.endTime ?? undefined,
      dueTime: draft.dueTime ?? undefined,
      importance: draft.importance,
      urgency: draft.urgency,
      status: draft.status,
      tagIds: matchedTagIds,
    };

    setLoadingKey("confirm");
    setOperationError("");
    try {
      await createSchedule(payload);
      toast.success("日程已创建");
      setDraft(null);
      setTaskText("");
    } catch (error) {
      setOperationError(getErrorMessage(error, "日程创建失败"));
    } finally {
      setLoadingKey("");
    }
  }

  return (
    <>
      <PageHeader
        title="智能日程助理"
        description="基于你的日程、标签、重要程度和截止时间生成规划建议。所有建议都需要你确认后才会执行。"
        actions={
          <Link className="button button--secondary" to="/schedules/new">
            <CalendarPlus aria-hidden="true" />
            手动新建
          </Link>
        }
      />

      {initialLoading ? <SkeletonList rows={3} /> : null}
      {!initialLoading && initialError ? (
        <EmptyState
          title="智能日程助理无法加载"
          description={initialError}
          action={<Button onClick={() => void loadInitialData()}>重试</Button>}
        />
      ) : null}

      {!initialLoading && !initialError && status ? (
        <div className="ai-planner-grid">
          <Card
            title="服务状态"
            description="后端只返回配置状态和模型名，不会返回任何密钥内容。"
            actions={
              <Button variant="ghost" size="sm" onClick={() => void loadInitialData()}>
                <RefreshCw aria-hidden="true" />
                刷新
              </Button>
            }
          >
            <div className="ai-status-grid">
              <StatusMetric label="服务商" value="DeepSeek" />
              <StatusMetric label="模型" value={status.model} />
              <div className="ai-status-metric">
                <span>可用状态</span>
                <Badge tone={configured ? "success" : "warning"}>{configured ? "已配置" : "未配置"}</Badge>
              </div>
            </div>
            {!configured ? (
              <div className="ai-alert ai-alert--warning">
                <AlertTriangle aria-hidden="true" />
                <span>智能日程助理未配置，请在后端 server/.env 中设置 DEEPSEEK_API_KEY。</span>
              </div>
            ) : null}
          </Card>

          {operationError ? (
            <div className="ai-alert ai-alert--danger" role="alert">
              <AlertTriangle aria-hidden="true" />
              <span>{operationError}</span>
            </div>
          ) : null}

          <Card
            className="ai-card--wide"
            title="今日智能计划"
            description="生成今日任务顺序、风险提醒和行动建议。"
            actions={
              <Button loading={loadingKey === "plan"} disabled={!configured} onClick={() => void runPlan()}>
                <Sparkles aria-hidden="true" />
                生成今日计划
              </Button>
            }
          >
            {plan ? <TodayPlanView plan={plan} /> : <InlineEmpty text="还没有生成今日计划。" />}
          </Card>

          <Card
            title="时间冲突建议"
            description="检测未完成日程的时间重叠，并生成调整建议。"
            actions={
              <Button
                variant="secondary"
                loading={loadingKey === "conflict"}
                disabled={!configured}
                onClick={() => void runConflictAdvice()}
              >
                <Split aria-hidden="true" />
                检测冲突
              </Button>
            }
          >
            {conflictAdvice ? <ConflictAdviceView advice={conflictAdvice} /> : <InlineEmpty text="尚未检测时间冲突。" />}
          </Card>

          <Card
            title="自然语言任务草稿"
            description="解析为草稿后不会自动写入数据库，确认后才会创建日程。"
          >
            <div className="ai-form-stack">
              <Textarea
                label="任务描述"
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                placeholder="明天下午三点提醒我完成数据库实验报告，比较重要，很紧急，加上课程标签。"
              />
              <div className="ai-actions">
                <Button
                  loading={loadingKey === "parse"}
                  disabled={!configured || taskText.trim().length < 2}
                  onClick={() => void runParseTask()}
                >
                  <BrainCircuit aria-hidden="true" />
                  解析草稿
                </Button>
                {draft ? (
                  <Button variant="ghost" onClick={() => setDraft(null)}>
                    取消草稿
                  </Button>
                ) : null}
              </div>
              {draft ? (
                <DraftPreview
                  draft={draft}
                  tags={tags}
                  matchedTagIds={matchedTagIds}
                  confirming={loadingKey === "confirm"}
                  onConfirm={() => void confirmDraft()}
                />
              ) : null}
            </div>
          </Card>

          <Card
            className="ai-card--wide"
            title="任务总结"
            description="生成今日或本周的完成情况、洞察和下一步重点。"
            actions={
              <div className="ai-summary-actions">
                <Select
                  label="总结范围"
                  value={summaryRange}
                  onChange={(event) => setSummaryRange(event.target.value as "today" | "week")}
                >
                  <option value="today">今日</option>
                  <option value="week">本周</option>
                </Select>
                <Button
                  variant="secondary"
                  loading={loadingKey === "summary"}
                  disabled={!configured}
                  onClick={() => void runSummary()}
                >
                  <FileText aria-hidden="true" />
                  生成总结
                </Button>
              </div>
            }
          >
            {summary ? <SummaryView summary={summary} /> : <InlineEmpty text="还没有生成任务总结。" />}
          </Card>
        </div>
      ) : null}
    </>
  );
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="ai-status-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InlineEmpty({ text }: { text: string }) {
  return <p className="muted-text">{text}</p>;
}

function TodayPlanView({ plan }: { plan: AiTodayPlan }) {
  return (
    <div className="ai-result-stack">
      <p className="ai-overview">{plan.overview}</p>
      <div className="ai-task-list">
        {plan.recommendedTasks.length === 0 ? <InlineEmpty text="暂无推荐任务。" /> : null}
        {plan.recommendedTasks.map((task) => (
          <div className="ai-result-row" key={`${task.taskId}-${task.title}`}>
            <div>
              <div className="ai-row-title">
                <strong>{task.title}</strong>
                <Badge tone={riskTone(task.riskLevel)}>{riskLabels[task.riskLevel]}</Badge>
              </div>
              <p>{task.priorityReason}</p>
              <span>{task.actionSuggestion}</span>
            </div>
            <time>{task.suggestedTimeRange}</time>
          </div>
        ))}
      </div>
      {plan.warnings.length > 0 ? (
        <div className="ai-warning-list">
          {plan.warnings.map((warning) => (
            <div className="ai-warning-row" key={`${warning.type}-${warning.message}`}>
              <AlertTriangle aria-hidden="true" />
              <span>{warning.message}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="ai-tip">
        <CheckCircle2 aria-hidden="true" />
        <span>{plan.productivityTip}</span>
      </div>
    </div>
  );
}

function ConflictAdviceView({ advice }: { advice: AiConflictAdvice }) {
  if (advice.conflictCount === 0) {
    return (
      <div className="ai-tip">
        <CheckCircle2 aria-hidden="true" />
        <span>当前未检测到时间冲突。</span>
      </div>
    );
  }

  return (
    <div className="ai-result-stack">
      <div className="ai-count-line">
        <strong>{advice.conflictCount}</strong>
        <span>个时间冲突需要确认</span>
      </div>
      {advice.conflicts.map((conflict) => (
        <div className="ai-result-row" key={conflict.taskIds.join("-")}>
          <div>
            <div className="ai-row-title">
              <strong>{conflict.conflictTimeRange}</strong>
              <Badge tone="warning">{conflict.taskIds.length} 个任务</Badge>
            </div>
            <p>{conflict.explanation}</p>
            <span>{conflict.adjustmentSuggestion}</span>
            <small>{conflict.priorityRecommendation}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function DraftPreview({
  draft,
  tags,
  matchedTagIds,
  confirming,
  onConfirm,
}: {
  draft: AiTaskDraft;
  tags: Tag[];
  matchedTagIds: string[];
  confirming: boolean;
  onConfirm: () => void;
}) {
  const matchedTags = tags.filter((tag) => matchedTagIds.includes(tag.id));
  const missingTags = draft.suggestedTags.filter((name) => !matchedTags.some((tag) => tag.name === name));

  return (
    <div className="ai-draft-preview">
      <div className="ai-row-title">
        <strong>{draft.title}</strong>
        <Badge tone="primary">置信度 {Math.round(draft.confidence * 100)}%</Badge>
      </div>
      {draft.description ? <p>{draft.description}</p> : null}
      <dl className="ai-detail-grid">
        <div>
          <dt>开始时间</dt>
          <dd>{formatDateTime(draft.startTime)}</dd>
        </div>
        <div>
          <dt>结束时间</dt>
          <dd>{formatDateTime(draft.endTime)}</dd>
        </div>
        <div>
          <dt>截止时间</dt>
          <dd>{formatDateTime(draft.dueTime)}</dd>
        </div>
        <div>
          <dt>优先状态</dt>
          <dd>
            重要 {importanceLabels[draft.importance]} / 紧急 {urgencyLabels[draft.urgency]} /{" "}
            {statusLabels[draft.status]}
          </dd>
        </div>
      </dl>
      {matchedTags.length > 0 ? (
        <div className="ai-tag-row">
          {matchedTags.map((tag) => (
            <TagPill key={tag.id} color={tag.color} name={tag.name} />
          ))}
        </div>
      ) : null}
      {missingTags.length > 0 ? <p className="muted-text">未存在的建议标签：{missingTags.join("、")}。不会自动创建。</p> : null}
      {draft.clarifyingQuestions.length > 0 ? (
        <div className="ai-warning-list">
          {draft.clarifyingQuestions.map((question) => (
            <div className="ai-warning-row" key={question}>
              <AlertTriangle aria-hidden="true" />
              <span>{question}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="ai-actions">
        <Button loading={confirming} onClick={onConfirm}>
          确认创建日程
        </Button>
      </div>
    </div>
  );
}

function SummaryView({ summary }: { summary: AiSummary }) {
  return (
    <div className="ai-result-stack">
      <div className="ai-summary-grid">
        <StatusMetric label="已完成" value={String(summary.completedCount)} />
        <StatusMetric label="未完成" value={String(summary.pendingCount)} />
        <StatusMetric label="已逾期" value={String(summary.overdueCount)} />
        <StatusMetric label="高优先级" value={String(summary.highPriorityCount)} />
      </div>
      <p className="ai-overview">{summary.summary}</p>
      <div className="ai-two-column">
        <ListBlock title="标签洞察" items={summary.tagInsights} empty="暂无标签洞察。" />
        <ListBlock title="调整建议" items={summary.suggestions} empty="暂无调整建议。" />
      </div>
      <div className="ai-tip">
        <Clock3 aria-hidden="true" />
        <span>{summary.nextFocus}</span>
      </div>
    </div>
  );
}

function ListBlock({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return (
    <div className="ai-list-block">
      <strong>{title}</strong>
      {items.length === 0 ? <p className="muted-text">{empty}</p> : null}
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
