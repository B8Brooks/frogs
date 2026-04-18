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
  const [toast, setToast] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const showToast = useCallback((message) => {
    setToast(message);
    setTimeout(() => setToast(""), 2500);
  }, []);

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

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleCreateFrog(frogData) {
    const res = await fetch("/api/frogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(frogData),
    });
    if (res.ok) {
      const { frog } = await res.json();
      setFrogs((prev) => [frog, ...prev]);
      showToast("Into the pond it goes! 💪");
    }
  }

  async function handleCreateBucket(name) {
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
      showToast("A bucket with that name already exists");
    }
    return null;
  }

  async function patchFrog(frog, patch) {
    const res = await fetch(`/api/frogs/${frog.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      const { frog: updated } = await res.json();
      setFrogs((prev) => {
        // If we just set today's frog, unset others locally too
        if (patch.isTodaysFrog === true) {
          return prev.map((f) =>
            f.id === updated.id ? updated : { ...f, isTodaysFrog: false },
          );
        }
        return prev.map((f) => (f.id === updated.id ? updated : f));
      });
      return updated;
    }
    return null;
  }

  async function handleSetToday(frog) {
    await patchFrog(frog, { isTodaysFrog: true });
    showToast("Brave choice! This frog doesn't stand a chance. 🐸");
  }

  async function handleEat(frog) {
    await patchFrog(frog, { completed: true });
    const msg = CELEBRATIONS[Math.floor(Math.random() * CELEBRATIONS.length)];
    showToast(msg);
  }

  async function handleUneat(frog) {
    await patchFrog(frog, { completed: false });
    showToast("Back in the pond it goes!");
  }

  async function handleRefreshRecurring() {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const res = await fetch("/api/frogs/refresh-recurring", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setFrogs(data.frogs);
        if (data.refreshedCount > 0) {
          showToast(
            `${data.refreshedCount} frog${data.refreshedCount === 1 ? "" : "s"} hopped back into the pond! 🐸`,
          );
        } else {
          showToast("No recurring frogs to refresh right now.");
        }
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleDelete(frog) {
    if (!confirm(`Remove "${frog.title}" from the pond?`)) return;
    const res = await fetch(`/api/frogs/${frog.id}`, { method: "DELETE" });
    if (res.ok) {
      setFrogs((prev) => prev.filter((f) => f.id !== frog.id));
      showToast("Frog removed.");
    }
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
        />

        {buckets.length > 0 && (
          <BucketFilter
            buckets={buckets}
            selectedBucketId={selectedBucketId}
            onSelect={setSelectedBucketId}
          />
        )}

        {frogs.some((f) => f.recurrence) && (
          <div className="refresh-row">
            <button
              className="btn btn-ghost"
              onClick={handleRefreshRecurring}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "🔁 Refresh recurring frogs"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="main-loading">Loading your pond...</p>
        ) : (
          <FrogList
            frogs={filteredFrogs}
            onSetToday={handleSetToday}
            onEat={handleEat}
            onUneat={handleUneat}
            onDelete={handleDelete}
          />
        )}
      </main>
      <Toast message={toast} />
    </>
  );
}
