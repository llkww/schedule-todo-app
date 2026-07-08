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
      setErrors({ form: error instanceof Error ? error.message : "Failed to load form" });
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
    if (!values.title.trim()) next.title = "Title is required";
    if (values.title.length > 120) next.title = "Title is too long";
    if (values.description.length > 2000) next.description = "Description is too long";
    if (values.startTime && values.endTime && new Date(values.endTime) < new Date(values.startTime)) {
      next.endTime = "End time must be after start time";
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
      toast.success(id ? "Schedule updated" : "Schedule created");
      navigate(`/schedules/${result.id}`);
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading schedule form" />;

  return (
    <>
      <PageHeader
        title={isEditing ? "Edit schedule" : "New schedule"}
        description="Capture the work, then classify it by importance, urgency, and tags."
      />
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <Card title="Schedule details" description="Required fields are marked and validated before save.">
          {errors.form ? <div className="form-alert">{errors.form}</div> : null}
          <div className="form-stack">
            <Input
              label="Title"
              name="title"
              value={values.title}
              onChange={(event) => update("title", event.target.value)}
              error={errors.title}
              required
            />
            <Textarea
              label="Description"
              name="description"
              value={values.description}
              onChange={(event) => update("description", event.target.value)}
              error={errors.description}
            />
            <div className="responsive-grid responsive-grid--three">
              <Input
                label="Start time"
                name="startTime"
                type="datetime-local"
                value={values.startTime}
                onChange={(event) => update("startTime", event.target.value)}
              />
              <Input
                label="End time"
                name="endTime"
                type="datetime-local"
                value={values.endTime}
                onChange={(event) => update("endTime", event.target.value)}
                error={errors.endTime}
              />
              <Input
                label="Due time"
                name="dueTime"
                type="datetime-local"
                value={values.dueTime}
                onChange={(event) => update("dueTime", event.target.value)}
              />
            </div>
            <div className="responsive-grid responsive-grid--three">
              <Select
                label="Importance"
                name="importance"
                value={values.importance}
                onChange={(event) => update("importance", event.target.value as Importance)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <Select
                label="Urgency"
                name="urgency"
                value={values.urgency}
                onChange={(event) => update("urgency", event.target.value as Urgency)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <Select
                label="Status"
                name="status"
                value={values.status}
                onChange={(event) => update("status", event.target.value as ScheduleStatus)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card title="Tags" description="Use tags to group schedules without changing priority.">
          <div className="tag-selector">
            {tags.length === 0 ? <p className="muted-text">No tags yet. You can add them later.</p> : null}
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
            <div className="selected-tags" aria-label="Selected tags">
              {selectedTags.map((tag) => (
                <TagPill key={tag.id} color={tag.color} name={tag.name} />
              ))}
            </div>
          ) : null}
        </Card>

        <div className="form-actions">
          <Link className="button button--secondary" to="/schedules">
            Cancel
          </Link>
          <Button type="submit" loading={saving} icon={<Save aria-hidden="true" />}>
            Save schedule
          </Button>
        </div>
      </form>
    </>
  );
}
