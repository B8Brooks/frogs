"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@/lib/music/engine";
import ConceptCard from "./ConceptCard";

// Steady kick pulse + a syncopated clap/snare rhythm layered on top.
function rhythmEvents() {
  const events = [];
  for (let bar = 0; bar < 2; bar++) {
    const base = bar * 4;
    for (let b = 0; b < 4; b++) {
      events.push({ beat: base + b, type: "kick", gain: b === 0 ? 0.65 : 0.45, track: "pulse" });
    }
    // The rhythm pattern: long-short-short-long over the steady pulse.
    [0, 1.5, 2, 3, 3.5].forEach((b) => {
      events.push({ beat: base + b, type: "snare", gain: 0.3, track: "rhythm" });
    });
  }
  return events;
}

export default function RhythmLab() {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [rhythmOn, setRhythmOn] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => {
      setPlaying(false);
      setCurrentBeat(-1);
    };
    return () => playerRef.current.stop();
  }, []);

  const toggle = () => {
    if (playing) {
      playerRef.current.stop();
    } else {
      playerRef.current.setTrackOn("rhythm", rhythmOn);
      playerRef.current.play(rhythmEvents(), {
        bpm: 95,
        loop: true,
        beats: 8,
        onBeat: (b) => setCurrentBeat(b % 4),
      });
      setPlaying(true);
    }
  };

  const toggleRhythm = () => {
    const next = !rhythmOn;
    setRhythmOn(next);
    playerRef.current.setTrackOn("rhythm", next);
  };

  return (
    <ConceptCard
      emoji="👏"
      title="Rhythm"
      tagline="The pattern of long and short sounds played on top of the beat."
      realSongs={[
        {
          song: "Shape of You — Ed Sheeran",
          tip: "the beat is steady, but the vocal rhythm dances around it",
        },
        {
          song: "Happy — Pharrell Williams",
          tip: "the claps make a rhythm pattern over the steady pulse",
        },
      ]}
    >
      <p>
        People mix up <strong>beat</strong> and <strong>rhythm</strong>. The
        beat is the steady pulse underneath — it never changes. The{" "}
        <strong>rhythm</strong> is the pattern of longer and shorter sounds
        played <em>on top of</em> that pulse. Clapping along to the words of a
        song? That&apos;s rhythm. Tapping your foot? That&apos;s the beat.
      </p>

      <div className="beat-dots" aria-hidden="true">
        {[0, 1, 2, 3].map((b) => (
          <div
            key={b}
            className={`beat-dot ${currentBeat === b ? "beat-dot-active" : ""} ${
              b === 0 ? "beat-dot-one" : ""
            }`}
          >
            {b + 1}
          </div>
        ))}
      </div>

      <div className="demo-controls">
        <button className={`btn ${playing ? "btn-ghost" : "btn-primary"}`} onClick={toggle}>
          {playing ? "⏹ Stop" : "▶ Play the steady beat"}
        </button>
        <button
          className={`btn ${rhythmOn ? "btn-secondary" : "btn-ghost"}`}
          onClick={toggleRhythm}
        >
          {rhythmOn ? "👏 Rhythm: ON" : "👏 Add a rhythm on top"}
        </button>
      </div>
      <p className="demo-hint">
        Start the beat, then flip the rhythm on and off while it plays. Notice
        the low pulse never changes — only the clap pattern comes and goes.
      </p>
    </ConceptCard>
  );
}
