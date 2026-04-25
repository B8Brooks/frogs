"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import TodaysFrog from "@/components/TodaysFrog";
import FrogForm from "@/components/FrogForm";
import BucketFilter from "@/components/BucketFilter";
import FrogList from "@/components/FrogList";
import Toast from "@/components/Toast";

const CELEBRATIONS = [
  "YES! That frog is GONE! 🎉",
  "EATEN! One less frog in the pond! 🐸✨",
  "AMAZING! Another frog crossed off. Keep it going!",
  "Look at you GO! 🏆",
  "Frog? What frog? (It's gone.) 🎉",
];

export default function Dashboard() {
  const [frogs, setFrogs] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [selectedBucketId, setSelectedBucketId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "info" });
  const [refreshing, setRefreshing] = useState(false);

  const showToast = useCallback((message, kind = "info") => {
    setToast({ message, kind });
    setTimeout(() => setToast({ message: "", kind: "info" }), 3500);
  }, []);

  async function parseError(res) {
    try {
      const data = await res.json();
      if (data && data.error) return data.error;
    } catch {
      // ignore
    }
    return `Server error (${res.status})`;
  }

  const loadAll = useCallback(async () => {
    const [frogsRes, bucketsRes] = await Promise.all([
      fetch("/api/frogs"),
      fetch("/api/buckets"),
    ]);
    if (frogsRes.ok) {
      const data = await frogsRes.json();
      setFrogs(data.frogs);
    }
    if (bucketsRes.ok) {
      const data = await bucketsRes.json();
      setBuckets(data.buckets);
    }
    setLoading(false);
  }, []);

  const refreshBuckets = useCallback(async () => {
    const res = await fetch("/api/buckets");
    if (res.ok) {
      const data = await res.json();
      setBuckets(data.buckets);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateFrog(frogData) {
    try {
      const res = await fetch("/api/frogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(frogData),
      });
      if (!res.ok) {
        const msg = await parseError(res);
        showToast(`Couldn't save frog: ${msg}`, "error");
        throw new Error(msg);
      }
      const { frog } = await res.json();
      setFrogs((prev) => [frog, ...prev]);
      showToast("Into the pond it goes! 💪");
    } catch (err) {
      if (!err.message?.startsWith("Server error") && !err.message?.includes(":")) {
        showToast("Network error — check your connection and try again.", "error");
      }
      throw err;
    }
  }

  async function handleCreateBucket(name) {
    try {
      const res = await fetch("/api/buckets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const { bucket } = await res.json();
        setBuckets((prev) => [...prev, bucket]);
        showToast(`Bucket "${bucket.name}" created!`);
        return bucket;
      }
      if (res.status === 409) {
        showToast("A bucket with that name already exists", "error");
      } else {
        const msg = await parseError(res);
        showToast(`Couldn't create bucket: ${msg}`, "error");
      }
      return null;
    } catch {
      showToast("Network error — check your connection and try again.", "error");
      return null;
    }
  }

  async function patchFrog(frog, patch) {
    try {
      const res = await fetch(`/api/frogs/${frog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        const msg = await parseError(res);
        showToast(`Couldn't update frog: ${msg}`, "error");
        return null;
      }
      const { frog: updated } = await res.json();
      setFrogs((prev) => {
        if (patch.isTodaysFrog === true) {
          return prev.map((f) =>
            f.id === updated.id ? updated : { ...f, isTodaysFrog: false },
          );
        }
        return prev.map((f) => (f.id === updated.id ? updated : f));
      });
      return updated;
    } catch {
      showToast("Network error — check your connection and try again.", "error");
      return null;
    }
  }

  async function handleSetToday(frog) {
    const updated = await patchFrog(frog, { isTodaysFrog: true });
    if (updated) showToast("Brave choice! This frog doesn't stand a chance. 🐸");
  }

  async function handleEat(frog) {
    const updated = await patchFrog(frog, { completed: true });
    if (updated) {
      const msg = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
      showToast(msg);
    }
  }

  async function handleUneat(frog) {
    const updated = await patchFrog(frog, { completed: false });
    if (updated) showToast("Back in the pond it goes!");
  }

  async function handleRefreshRecurring() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/frogs/refresh-recurring", { method: "POST" });
      if (!res.ok) {
        const msg = await parseError(res);
        showToast(`Couldn't refresh: ${msg}`, "error");
        return;
      }
      const data = await res.json();
      setFrogs(data.frogs);
      if (data.refreshedCount > 0) {
        showToast(
          `${data.refreshedCount} frog${data.refreshedCount === 1 ? "" : "s"} hopped back into the pond! 🐸`,
        );
      } else {
        showToast("No recurring frogs to refresh right now.");
      }
    } catch {
      showToast("Network error — check your connection and try again.", "error");
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete(frog) {
    if (!confirm(`Remove "${frog.title}" from the pond?`)) return;
    try {
      const res = await fetch(`/api/frogs/${frog.id}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await parseError(res);
        showToast(`Couldn't delete: ${msg}`, "error");
        return;
      }
      setFrogs((prev) => prev.filter((f) => f.id !== frog.id));
      showToast("Frog removed.");
    } catch {
      showToast("Network error — check your connection and try again.", "error");
    }
  }

  async function handleReorder(orderedIds) {
    try {
      const res = await fetch("/api/frogs/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds }),
      });
      if (!res.ok) {
        const msg = await parseError(res);
        showToast(`Couldn't reorder: ${msg}`, "error");
        return;
      }
      setFrogs((prev) => {
        const map = new Map(prev.map((f) => [f.id, f]));
        const reordered = orderedIds
          .map((id, i) => {
            const f = map.get(id);
            return f ? { ...f, position: i } : null;
          })
          .filter(Boolean);
        const rest = prev.filter((f) => !orderedIds.includes(f.id));
        return [...reordered, ...rest];
      });
    } catch {
      showToast("Network error — check your connection and try again.", "error");
    }
  }

  function handleExport() {
    window.open("/api/frogs/export", "_blank");
  }

  const todaysFrog = frogs.find((f) => f.isTodaysFrog && !f.completed) || null;

  const filteredFrogs =
    selectedBucketId === "all"
      ? frogs
      : frogs.filter((f) => f.bucketId === selectedBucketId);

  return (
    <>
      <Navbar />
      <main className="main">
        <TodaysFrog frog={todaysFrog} onEat={handleEat} />

        <FrogForm
          buckets={buckets}
          onCreate={handleCreateFrog}
          onCreateBucket={handleCreateBucket}
          onBucketsChanged={refreshBuckets}
        />

        {buckets.length > 0 && (
          <BucketFilter
            buckets={buckets}
            selectedBucketId={selectedBucketId}
            onSelect={setSelectedBucketId}
          />
        )}

        <div className="action-row">
          {frogs.some((f) => f.recurrence) && (
            <button
              className="btn btn-ghost"
              onClick={handleRefreshRecurring}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "🔁 Refresh recurring"}
            </button>
          )}
          {frogs.length > 0 && (
            <button className="btn btn-ghost" onClick={handleExport}>
              📥 Export CSV
            </button>
          )}
        </div>

        {loading ? (
          <p className="main-loading">Loading your pond...</p>
        ) : (
          <FrogList
            frogs={filteredFrogs}
            buckets={buckets}
            onSetToday={handleSetToday}
            onEat={handleEat}
            onUneat={handleUneat}
            onDelete={handleDelete}
            onPatch={patchFrog}
            onReorder={handleReorder}
          />
        )}
      </main>
      <Toast message={toast.message} kind={toast.kind} />
    </>
  );
}
