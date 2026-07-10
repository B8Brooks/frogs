"use client";

import { useEffect, useRef, useState } from "react";
import { Player } from "@/lib/music/engine";
import { MELODIES, melodyEvents } from "@/lib/music/songs";
import ConceptCard from "./ConceptCard";

export default function MelodyLab() {
  const playerRef = useRef(null);
  const [songIdx, setSongIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(-1);

  const song = MELODIES[songIdx];

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => {
      setPlaying(false);
      setActiveNote(-1);
    };
    return () => playerRef.current.stop();
  }, []);

  const toggle = () => {
    if (playing) {
      playerRef.current.stop();
    } else {
      playerRef.current.play(melodyEvents(song), {
        bpm: song.bpm,
        beats: song.beats,
        onEvent: (ev) => setActiveNote(ev.id),
        onEnd: () => setActiveNote(-1),
      });
      setPlaying(true);
    }
  };

  const pickSong = (idx) => {
    playerRef.current.stop();
    setSongIdx(idx);
    setActiveNote(-1);
  };

  return (
    <ConceptCard
      emoji="🎤"
      title="Melody"
      tagline="The tune — the part you hum or sing. One note at a time."
      realSongs={[
        {
          song: "Almost any pop song",
          tip: "the singer's voice carries the melody — it's the part stuck in your head",
        },
        {
          song: "Seven Nation Army — The White Stripes",
          tip: "that famous riff everyone chants at stadiums? A seven-note melody",
        },
        {
          song: "Let It Go — Frozen",
          tip: "hum it right now — the notes you're humming are the melody",
        },
      ]}
    >
      <p>
        The <strong>melody</strong> is the tune: a sequence of single notes,
        one after another, that rises and falls. It&apos;s the part of the song
        you hum, whistle, or can&apos;t get out of your head. In most songs the{" "}
        <strong>singer carries the melody</strong>, and everything else
        (drums, bass, chords) supports it.
      </p>

      <div className="song-picker">
        {MELODIES.map((s, i) => (
          <button
            key={s.title}
            className={`bucket-filter-tab ${i === songIdx ? "active" : ""}`}
            onClick={() => pickSong(i)}
          >
            {s.title}
          </button>
        ))}
      </div>

      <div className="note-bubbles">
        {song.notes.map((note) => (
          <div
            key={note.id}
            className={`note-bubble ${activeNote === note.id ? "note-bubble-active" : ""}`}
            style={{ "--note-h": `${(note.midi - 58) * 6}px` }}
          >
            {note.name.replace(/\d/, "")}
          </div>
        ))}
      </div>

      <div className="demo-controls">
        <button className={`btn ${playing ? "btn-ghost" : "btn-primary"}`} onClick={toggle}>
          {playing ? "⏹ Stop" : "▶ Play the melody"}
        </button>
      </div>
      <p className="demo-hint">
        Watch the notes light up — higher bubbles are higher notes. Notice
        it&apos;s always <strong>one note at a time</strong>. That&apos;s what makes it a
        melody.
      </p>
    </ConceptCard>
  );
}
