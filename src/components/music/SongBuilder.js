"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Player } from "@/lib/music/engine";
import { builderSong, BUILDER_PROGRESSION } from "@/lib/music/songs";

const LAYERS = [
  {
    id: "drums",
    emoji: "🥁",
    name: "Drums",
    role: "The beat & rhythm — the steady engine of the song",
  },
  {
    id: "bass",
    emoji: "🎸",
    name: "Bass",
    role: "Deep low notes that glue the beat to the chords",
  },
  {
    id: "chords",
    emoji: "🎹",
    name: "Chords",
    role: "The harmony — a cushion of stacked notes",
  },
  {
    id: "melody",
    emoji: "🎤",
    name: "Melody",
    role: "The tune on top — the part you'd sing",
  },
];

export default function SongBuilder() {
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [layers, setLayers] = useState({
    drums: true,
    bass: true,
    chords: true,
    melody: true,
  });
  const [beat, setBeat] = useState(-1);

  const song = useMemo(() => builderSong(), []);

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
    } else {
      for (const layer of LAYERS) {
        playerRef.current.setTrackOn(layer.id, layers[layer.id]);
      }
      playerRef.current.play(song.events, {
        bpm: song.bpm,
        loop: true,
        beats: song.beats,
        onBeat: (b) => setBeat(b),
      });
      setPlaying(true);
    }
  };

  const toggleLayer = (id) => {
    const next = { ...layers, [id]: !layers[id] };
    setLayers(next);
    playerRef.current.setTrackOn(id, next[id]);
  };

  const bar = beat >= 0 ? Math.floor(beat / 4) : -1;

  return (
    <section className="concept-card">
      <header className="concept-card-header">
        <span className="concept-card-emoji">🎛️</span>
        <div>
          <h2>Song Builder</h2>
          <p className="concept-card-tagline">
            Real songs are layers stacked on top of each other. Pull them apart.
          </p>
        </div>
      </header>

      <p>
        This is an 8-bar loop built like a pop song, using the famous{" "}
        <strong>C – G – Am – F</strong> chord progression — the same four
        chords behind <em>Let It Be</em>, <em>No Woman No Cry</em>,{" "}
        <em>Someone Like You</em>, and dozens more. Hit play, then switch
        layers on and off <strong>while it plays</strong> to train your ear to
        pick out each part.
      </p>

      <div className="builder-transport">
        <button className={`btn btn-large ${playing ? "btn-ghost" : "btn-primary"}`} onClick={toggle}>
          {playing ? "⏹ Stop" : "▶ Play the song"}
        </button>
        <div className="beat-dots beat-dots-small" aria-hidden="true">
          {[0, 1, 2, 3].map((b) => (
            <div
              key={b}
              className={`beat-dot ${beat % 4 === b && beat >= 0 ? "beat-dot-active" : ""} ${
                b === 0 ? "beat-dot-one" : ""
              }`}
            >
              {b + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="chord-strip" aria-label="Chord progression">
        {BUILDER_PROGRESSION.map((chord, i) => (
          <div key={i} className={`chord-chip ${bar === i ? "chord-chip-active" : ""}`}>
            {chord}
          </div>
        ))}
      </div>

      <div className="layer-list">
        {LAYERS.map((layer) => (
          <button
            key={layer.id}
            className={`layer-row ${layers[layer.id] ? "layer-row-on" : "layer-row-off"}`}
            onClick={() => toggleLayer(layer.id)}
            aria-pressed={layers[layer.id]}
          >
            <span className="layer-emoji">{layer.emoji}</span>
            <span className="layer-info">
              <span className="layer-name">{layer.name}</span>
              <span className="layer-role">{layer.role}</span>
            </span>
            <span className={`layer-switch ${layers[layer.id] ? "on" : ""}`}>
              {layers[layer.id] ? "ON" : "OFF"}
            </span>
          </button>
        ))}
      </div>

      <div className="builder-exercises">
        <p className="demo-hint">
          <strong>Ear-training exercises:</strong>
        </p>
        <ul className="exercise-list">
          <li>
            Play <strong>melody only</strong> — that&apos;s the part a singer would
            sing.
          </li>
          <li>
            Play <strong>drums only</strong> and count “1, 2, 3, 4” — the sharp
            crack (snare) lands on 2 and 4.
          </li>
          <li>
            Play <strong>chords only</strong>, then add the melody — hear how
            the harmony supports the tune.
          </li>
          <li>
            Turn everything on, then mute one layer at a time and notice what
            goes missing. That&apos;s how you learn to hear parts in real songs.
          </li>
        </ul>
      </div>
    </section>
  );
}
