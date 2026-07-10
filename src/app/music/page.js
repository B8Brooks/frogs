"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import BeatLab from "@/components/music/BeatLab";
import RhythmLab from "@/components/music/RhythmLab";
import MelodyLab from "@/components/music/MelodyLab";
import HarmonyLab from "@/components/music/HarmonyLab";
import SongBuilder from "@/components/music/SongBuilder";
import TapGame from "@/components/music/TapGame";
import Quiz from "@/components/music/Quiz";

const TABS = [
  { id: "basics", label: "🎓 Basics" },
  { id: "builder", label: "🎛️ Song Builder" },
  { id: "tap", label: "🥁 Tap the Beat" },
  { id: "quiz", label: "🧠 Quiz" },
];

export default function MusicPage() {
  const [tab, setTab] = useState("basics");

  return (
    <>
      <Navbar />
      <main className="main">
        <header className="music-intro">
          <h1>🎵 Music Basics</h1>
          <p>
            Learn to hear what&apos;s inside a song — the beat, the melody, the
            harmony — with sounds your browser plays live. Turn your volume on!
          </p>
        </header>

        <nav className="music-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`bucket-filter-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "basics" && (
          <>
            <BeatLab />
            <RhythmLab />
            <MelodyLab />
            <HarmonyLab />
            <p className="music-next-step">
              Got the basics? Head to the <strong>🎛️ Song Builder</strong> tab
              to hear them all working together in a real song arrangement.
            </p>
          </>
        )}
        {tab === "builder" && <SongBuilder />}
        {tab === "tap" && <TapGame />}
        {tab === "quiz" && <Quiz />}
      </main>
    </>
  );
}
