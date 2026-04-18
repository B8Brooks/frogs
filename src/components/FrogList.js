"use client";

import { useState } from "react";
import FrogCard from "./FrogCard";

export default function FrogList({ frogs, onSetToday, onEat, onUneat, onDelete }) {
  const [eatenOpen, setEatenOpen] = useState(false);

  const pond = frogs.filter((f) => !f.completed && !f.isTodaysFrog);
  const eaten = frogs.filter((f) => f.completed);

  return (
    <div className="frog-list">
      <section className="frog-list-section">
        <h3 className="frog-list-heading">
          The Pond <span className="frog-list-count">({pond.length})</span>
        </h3>
        {pond.length === 0 ? (
          <p className="frog-list-empty">
            Your pond is empty! {eaten.length > 0 ? "Take a victory lap 🏆" : "Add a frog to get started."}
          </p>
        ) : (
          <div className="frog-list-items">
            {pond.map((frog) => (
              <FrogCard
                key={frog.id}
                frog={frog}
                onSetToday={onSetToday}
                onEat={onEat}
                onUneat={onUneat}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>

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
                  onSetToday={onSetToday}
                  onEat={onEat}
                  onUneat={onUneat}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
