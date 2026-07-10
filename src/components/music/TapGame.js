"use client";

import { useEffect, useRef, useState } from "react";
import { getAudioContext, Player } from "@/lib/music/engine";
import { drumGroove } from "@/lib/music/songs";

const TEMPOS = [80, 100, 120];

function rate(offsetMs) {
  const abs = Math.abs(offsetMs);
  if (abs <= 80) return { label: "🎯 Right on!", cls: "tap-perfect", good: true };
  if (abs <= 150) return { label: "👍 Close", cls: "tap-good", good: true };
  return {
    label: offsetMs < 0 ? "😅 A bit early" : "😅 A bit late",
    cls: "tap-off",
    good: false,
  };
}

export default function TapGame() {
  const playerRef = useRef(null);
  const timingRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [beat, setBeat] = useState(-1);
  const [lastHit, setLastHit] = useState(null);
  const [stats, setStats] = useState({ taps: 0, good: 0, streak: 0, best: 0 });

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => {
      setPlaying(false);
      setBeat(-1);
    };
    return () => playerRef.current.stop();
  }, []);

  const toggle = () => {
    if (playing) {
      playerRef.current.stop();
      return;
    }
    setLastHit(null);
    setStats({ taps: 0, good: 0, streak: 0, best: 0 });
    timingRef.current = playerRef.current.play(drumGroove(2), {
      bpm,
      loop: true,
      beats: 8,
      onBeat: (b) => setBeat(b % 4),
    });
    setPlaying(true);
  };

  const tap = () => {
    if (!playing || !timingRef.current) return;
    const ac = getAudioContext();
    const { startAt, spb } = timingRef.current;
    // Small allowance for audio output + touch latency.
    const now = ac.currentTime - 0.04;
    const beatsIn = (now - startAt) / spb;
    const nearest = Math.round(beatsIn);
    const offsetMs = (beatsIn - nearest) * spb * 1000;
    const r = rate(offsetMs);
    setLastHit({ ...r, offsetMs: Math.round(offsetMs) });
    setStats((s) => {
      const streak = r.good ? s.streak + 1 : 0;
      return {
        taps: s.taps + 1,
        good: s.good + (r.good ? 1 : 0),
        streak,
        best: Math.max(s.best, streak),
      };
    });
  };

  return (
    <section className="concept-card">
      <header className="concept-card-header">
        <span className="concept-card-emoji">🥁</span>
        <div>
          <h2>Tap the Beat</h2>
          <p className="concept-card-tagline">
            Practice finding the beat — the #1 skill for feeling music.
          </p>
        </div>
      </header>

      <p>
        Start the drums, listen for a moment to feel the pulse, then tap the
        big button <strong>on every beat</strong> (with the thump of the kick
        drum). You&apos;ll get instant feedback on whether you&apos;re early, late, or
        right on it.
      </p>

      <div className="demo-controls">
        <button className={`btn ${playing ? "btn-ghost" : "btn-primary"}`} onClick={toggle}>
          {playing ? "⏹ Stop" : "▶ Start the drums"}
        </button>
        <div className="tempo-picker">
          {TEMPOS.map((t) => (
            <button
              key={t}
              className={`bucket-filter-tab ${bpm === t ? "active" : ""}`}
              disabled={playing}
              onClick={() => setBpm(t)}
            >
              {t === 80 ? "🐢" : t === 100 ? "🚶" : "🏃"} {t} BPM
            </button>
          ))}
        </div>
      </div>

      <div className="beat-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((b) => (
          <div
            key={b}
            className={`beat-dot ${beat === b ? "beat-dot-active" : ""} ${b === 0 ? "beat-dot-one" : ""}`}
          >
            {b + 1}
          </div>
        ))}
      </div>

      <button className="tap-pad" onPointerDown={tap} disabled={!playing}>
        {playing ? "TAP" : "▶ start the drums first"}
      </button>

      {lastHit && (
        <div className={`tap-feedback ${lastHit.cls}`}>
          {lastHit.label}{" "}
          <span className="tap-ms">
            ({lastHit.offsetMs > 0 ? "+" : ""}
            {lastHit.offsetMs} ms)
          </span>
        </div>
      )}

      {stats.taps > 0 && (
        <div className="tap-stats">
          <span>
            On the beat: <strong>{stats.good}/{stats.taps}</strong>
          </span>
          <span>
            Streak: <strong>{stats.streak}</strong>
          </span>
          <span>
            Best streak: <strong>{stats.best}</strong>
          </span>
        </div>
      )}

      <p className="demo-hint">
        Tip: don&apos;t watch the circles — close your eyes and <em>feel</em> the
        pulse. Start at 🐢 80 BPM and work up.
      </p>
    </section>
  );
}
