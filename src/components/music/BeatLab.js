"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@/lib/music/engine";
import { pulseEvents } from "@/lib/music/songs";
import ConceptCard from "./ConceptCard";

export default function BeatLab() {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(90);
  const [currentBeat, setCurrentBeat] = useState(-1);

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => {
      setPlaying(false);
      setCurrentBeat(-1);
    };
    return () => playerRef.current.stop();
  }, []);

  const start = (tempo) => {
    playerRef.current.play(pulseEvents(1), {
      bpm: tempo,
      loop: true,
      beats: 4,
      onBeat: (b) => setCurrentBeat(b),
    });
    setPlaying(true);
  };

  const toggle = () => {
    if (playing) playerRef.current.stop();
    else start(bpm);
  };

  // Restart with the new tempo shortly after the slider settles.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (playerRef.current.isPlaying()) start(bpm);
    }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  return (
    <ConceptCard
      emoji="💓"
      title="The Beat"
      tagline="The steady pulse of a song — like its heartbeat."
      realSongs={[
        {
          song: "We Will Rock You — Queen",
          tip: "the stomp-stomp-CLAP is the beat, played with feet and hands",
        },
        {
          song: "Billie Jean — Michael Jackson",
          tip: "the drums lay down a beat so steady you can set a clock to it",
        },
        {
          song: "Any song at a concert",
          tip: "when the crowd claps or nods together, they've all found the beat",
        },
      ]}
    >
      <p>
        The <strong>beat</strong> is the steady, evenly-spaced pulse you nod
        your head or tap your foot to. It usually repeats in groups of{" "}
        <strong>4</strong> — musicians count <em>“1, 2, 3, 4, 1, 2, 3, 4…”</em>{" "}
        over and over. Beat 1 (the <strong>downbeat</strong>) feels the
        strongest, like the start of each little cycle.
      </p>
      <p>
        How fast the beat goes is the <strong>tempo</strong>, measured in{" "}
        <strong>BPM</strong> (beats per minute). 60 BPM is one beat every
        second — a slow ballad. 120+ BPM gets people dancing.
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
          {playing ? "⏹ Stop" : "▶ Play the beat"}
        </button>
        <label className="tempo-slider">
          <span>
            Tempo: <strong>{bpm} BPM</strong>
          </span>
          <input
            type="range"
            min="60"
            max="160"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="demo-hint">
        Count out loud with the circles: “1, 2, 3, 4.” Then try the slider —
        same beat, different tempo.
      </p>
    </ConceptCard>
  );
}
