"use client";

import { useState } from "react";
import FrogCard from "./FrogCard";

export default function FrogList({
  frogs,
  buckets,
  onSetToday,
  onEat,
  onUneat,
  onDelete,
  onPatch,
  onReorder,
}) {
  const [eatenOpen, setEatenOpen] = useState(false);
  const [postponedOpen, setPostponedOpen] = useState(true);

  const pond = frogs.filter((f) => !f.completed && !f.isTodaysFrog && !f.postponed);
  const postponed = frogs.filter((f) => !f.completed && f.postponed);
  const eaten = frogs.filter((f) => f.completed);

  function handleMoveUp(frog) {
    const idx = pond.findIndex((f) => f.id === frog.id);
    if (idx <= 0) return;
    const newOrder = [...pond];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    onReorder(newOrder.map((f) => f.id));
  }

  function handleMoveDown(frog) {
    const idx = pond.findIndex((f) => f.id === frog.id);
    if (idx < 0 || idx >= pond.length - 1) return;
    const newOrder = [...pond];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    onReorder(newOrder.map((f) => f.id));
  }

  return (
    <div className="frog-list">
      {/* Active pond */}
      <section className="frog-list-section">
        <h3 className="frog-list-heading">
          The Pond <span className="frog-list-count">({pond.length})</span>
        </h3>
        {pond.length === 0 ? (
          <p className="frog-list-empty">
            {eaten.length > 0
              ? "Your pond is empty! Take a victory lap 🏆"
              : postponed.length > 0
                ? "All your frogs are postponed. Reactivate one to get started!"
                : "Your pond is empty! Add a frog to get started."}
          </p>
        ) : (
          <div className="frog-list-items">
            {pond.map((frog) => (
              <FrogCard
                key={frog.id}
                frog={frog}
                buckets={buckets}
                onSetToday={onSetToday}
                onEat={onEat}
                onUneat={onUneat}
                onDelete={onDelete}
                onPatch={onPatch}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                showReorder={pond.length > 1}
              />
            ))}
          </div>
        )}
      </section>

      {/* Postponed */}
      {postponed.length > 0 && (
        <section className="frog-list-section">
          <button
            className="frog-list-toggle"
            onClick={() => setPostponedOpen((v) => !v)}
            aria-expanded={postponedOpen}
          >
            <span>
              Postponed{" "}
              <span className="frog-list-count">({postponed.length})</span> ⏸
            </span>
            <span className="frog-list-toggle-icon">
              {postponedOpen ? "▾" : "▸"}
            </span>
          </button>
          {postponedOpen && (
            <div className="frog-list-items">
              {postponed.map((frog) => (
                <FrogCard
                  key={frog.id}
                  frog={frog}
                  buckets={buckets}
                  onSetToday={onSetToday}
                  onEat={onEat}
                  onUneat={onUneat}
                  onDelete={onDelete}
                  onPatch={onPatch}
                  showReorder={false}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Eaten */}
      {eaten.length > 0 && (
        <section className="frog-list-section">
          <button
            className="frog-list-toggle"
            onClick={() => setEatenOpen((v) => !v)}
            aria-expanded={eatenOpen}
          >
            <span>
              Eaten <span className="frog-list-count">({eaten.length})</span> ✅
            </span>
            <span className="frog-list-toggle-icon">
              {eatenOpen ? "▾" : "▸"}
            </span>
          </button>
          {eatenOpen && (
            <div className="frog-list-items">
              {eaten.map((frog) => (
                <FrogCard
                  key={frog.id}
                  frog={frog}
                  buckets={buckets}
                  onSetToday={onSetToday}
                  onEat={onEat}
                  onUneat={onUneat}
                  onDelete={onDelete}
                  onPatch={onPatch}
                  showReorder={false}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
