"use client";

import { useEffect, useRef, useState } from "react";
import { Player, noteToMidi } from "@/lib/music/engine";
import { CHORDS, drumGroove } from "@/lib/music/songs";

const n = noteToMidi;
const SCALE = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
const TRIADS = [CHORDS.C, CHORDS.F, CHORDS.G, CHORDS.Am];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* Each question builder returns:
   { prompt, options, answer, explain, play: (player, onDone) => void } */

function melodyOrChordQuestion() {
  const isMelody = Math.random() < 0.5;
  let events;
  if (isMelody) {
    let idx = Math.floor(Math.random() * 4);
    events = [0, 1, 2, 3].map((beat) => {
      idx = Math.max(0, Math.min(SCALE.length - 1, idx + pick([-2, -1, 1, 2])));
      return { beat, type: "lead", midi: n(SCALE[idx]), dur: 0.9 };
    });
  } else {
    const triad = pick(TRIADS);
    events = [
      { beat: 0, type: "chord", midis: triad, dur: 2, gain: 0.11 },
      { beat: 2, type: "chord", midis: triad, dur: 2, gain: 0.11 },
    ];
  }
  return {
    prompt: "Listen 🎧 — is this a melody or a chord?",
    options: ["Melody (one note at a time)", "Chord (notes together)"],
    answer: isMelody ? 0 : 1,
    explain: isMelody
      ? "The notes came one after another in a line — that's a melody."
      : "Several notes sounded at the same time — that's a chord (harmony).",
    play: (player, onDone) =>
      player.play(events, { bpm: 100, beats: 4.5, onEnd: onDone }),
  };
}

function snareQuestion() {
  const backbeat = Math.random() < 0.5; // snare on 2 & 4 vs 1 & 3
  const events = [];
  for (let bar = 0; bar < 2; bar++) {
    const base = bar * 4;
    for (let b = 0; b < 4; b++) events.push({ beat: base + b, type: "kick", gain: 0.5 });
    const snares = backbeat ? [1, 3] : [0, 2];
    snares.forEach((b) => events.push({ beat: base + b, type: "snare", gain: 0.35 }));
  }
  return {
    prompt:
      "Count “1, 2, 3, 4” along with the low thump (kick). Which beats does the sharp CRACK (snare) land on?",
    options: ["Beats 1 and 3", "Beats 2 and 4"],
    answer: backbeat ? 1 : 0,
    explain: backbeat
      ? "The snare hit on 2 and 4 — the classic “backbeat” used in most pop and rock songs."
      : "The snare hit on 1 and 3 this time. (Most pop songs put it on 2 and 4 — the “backbeat.”)",
    play: (player, onDone) => player.play(events, { bpm: 92, beats: 8, onEnd: onDone }),
  };
}

function fasterQuestion() {
  const tempos = [[70, 120], [80, 132], [126, 76], [138, 88]];
  const [bpmA, bpmB] = pick(tempos);
  const groove = drumGroove(1);
  // Both grooves on one timeline (in bpmA beats), with a one-beat gap.
  const ratio = bpmA / bpmB;
  const events = [
    ...groove,
    ...groove.map((e) => ({ ...e, beat: 5 + e.beat * ratio })),
  ];
  return {
    prompt: "You'll hear two short grooves. Which one has the FASTER tempo?",
    options: ["The first one", "The second one"],
    answer: bpmA > bpmB ? 0 : 1,
    explain: `The first was ${bpmA} BPM and the second was ${bpmB} BPM. Faster tempo = more beats per minute.`,
    play: (player, onDone) =>
      player.play(events, { bpm: bpmA, beats: 5.5 + 4 * ratio, onEnd: onDone }),
  };
}

function howManyQuestion() {
  const isOne = Math.random() < 0.5;
  const events = isOne
    ? [{ beat: 0, type: "lead", midi: n(pick(SCALE)), dur: 2.5 }]
    : [{ beat: 0, type: "chord", midis: pick(TRIADS), dur: 2.5, gain: 0.12 }];
  return {
    prompt: "Listen 🎧 — is that ONE note, or SEVERAL notes at once?",
    options: ["One note", "Several notes (a chord)"],
    answer: isOne ? 0 : 1,
    explain: isOne
      ? "Just a single note. A chord would sound thicker — like several voices."
      : "That was a chord — three notes stacked together. Hear how much thicker it sounds than one note?",
    play: (player, onDone) => player.play(events, { bpm: 90, beats: 3, onEnd: onDone }),
  };
}

const BUILDERS = [melodyOrChordQuestion, snareQuestion, fasterQuestion, howManyQuestion];

export default function Quiz() {
  const playerRef = useRef(null);
  const [question, setQuestion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState({ right: 0, total: 0 });

  useEffect(() => {
    playerRef.current = new Player();
    playerRef.current.onstop = () => setIsPlaying(false);
    return () => playerRef.current.stop();
  }, []);

  const nextQuestion = () => {
    playerRef.current.stop();
    setPicked(null);
    setQuestion(() => pick(BUILDERS)());
  };

  const playClip = () => {
    if (!question || isPlaying) return;
    setIsPlaying(true);
    question.play(playerRef.current, () => setIsPlaying(false));
  };

  const choose = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    setScore((s) => ({
      right: s.right + (idx === question.answer ? 1 : 0),
      total: s.total + 1,
    }));
  };

  return (
    <section className="concept-card">
      <header className="concept-card-header">
        <span className="concept-card-emoji">🧠</span>
        <div>
          <h2>Ear Quiz</h2>
          <p className="concept-card-tagline">
            Test yourself — can you hear the difference?
          </p>
        </div>
      </header>

      {score.total > 0 && (
        <div className="quiz-score">
          Score: <strong>{score.right} / {score.total}</strong>
        </div>
      )}

      {!question ? (
        <div className="quiz-start">
          <p>
            Random listening questions about everything you just learned:
            melody vs. chords, finding the snare, comparing tempos. Replay
            each clip as many times as you like.
          </p>
          <button className="btn btn-primary btn-large" onClick={nextQuestion}>
            Start the quiz
          </button>
        </div>
      ) : (
        <div className="quiz-body">
          <p className="quiz-prompt">{question.prompt}</p>
          <button className="btn btn-secondary" onClick={playClip} disabled={isPlaying}>
            {isPlaying ? "🔊 Playing…" : "🔊 Play the clip"}
          </button>
          <div className="quiz-options">
            {question.options.map((opt, i) => {
              let cls = "quiz-option";
              if (picked !== null) {
                if (i === question.answer) cls += " quiz-option-right";
                else if (i === picked) cls += " quiz-option-wrong";
              }
              return (
                <button key={opt} className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                  {opt}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <div className="quiz-result">
              <p className={picked === question.answer ? "quiz-correct" : "quiz-incorrect"}>
                {picked === question.answer ? "✅ Correct!" : "❌ Not quite."}
              </p>
              <p className="quiz-explain">{question.explain}</p>
              <button className="btn btn-primary" onClick={nextQuestion}>
                Next question →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
