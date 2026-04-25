"use client";

import { useState } from "react";
import FrogSize from "./FrogSize";

export default function FrogCard({
  frog,
  buckets,
  onSetToday,
  onEat,
  onUneat,
  onDelete,
  onPatch,
  onMoveUp,
  onMoveDown,
  showReorder,
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(frog.title);
  const [editDesc, setEditDesc] = useState(frog.description || "");
  const [editSize, setEditSize] = useState(frog.size);
  const [editBucketId, setEditBucketId] = useState(frog.bucketId || "");
  const [editRecurrence, setEditRecurrence] = useState(frog.recurrence || "");
  const [saving, setSaving] = useState(false);

  const completed = frog.completed;
  const postponed = frog.postponed;

  function startEdit() {
    setEditTitle(frog.title);
    setEditDesc(frog.description || "");
    setEditSize(frog.size);
    setEditBucketId(frog.bucketId || "");
    setEditRecurrence(frog.recurrence || "");
    setEditing(true);
  }

  async function handleSave() {
    if (!editTitle.trim() || saving) return;
    setSaving(true);
    try {
      await onPatch(frog, {
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        size: editSize,
        bucketId: editBucketId || null,
        recurrence: editRecurrence || null,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <article className="frog-card frog-card-editing">
        <div className="frog-card-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="frog-edit-input"
            placeholder="Frog title"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="frog-edit-input"
            placeholder="Notes (optional)"
            rows={2}
          />
          <div className="frog-edit-row">
            <label className="frog-edit-label">
              Size
              <select
                value={editSize}
                onChange={(e) => setEditSize(Number(e.target.value))}
                className="frog-edit-select"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {"🐸".repeat(n)}
                  </option>
                ))}
              </select>
            </label>
            <label className="frog-edit-label">
              Bucket
              <select
                value={editBucketId}
                onChange={(e) => setEditBucketId(e.target.value)}
                className="frog-edit-select"
              >
                <option value="">None</option>
                {(buckets || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="frog-edit-label">
              Recurring
              <select
                value={editRecurrence}
                onChange={(e) => setEditRecurrence(e.target.value)}
                className="frog-edit-select"
              >
                <option value="">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
          </div>
          <div className="frog-card-actions">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving || !editTitle.trim()}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => setEditing(false)}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`frog-card ${completed ? "frog-card-eaten" : ""} ${postponed ? "frog-card-postponed" : ""}`}
    >
      <div className="frog-card-main">
        <div className="frog-card-header">
          <h3 className="frog-card-title">{frog.title}</h3>
          <div className="frog-card-tags">
            {frog.recurrence && (
              <span
                className="recurrence-tag"
                title={`Recurs ${frog.recurrence}`}
              >
                🔁 {frog.recurrence}
              </span>
            )}
            {postponed && <span className="postponed-tag">⏸ Postponed</span>}
            {frog.bucket && (
              <span
                className="bucket-tag"
                style={{ backgroundColor: frog.bucket.color }}
              >
                {frog.bucket.name}
              </span>
            )}
          </div>
        </div>
        {frog.description && (
          <p className="frog-card-desc">{frog.description}</p>
        )}
        <FrogSize size={frog.size} />
        {completed && frog.completedAt && (
          <div className="frog-card-eaten-at">
            Eaten {new Date(frog.completedAt).toLocaleDateString()} ✅
          </div>
        )}
      </div>
      <div className="frog-card-actions">
        {showReorder && !completed && !postponed && (
          <>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => onMoveUp?.(frog)}
              title="Move up"
            >
              ▲
            </button>
            <button
              className="btn btn-ghost btn-icon"
              onClick={() => onMoveDown?.(frog)}
              title="Move down"
            >
              ▼
            </button>
          </>
        )}
        {!completed && !postponed && !frog.isTodaysFrog && (
          <button
            className="btn btn-secondary"
            onClick={() => onSetToday(frog)}
          >
            Today's Frog
          </button>
        )}
        {!completed && !postponed && (
          <button className="btn btn-primary" onClick={() => onEat(frog)}>
            Eat
          </button>
        )}
        {!completed && !postponed && (
          <button
            className="btn btn-ghost"
            onClick={() => onPatch(frog, { postponed: true })}
          >
            ⏸ Postpone
          </button>
        )}
        {postponed && (
          <button
            className="btn btn-secondary"
            onClick={() => onPatch(frog, { postponed: false })}
          >
            Reactivate
          </button>
        )}
        {completed && (
          <button className="btn btn-ghost" onClick={() => onUneat(frog)}>
            Un-eat
          </button>
        )}
        {!completed && (
          <button className="btn btn-ghost" onClick={() => startEdit()}>
            ✏️ Edit
          </button>
        )}
        <button className="btn btn-danger-ghost" onClick={() => onDelete(frog)}>
          Delete
        </button>
      </div>
    </article>
  );
}
