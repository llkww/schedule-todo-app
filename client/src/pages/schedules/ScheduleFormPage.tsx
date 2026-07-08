import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input, Select, Textarea } from "../../components/ui/Field";
import { LoadingSpinner } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { TagPill } from "../../components/ui/TagPill";
import type { Importance, ScheduleStatus, Tag, Urgency } from "../../types/domain";
import {
  createSchedule,
  fetchSchedule,
  fetchTags,
  updateSchedule,
  type SchedulePayload,
} from "../../services/schedules";
import { toDateTimeInput } from "../../utils/date";

type FormValues = {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  dueTime: string;
  importance: Importance;
  urgency: Urgency;
  status: ScheduleStatus;
  tagIds: string[];
};

const emptyValues: FormValues = {
  title: "",
  description: "",
  startTime: "",
  endTime: "",
  dueTime: "",
  importance: "medium",
  urgency: "medium",
  status: "pending",
  tagIds: [],
};

type FormErrors = Partial<Record<keyof FormValues | "form", string>>;

export function ScheduleFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedTags = useMemo(
    () => tags.filter((tag) => values.tagIds.includes(tag.id)),
    [tags, values.tagIds],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const tagData = await fetchTags();
      setTags(tagData);
      if (id) {
        const schedule = await fetchSchedule(id);
        setValues({
          title: schedule.title,
          description: schedule.description,
          startTime: toDateTimeInput(schedule.startTime),
          endTime: toDateTimeInput(schedule.endTime),
          dueTime: toDateTimeInput(schedule.dueTime),
          importance: schedule.importance,
          urgency: schedule.urgency,
          status: schedule.status,
          tagIds: schedule.tags.map((tag) => tag.id),
        });
      }
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "表单加载失败" });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleTag(tagId: string) {
    setValues((current) => ({
      ...current,
      tagIds: current.tagIds.includes(tagId)
        ? current.tagIds.filter((idValue) => idValue !== tagId)
        : [...current.tagIds, tagId],
    }));
  }

  function validate() {
    const next: FormErrors = {};
    if (!values.title.trim()) next.title = "请输入标题";
    if (values.title.length > 120) next.title = "标题过长";
    if (values.description.length > 2000) next.description = "描述过长";
    if (values.startTime && values.endTime && new Date(values.endTime) < new Date(values.startTime)) {
      next.endTime = "结束时间必须晚于开始时间";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function toPayload(): SchedulePayload {
    return {
      title: values.title.trim(),
      description: values.description.trim(),
      startTime: values.startTime || undefined,
      endTime: values.endTime || undefined,
      dueTime: values.dueTime || undefined,
      importance: values.importance,
      urgency: values.urgency,
      status: values.status,
      completed: values.status === "completed",
      tagIds: values.tagIds,
    };
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setErrors({});
    try {
      const result = id ? await updateSchedule(id, toPayload()) : await createSchedule(toPayload());
      toast.success(id ? "日程已更新" : "日程已创建");
      navigate(`/schedules/${result.id}`);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="正在加载日程表单" />;

  return (
    <>
      <PageHeader
        title={isEditing ? "编辑日程" : "新建日程"}
        description="把要做的事安排下来。"
      />
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <Card title="日程详情">
          {errors.form ? <div className="form-alert">{errors.form}</div> : null}
          <div className="form-stack">
            <Input
              label="标题"
              name="title"
              placeholder="例如：完成课程项目演示稿"
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              error={errors.title}
              required
            />
            <Textarea
              label="描述"
              name="description"
              placeholder="补充一些细节，方便之后查看"
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              error={errors.description}
            />
            <div className="responsive-grid responsive-grid--three">
              <Input
                label="开始时间"
                name="startTime"
                type="datetime-local"
                value={values.startTime}
                onChange={(event) => update("startTime", event.target.value)}
              />
              <Input
                label="结束时间"
                name="endTime"
                type="datetime-local"
                value={values.endTime}
                onChange={(event) => update("endTime", event.target.value)}
                error={errors.endTime}
              />
              <Input
                label="截止时间"
                name="dueTime"
                type="datetime-local"
                value={values.dueTime}
                onChange={(event) => update("dueTime", event.target.value)}
              />
            </div>
            <div className="responsive-grid responsive-grid--three">
              <Select
                label="重要程度"
                name="importance"
                value={values.importance}
                onChange={(event) => update("importance", event.target.value as Importance)}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </Select>
              <Select
                label="紧急程度"
                name="urgency"
                value={values.urgency}
                onChange={(event) => update("urgency", event.target.value as Urgency)}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </Select>
              <Select
                label="状态"
                name="status"
                value={values.status}
                onChange={(event) => update("status", event.target.value as ScheduleStatus)}
              >
                <option value="pending">待处理</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card title="标签" description="给日程加个分类。">
          <div className="tag-selector">
            {tags.length === 0 ? <p className="muted-text">还没有标签，之后再补也可以。</p> : null}
            {tags.map((tag) => (
              <button
                className={values.tagIds.includes(tag.id) ? "tag-option tag-option--selected" : "tag-option"}
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
              >
                <TagPill color={tag.color} name={tag.name} />
              </button>
            ))}
          </div>
          {selectedTags.length > 0 ? (
            <div className="selected-tags" aria-label="已选择的标签">
              {selectedTags.map((tag) => (
                <TagPill key={tag.id} color={tag.color} name={tag.name} />
              ))}
            </div>
          ) : null}
        </Card>

        <div className="form-actions">
          <Link className="button button--secondary" to="/schedules">
            取消
          </Link>
          <Button type="submit" loading={saving} icon={<Save aria-hidden="true" />}>
            保存
          </Button>
        </div>
      </form>
    </>
  );
}
