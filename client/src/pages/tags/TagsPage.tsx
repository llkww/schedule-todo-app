import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Input } from "../../components/ui/Field";
import { SkeletonList } from "../../components/ui/Loading";
import { PageHeader } from "../../components/ui/PageHeader";
import { TagPill } from "../../components/ui/TagPill";
import type { Tag } from "../../types/domain";
import { createTag, deleteTag, fetchTags, updateTag } from "../../services/tags";

const colorOptions = ["#4F46E5", "#0F766E", "#B45309", "#DC2626", "#64748B", "#7C3AED"];

export function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Tag | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [values, setValues] = useState({ name: "", color: colorOptions[0] });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setTags(await fetchTags());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "标签加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit(tag: Tag) {
    setEditing(tag);
    setValues({ name: tag.name, color: tag.color });
    setFormError("");
  }

  function resetForm() {
    setEditing(null);
    setValues({ name: "", color: colorOptions[0] });
    setFormError("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name.trim()) {
      setFormError("请输入标签名称");
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) {
      setFormError("请输入有效的十六进制颜色");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateTag(editing.id, { name: values.name.trim(), color: values.color });
        toast.success("标签已更新");
      } else {
        await createTag({ name: values.name.trim(), color: values.color });
        toast.success("标签已创建");
      }
      resetForm();
      await load();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteTag(deleteTarget.id);
      toast.success("标签已删除");
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "删除失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="标签"
        description="维护清晰的标签体系，便于筛选日程和快速理解上下文。"
      />
      <div className="tag-page-grid">
        <Card title={editing ? "编辑标签" : "新建标签"} description="标签名称在你的账号内保持唯一。">
          <form className="form-stack" onSubmit={handleSubmit} noValidate>
            {formError ? <div className="form-alert">{formError}</div> : null}
            <Input
              label="标签名称"
              name="name"
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              label="自定义颜色"
              name="color"
              value={values.color}
              onChange={(event) => setValues((current) => ({ ...current, color: event.target.value }))}
              required
            />
            <div className="color-swatches" aria-label="预设标签颜色">
              {colorOptions.map((color) => (
                <button
                  aria-label={`使用颜色 ${color}`}
                  className={values.color === color ? "color-swatch color-swatch--selected" : "color-swatch"}
                  key={color}
                  onClick={() => setValues((current) => ({ ...current, color }))}
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
            <div className="form-actions">
              {editing ? (
                <Button variant="secondary" type="button" onClick={resetForm}>
                  取消
                </Button>
              ) : null}
              <Button type="submit" loading={saving} icon={<Plus aria-hidden="true" />}>
                {editing ? "保存标签" : "创建标签"}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="标签库" description="每个标签都会显示当前关联的日程数量。">
          {loading ? <SkeletonList rows={3} /> : null}
          {!loading && error ? (
            <EmptyState title="标签无法加载" description={error} action={<Button onClick={() => void load()}>重试</Button>} />
          ) : null}
          {!loading && !error && tags.length === 0 ? (
            <EmptyState title="还没有标签" description="创建第一个标签来归类日程。" />
          ) : null}
          {!loading && !error && tags.length > 0 ? (
            <div className="tag-list">
              {tags.map((tag) => (
                <div className="tag-row" key={tag.id}>
                  <TagPill color={tag.color} name={tag.name} />
                  <span>{tag.scheduleCount ?? 0} 个日程</span>
                  <div className="tag-row__actions">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                      <Edit3 aria-hidden="true" />
                      编辑
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tag)}>
                      <Trash2 aria-hidden="true" />
                      删除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除标签"
        description={`确定删除“${deleteTarget?.name ?? "此标签"}”吗？已有日程会保留其他数据。`}
        confirmLabel="删除"
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
