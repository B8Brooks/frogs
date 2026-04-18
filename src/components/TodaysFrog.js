"use client";

import FrogSize from "./FrogSize";

const ENCOURAGEMENTS = [
  "You've got this! One bite at a time. 💪",
  "Brave choice! This frog doesn't stand a chance.",
  "Locked in. Let's eat this thing.",
  "Big or small, this frog is getting EATEN today.",
  "Deep breath. Then go. 🐸",
];

function pickEncouragement(id) {
  if (!id) return ENCOURAGEMENTS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ENCOURAGEMENTS[hash % ENCOURAGEMENTS.length];
}

export default function TodaysFrog({ frog, onEat }) {
  if (!frog) {
    return (
      <section className="todays-frog todays-frog-empty">
        <div className="todays-frog-label">Today's Frog</div>
        <p className="todays-frog-empty-text">
          A new day, a new frog! Pick one from the pond and let's get after it. 🐸
        </p>
      </section>
    );
  }

  return (
    <section className="todays-frog">
      <div className="todays-frog-label">Today's Frog</div>
      <h2 className="todays-frog-title">{frog.title}</h2>
      {frog.description && (
        <p className="todays-frog-desc">{frog.description}</p>
      )}
      <div className="todays-frog-meta">
        <FrogSize size={frog.size} />
        {frog.recurrence && (
          <span className="recurrence-tag recurrence-tag-light">
            🔁 {frog.recurrence}
          </span>
        )}
        {frog.bucket && (
          <span
            className="bucket-tag"
            style={{ backgroundColor: frog.bucket.color }}
          >
            {frog.bucket.name}
          </span>
        )}
      </div>
      <p className="todays-frog-encouragement">{pickEncouragement(frog.id)}</p>
      <button className="btn btn-primary btn-large" onClick={() => onEat(frog)}>
        Eat This Frog! 🐸
      </button>
    </section>
  );
}
