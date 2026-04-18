"use client";

export default function Toast({ message, kind = "info" }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${kind}`} role="status">
      {message}
    </div>
  );
}
