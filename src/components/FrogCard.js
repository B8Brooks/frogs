"use client";

import FrogSize from "./FrogSize";

export default function FrogCard({ frog, onSetToday, onEat, onUneat, onDelete }) {
  const completed = frog.completed;

  return (
    <article className={`frog-card ${completed ? "frog-card-eaten" : ""}`}>
      <div className="frog-card-main">
        <div className="frog-card-header">
          <h3 className="frog-card-title">{frog.title}</h3>
          {frog.bucket && (
            <span
              className="bucket-tag"
              style={{ backgroundColor: frog.bucket.color }}
            >
              {frog.bucket.name}
            </span>
          )}
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
        {!completed && !frog.isTodaysFrog && (
          <button className="btn btn-secondary" onClick={() => onSetToday(frog)}>
            Set as Today's Frog
          </button>
        )}
        {!completed && (
          <button className="btn btn-primary" onClick={() => onEat(frog)}>
            Eat
          </button>
        )}
        {completed && (
          <button className="btn btn-ghost" onClick={() => onUneat(frog)}>
            Un-eat
          </button>
        )}
        <button className="btn btn-danger-ghost" onClick={() => onDelete(frog)}>
          Delete
        </button>
      </div>
    </article>
  );
}
