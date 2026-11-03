// A small, original, calm hymn-like ambience, synthesized entirely with the
// Web Audio API (no samples, no copyrighted recordings or melodies).

const NOTE_HZ: Record<string, number> = {
  F3: 174.61,
  A3: 220.0,
  Bb3: 233.08,
  C4: 261.63,
  D4: 293.66,
  F4: 349.23,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

interface MelodyNote {
  note: keyof typeof NOTE_HZ | null; // null = rest
  beats: number;
}

// One original 16-beat phrase, slow and stepwise, resolving on the tonic —
// written for this app, not quoting any existing hymn.
const MELODY: MelodyNote[] = [
  { note: "C5", beats: 1 },
  { note: "D5", beats: 1 },
  { note: "F5", beats: 1 },
  { note: "E5", beats: 1 },
  { note: "D5", beats: 2 },
  { note: "C5", beats: 2 },
  { note: "A4", beats: 1 },
  { note: "C5", beats: 1 },
  { note: "D5", beats: 1 },
  { note: "C5", beats: 1 },
  { note: "Bb4", beats: 2 },
  { note: "A4", beats: 2 },
];

const PAD_CHORDS: { notes: (keyof typeof NOTE_HZ)[]; beats: number }[] = [
  { notes: ["F3", "A3", "C4"], beats: 8 },
  { notes: ["Bb3", "D4", "F4"], beats: 8 },
];

export interface HymnPlayer {
  start: () => void;
  stop: () => void;
}

export function createHymnPlayer(volume = 0.16): HymnPlayer {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let timers: ReturnType<typeof setTimeout>[] = [];
  let playing = false;

  const BPM = 58;
  const beatSec = 60 / BPM;

  function buildReverbSend(context: AudioContext, destination: AudioNode) {
    // cheap feedback-delay "reverb" to suggest a stone sanctuary
    const delay = context.createDelay(1.2);
    delay.delayTime.value = 0.32;
    const feedback = context.createGain();
    feedback.gain.value = 0.42;
    const lowpass = context.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 2200;
    const wet = context.createGain();
    wet.gain.value = 0.35;

    delay.connect(feedback);
    feedback.connect(lowpass);
    lowpass.connect(delay);
    delay.connect(wet);
    wet.connect(destination);
    return delay;
  }

  function playTone(
    context: AudioContext,
    dest: AudioNode,
    reverbIn: AudioNode,
    freq: number,
    startAt: number,
    durSec: number,
    peakGain: number,
    type: OscillatorType
  ) {
    const osc = context.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;

    const gain = context.createGain();
    const attack = Math.min(0.35, durSec * 0.3);
    const release = Math.min(0.9, durSec * 0.6);
    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(peakGain, startAt + attack);
    gain.gain.setValueAtTime(peakGain, Math.max(startAt + attack, startAt + durSec - release));
    gain.gain.linearRampToValueAtTime(0, startAt + durSec);

    osc.connect(gain);
    gain.connect(dest);
    gain.connect(reverbIn);

    osc.start(startAt);
    osc.stop(startAt + durSec + 0.05);
  }

  function schedulePhrase(context: AudioContext, dest: AudioNode, reverbIn: AudioNode, atTime: number) {
    // melody
    let t = atTime;
    for (const step of MELODY) {
      const dur = step.beats * beatSec;
      if (step.note) {
        playTone(context, dest, reverbIn, NOTE_HZ[step.note], t, dur * 0.96, 0.11, "triangle");
      }
      t += dur;
    }

    // pad chords under the same span
    let padT = atTime;
    for (const chord of PAD_CHORDS) {
      const dur = chord.beats * beatSec;
      for (const n of chord.notes) {
        playTone(context, dest, reverbIn, NOTE_HZ[n], padT, dur * 0.98, 0.05, "sine");
      }
      padT += dur;
    }

    const phraseLen = MELODY.reduce((s, n) => s + n.beats, 0) * beatSec;
    return phraseLen;
  }

  function loop() {
    if (!ctx || !master || !playing) return;
    const reverbIn = buildReverbSend(ctx, master);
    const startAt = ctx.currentTime + 0.1;
    const phraseLen = schedulePhrase(ctx, master, reverbIn, startAt);
    const nextInMs = phraseLen * 1000 - 150;
    timers.push(setTimeout(loop, Math.max(200, nextInMs)));
  }

  return {
    start() {
      if (playing) return;
      playing = true;
      if (!ctx) {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctx = new AC();
      }
      if (ctx.state === "suspended") ctx.resume();
      if (!master) {
        master = ctx.createGain();
        master.gain.value = 0;
        master.connect(ctx.destination);
      }
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);
      loop();
    },
    stop() {
      playing = false;
      timers.forEach(clearTimeout);
      timers = [];
      if (ctx && master) {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      }
    },
  };
}
