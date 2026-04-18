"use client";

import { useEffect, useRef, useState } from "react";

export default function FrogForm({ buckets, onCreate, onCreateBucket, onBucketsChanged }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [size, setSize] = useState(3);
  const [bucketId, setBucketId] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [aiReason, setAiReason] = useState("");
  const [estimating, setEstimating] = useState(false);
  const [sizeOverridden, setSizeOverridden] = useState(false);
  const [bucketOverridden, setBucketOverridden] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newBucketOpen, setNewBucketOpen] = useState(false);
  const [newBucketName, setNewBucketName] = useState("");

  const debounceRef = useRef(null);
  const estimatedForRef = useRef("");

  useEffect(() => {
    if (!title.trim()) {
      setAiReason("");
      estimatedForRef.current = "";
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const key = `${title.trim()}|${description.trim()}`;
      if (estimatedForRef.current === key) return;
      estimatedForRef.current = key;

      setEstimating(true);
      try {
        const res = await fetch("/api/frogs/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: title.trim(), description: description.trim() }),
        });
        if (res.ok) {
          const data = await res.json();
          if (!sizeOverridden) {
            setSize(data.size);
          }
          setAiReason(data.reason || "");
          if (!bucketOverridden && data.bucket) {
            setBucketId(data.bucket.id);
            if (onBucketsChanged) onBucketsChanged();
          }
        }
      } catch {
        // ignore — size stays at current default
      } finally {
        setEstimating(false);
      }
    }, 700);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [title, description, sizeOverridden, bucketOverridden, onBucketsChanged]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || null,
        size,
        bucketId: bucketId || null,
        recurrence: recurrence || null,
      });
      setTitle("");
      setDescription("");
      setSize(3);
      setBucketId("");
      setRecurrence("");
      setAiReason("");
      setSizeOverridden(false);
      setBucketOverridden(false);
      estimatedForRef.current = "";
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateBucket() {
    const name = newBucketName.trim();
    if (!name) return;
    const bucket = await onCreateBucket(name);
    if (bucket) {
      setBucketId(bucket.id);
      setNewBucketName("");
      setNewBucketOpen(false);
    }
  }

  return (
    <form className="frog-form" onSubmit={handleSubmit}>
      <h3 className="frog-form-title">Toss a new frog into the pond 🐸</h3>

      <label className="frog-form-field">
        <span>What's the frog?</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., File taxes"
          required
        />
      </label>

      <label className="frog-form-field">
        <span>Notes (optional)</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Any context or details..."
          rows={2}
        />
      </label>

      <div className="frog-form-field">
        <span>
          Size {estimating && <em className="frog-form-hint">(thinking...)</em>}
        </span>
        <div className="size-picker">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              type="button"
              key={n}
              className={`size-picker-btn ${size === n ? "active" : ""}`}
              onClick={() => {
                setSize(n);
                setSizeOverridden(true);
              }}
              aria-label={`Size ${n}`}
            >
              {"🐸".repeat(n)}
            </button>
          ))}
        </div>
        {aiReason && (
          <p className="frog-form-ai-reason">🤖 {aiReason}</p>
        )}
      </div>

      <div className="frog-form-field">
        <span>
          Bucket {estimating && <em className="frog-form-hint">(auto-picking...)</em>}
        </span>
        <div className="bucket-select-row">
          <select
            value={bucketId}
            onChange={(e) => {
              setBucketId(e.target.value);
              setBucketOverridden(true);
            }}
          >
            <option value="">— No bucket —</option>
            {buckets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setNewBucketOpen((v) => !v)}
          >
            {newBucketOpen ? "Cancel" : "+ New bucket"}
          </button>
        </div>
        {newBucketOpen && (
          <div className="new-bucket-row">
            <input
              type="text"
              value={newBucketName}
              onChange={(e) => setNewBucketName(e.target.value)}
              placeholder="e.g., Home Errands"
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCreateBucket}
            >
              Add
            </button>
          </div>
        )}
      </div>

      <label className="frog-form-field">
        <span>Recurring? 🔁</span>
        <select
          value={recurrence}
          onChange={(e) => setRecurrence(e.target.value)}
        >
          <option value="">No — one-time frog</option>
          <option value="daily">Daily — returns each morning</option>
          <option value="weekly">Weekly — returns every Friday</option>
          <option value="monthly">Monthly — returns on the 1st</option>
        </select>
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitting || !title.trim()}
      >
        {submitting ? "Hopping in..." : "Add to Pond"}
      </button>
    </form>
  );
}
