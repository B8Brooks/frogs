"use client";

export default function ConceptCard({ emoji, title, tagline, children, realSongs }) {
  return (
    <section className="concept-card">
      <header className="concept-card-header">
        <span className="concept-card-emoji">{emoji}</span>
        <div>
          <h2>{title}</h2>
          <p className="concept-card-tagline">{tagline}</p>
        </div>
      </header>
      {children}
      {realSongs && (
        <div className="real-songs">
          <span className="real-songs-label">🎧 Hear it in real songs:</span>
          <ul>
            {realSongs.map((s) => (
              <li key={s.song}>
                <strong>{s.song}</strong> — {s.tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
