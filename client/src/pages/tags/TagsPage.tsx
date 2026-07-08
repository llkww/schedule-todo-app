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
      setError(requestError instanceof Error ? requestError.message : "Failed to load tags");
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
      setFormError("Tag name is required");
      return;
    }
    if (!/^#[0-9a-fA-F]{6}$/.test(values.color)) {
      setFormError("Use a valid hex color");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await updateTag(editing.id, { name: values.name.trim(), color: values.color });
        toast.success("Tag updated");
      } else {
        await createTag({ name: values.name.trim(), color: values.color });
        toast.success("Tag created");
      }
      resetForm();
      await load();
    } catch (requestError) {
      setFormError(requestError instanceof Error ? requestError.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await deleteTag(deleteTarget.id);
      toast.success("Tag deleted");
      setDeleteTarget(null);
      await load();
    } catch (requestError) {
      toast.error(requestError instanceof Error ? requestError.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Tags"
        description="Maintain a calm tag system for filtering schedules and scanning context."
      />
      <div className="tag-page-grid">
        <Card title={editing ? "Edit tag" : "New tag"} description="Names are unique within your account.">
          <form className="form-stack" onSubmit={handleSubmit} noValidate>
            {formError ? <div className="form-alert">{formError}</div> : null}
            <Input
              label="Tag name"
              name="name"
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              label="Custom color"
              name="color"
              value={values.color}
              onChange={(event) => setValues((current) => ({ ...current, color: event.target.value }))}
              required
            />
            <div className="color-swatches" aria-label="Preset tag colors">
              {colorOptions.map((color) => (
                <button
                  aria-label={`Use color ${color}`}
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
                  Cancel
                </Button>
              ) : null}
              <Button type="submit" loading={saving} icon={<Plus aria-hidden="true" />}>
                {editing ? "Save tag" : "Create tag"}
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Tag library" description="Each tag shows its current schedule usage.">
          {loading ? <SkeletonList rows={3} /> : null}
          {!loading && error ? (
            <EmptyState title="Tags could not load" description={error} action={<Button onClick={() => void load()}>Retry</Button>} />
          ) : null}
          {!loading && !error && tags.length === 0 ? (
            <EmptyState title="No tags yet" description="Create your first tag to group schedules." />
          ) : null}
          {!loading && !error && tags.length > 0 ? (
            <div className="tag-list">
              {tags.map((tag) => (
                <div className="tag-row" key={tag.id}>
                  <TagPill color={tag.color} name={tag.name} />
                  <span>{tag.scheduleCount ?? 0} schedules</span>
                  <div className="tag-row__actions">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(tag)}>
                      <Edit3 aria-hidden="true" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tag)}>
                      <Trash2 aria-hidden="true" />
                      Delete
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
        title="Delete tag"
        description={`Delete "${deleteTarget?.name ?? "this tag"}"? Existing schedules will keep their other data.`}
        confirmLabel="Delete"
        loading={saving}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
