"use client";

import { useEffect, useRef, useState } from "react";
import { Player, noteToMidi } from "@/lib/music/engine";
import { TWINKLE, CHORDS, melodyEvents, chordEvents } from "@/lib/music/songs";
import ConceptCard from "./ConceptCard";

const DEMOS = [
  {
    id: "one",
    label: "🎵 One note",
    desc: "a single note by itself",
    events: [{ beat: 0, type: "lead", midi: noteToMidi("C4"), dur: 2 }],
    beats: 2.5,
    bpm: 90,
  },
  {
    id: "chord",
    label: "🎹 A chord (3 notes at once)",
    desc: "three notes sounding together",
    events: [{ beat: 0, type: "chord", midis: CHORDS.C, dur: 3, gain: 0.12 }],
    beats: 3.5,
    bpm: 90,
  },
  {
    id: "melody",
    label: "🎤 Melody alone",
    desc: "Twinkle Twinkle, just the tune",
    events: melodyEvents(TWINKLE, { withIds: false }),
    beats: TWINKLE.beats,
    bpm: TWINKLE.bpm,
  },
  {
    id: "both",
    label: "✨ Melody + harmony",
    desc: "the same tune with chords underneath",
    events: [
      ...melodyEvents(TWINKLE, { withIds: false }),
      ...chordEvents(TWINKLE),
    ],
    beats: TWINKLE.beats,
    bpm: TWINKLE.bpm,
  },
];

export default function HarmonyLab() {
  const playerRef = useRef(null);
  const [activeDemo, setActiveDemo] = useState(null);

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => setActiveDemo(null);
    return () => playerRef.current.stop();
  }, []);

  const playDemo = (demo) => {
    if (activeDemo === demo.id) {
      playerRef.current.stop();
      return;
    }
    playerRef.current.play(demo.events, {
      bpm: demo.bpm,
      beats: demo.beats,
      onEnd: () => setActiveDemo(null),
    });
    setActiveDemo(demo.id);
  };

  return (
    <ConceptCard
      emoji="🎹"
      title="Harmony & Chords"
      tagline="Notes played at the same time, supporting the melody."
      realSongs={[
        {
          song: "Let It Be — The Beatles",
          tip: "the piano plays chords (harmony) while Paul sings the melody over them",
        },
        {
          song: "Bohemian Rhapsody — Queen",
          tip: "when the voices stack up and sing together, that's vocal harmony",
        },
        {
          song: "Any campfire guitar song",
          tip: "strummed guitar = chords = harmony; the singing = melody",
        },
      ]}
    >
      <p>
        <strong>Harmony</strong> is what happens when two or more notes sound{" "}
        <strong>at the same time</strong>. The most common building block is a{" "}
        <strong>chord</strong> — usually three notes played together. Chords
        are like the cushion the melody sits on: play the same melody over
        different chords and it can feel happy, sad, or tense.
      </p>
      <p>
        Quick rule of thumb: <strong>melody = one note after another</strong>,{" "}
        <strong>harmony = notes stacked on top of each other</strong>.
      </p>

      <div className="demo-grid">
        {DEMOS.map((demo) => (
          <button
            key={demo.id}
            className={`demo-tile ${activeDemo === demo.id ? "demo-tile-active" : ""}`}
            onClick={() => playDemo(demo)}
          >
            <span className="demo-tile-label">
              {activeDemo === demo.id ? "⏹ " : ""}
              {demo.label}
            </span>
            <span className="demo-tile-desc">{demo.desc}</span>
          </button>
        ))}
      </div>
      <p className="demo-hint">
        Play them in order, top to bottom. Hear how the chords make the tune
        feel fuller in the last one? That&apos;s harmony doing its job.
      </p>
    </ConceptCard>
  );
}
