// Musical material for the learning page. Melodies are public-domain
// tunes; the grooves and the Song Builder line are original, written in
// the style of pop songs so the concepts transfer to real music.

import { noteToMidi } from "./engine";

const n = noteToMidi;

/* ---------- Chords (voicings) ---------- */

export const CHORDS = {
  C: [n("C4"), n("E4"), n("G4")],
  F: [n("F3"), n("A3"), n("C4")],
  G: [n("G3"), n("B3"), n("D4")],
  Am: [n("A3"), n("C4"), n("E4")],
};

/* ---------- Melodies (public domain) ---------- */

// Each note: { name, beat, dur } — beat/dur in quarter notes.
function melody(notes) {
  let beat = 0;
  return notes.map(([name, dur], i) => {
    const note = { id: i, name, midi: n(name), beat, dur };
    beat += dur;
    return note;
  });
}

export const TWINKLE = {
  title: "Twinkle, Twinkle, Little Star",
  bpm: 100,
  beats: 16,
  notes: melody([
    ["C4", 1], ["C4", 1], ["G4", 1], ["G4", 1],
    ["A4", 1], ["A4", 1], ["G4", 2],
    ["F4", 1], ["F4", 1], ["E4", 1], ["E4", 1],
    ["D4", 1], ["D4", 1], ["C4", 2],
  ]),
  // One chord every two beats, matching the tune.
  chords: [
    { name: "C", beat: 0, dur: 2 }, { name: "C", beat: 2, dur: 2 },
    { name: "F", beat: 4, dur: 2 }, { name: "C", beat: 6, dur: 2 },
    { name: "F", beat: 8, dur: 2 }, { name: "C", beat: 10, dur: 2 },
    { name: "G", beat: 12, dur: 2 }, { name: "C", beat: 14, dur: 2 },
  ],
};

export const ODE_TO_JOY = {
  title: "Ode to Joy (Beethoven)",
  bpm: 110,
  beats: 16,
  notes: melody([
    ["E4", 1], ["E4", 1], ["F4", 1], ["G4", 1],
    ["G4", 1], ["F4", 1], ["E4", 1], ["D4", 1],
    ["C4", 1], ["C4", 1], ["D4", 1], ["E4", 1],
    ["E4", 1.5], ["D4", 0.5], ["D4", 2],
  ]),
  chords: [
    { name: "C", beat: 0, dur: 4 },
    { name: "C", beat: 4, dur: 2 }, { name: "G", beat: 6, dur: 2 },
    { name: "C", beat: 8, dur: 2 }, { name: "F", beat: 10, dur: 2 },
    { name: "G", beat: 12, dur: 2 }, { name: "G", beat: 14, dur: 2 },
  ],
};

export const MELODIES = [TWINKLE, ODE_TO_JOY];

export function melodyEvents(song, { track = "melody", withIds = true } = {}) {
  return song.notes.map((note) => ({
    beat: note.beat,
    type: "lead",
    midi: note.midi,
    dur: note.dur * 0.95,
    track,
    ...(withIds ? { id: note.id } : {}),
  }));
}

export function chordEvents(song, { track = "chords" } = {}) {
  return song.chords.map((c) => ({
    beat: c.beat,
    type: "chord",
    midis: CHORDS[c.name],
    dur: c.dur * 0.95,
    track,
  }));
}

/* ---------- Drum grooves ---------- */

// A basic pop/rock drum groove for `bars` bars of 4/4:
// kick on every beat, snare on beats 2 & 4, hi-hats on eighth notes.
export function drumGroove(bars = 1, { track = "drums", hats = true } = {}) {
  const events = [];
  for (let bar = 0; bar < bars; bar++) {
    const base = bar * 4;
    for (let b = 0; b < 4; b++) events.push({ beat: base + b, type: "kick", track });
    events.push({ beat: base + 1, type: "snare", track });
    events.push({ beat: base + 3, type: "snare", track });
    if (hats) {
      for (let e = 0; e < 8; e++) {
        events.push({ beat: base + e * 0.5, type: "hat", track });
      }
    }
  }
  return events;
}

// Just the pulse: a kick drum on every beat, beat 1 accented.
export function pulseEvents(bars = 1, { track = "pulse" } = {}) {
  const events = [];
  for (let bar = 0; bar < bars; bar++) {
    for (let b = 0; b < 4; b++) {
      events.push({
        beat: bar * 4 + b,
        type: "kick",
        gain: b === 0 ? 0.7 : 0.45,
        track,
      });
      if (b === 0) events.push({ beat: bar * 4, type: "hat", gain: 0.15, track });
    }
  }
  return events;
}

/* ---------- Song Builder: an original 8-bar pop groove ----------

Chord progression: C – G – Am – F (the famous "four chords" heard in
Let It Be, No Woman No Cry, Someone Like You, and many more).
*/

export const BUILDER_PROGRESSION = ["C", "G", "Am", "F", "C", "G", "Am", "F"];

const BASS_ROOTS = { C: n("C2"), G: n("G2"), Am: n("A2"), F: n("F2") };

const BUILDER_MELODY = [
  // [note, beatInSong, dur] — one simple singable phrase per bar.
  ["E4", 0, 1], ["G4", 1, 1], ["C5", 2, 2],
  ["D5", 4, 1], ["B4", 5, 1], ["G4", 6, 2],
  ["A4", 8, 1], ["C5", 9, 1], ["E5", 10, 2],
  ["A4", 12, 1], ["G4", 13, 1], ["E4", 14, 2],
  ["E4", 16, 1], ["G4", 17, 1], ["C5", 18, 2],
  ["D5", 20, 1], ["B4", 21, 1], ["G4", 22, 2],
  ["E5", 24, 1], ["C5", 25, 1], ["A4", 26, 2],
  ["G4", 28, 1.5], ["E4", 29.5, 0.5], ["C4", 30, 2],
];

export function builderSong() {
  const events = [];

  events.push(...drumGroove(8, { track: "drums" }));

  BUILDER_PROGRESSION.forEach((chord, bar) => {
    const base = bar * 4;
    // Chords: one sustained chord per bar.
    events.push({
      beat: base,
      type: "chord",
      midis: CHORDS[chord],
      dur: 3.9,
      track: "chords",
    });
    // Bass: a simple pumping root-note pattern.
    const root = BASS_ROOTS[chord];
    events.push({ beat: base, type: "bass", midi: root, dur: 1.4, track: "bass" });
    events.push({ beat: base + 1.5, type: "bass", midi: root, dur: 0.4, track: "bass" });
    events.push({ beat: base + 2, type: "bass", midi: root, dur: 1.4, track: "bass" });
    events.push({ beat: base + 3.5, type: "bass", midi: root + 12, dur: 0.4, track: "bass" });
  });

  BUILDER_MELODY.forEach(([name, beat, dur], i) => {
    events.push({
      beat,
      type: "lead",
      midi: n(name),
      dur: dur * 0.95,
      gain: 0.26,
      track: "melody",
      id: i,
    });
  });

  return { events, beats: 32, bpm: 92 };
}
