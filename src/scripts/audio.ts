type SoundName = "click" | "open" | "chime" | "destroy" | "close" | "minimize" | "restore";

const STORAGE_KEY = "chakerat.muted";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = true;

try {
  muted = localStorage.getItem(STORAGE_KEY) !== "0";
} catch {
  muted = true;
}

function ensureCtx(): void {
  if (ctx) return;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return;
  ctx = new Ctor();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
}

function tone(
  freq: number,
  opts: {
    type?: OscillatorType;
    duration?: number;
    delay?: number;
    sweepTo?: number;
    volume?: number;
  } = {},
): void {
  if (!ctx || !master) return;
  const { type = "square", duration = 0.09, delay = 0, sweepTo, volume = 1 } = opts;
  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (sweepTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(sweepTo, 1), start + duration);
  }
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise(opts: { duration?: number; delay?: number; volume?: number } = {}): void {
  if (!ctx || !master) return;
  const { duration = 0.14, delay = 0, volume = 0.5 } = opts;
  const start = ctx.currentTime + delay;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  src.connect(gain);
  gain.connect(master);
  src.start(start);
}

const recipes: Record<SoundName, () => void> = {
  click: () => tone(660, { duration: 0.045, volume: 0.55 }),
  open: () => {
    tone(440, { duration: 0.07, volume: 0.6 });
    tone(880, { duration: 0.09, delay: 0.075, volume: 0.6 });
  },
  close: () => {
    tone(660, { duration: 0.07, volume: 0.55 });
    tone(330, { duration: 0.09, delay: 0.07, volume: 0.55 });
  },
  minimize: () => {
    tone(620, { duration: 0.18, sweepTo: 165, volume: 0.5 });
    tone(310, { duration: 0.12, delay: 0.06, sweepTo: 90, volume: 0.3 });
  },
  restore: () => {
    tone(150, { duration: 0.16, sweepTo: 620, volume: 0.5 });
    tone(620, { duration: 0.06, delay: 0.12, volume: 0.35 });
  },
  chime: () => {
    tone(523.25, { type: "triangle", duration: 0.22, volume: 0.5 });
    tone(659.25, { type: "triangle", duration: 0.22, delay: 0.05, volume: 0.45 });
    tone(783.99, { type: "triangle", duration: 0.26, delay: 0.1, volume: 0.4 });
  },
  destroy: () => {
    tone(220, { type: "sawtooth", duration: 0.32, sweepTo: 40, volume: 0.6 });
    noise({ duration: 0.16, delay: 0.02, volume: 0.35 });
  },
};

export function play(name: SoundName): void {
  if (muted) return;
  ensureCtx();
  if (!ctx || ctx.state !== "running") return;
  recipes[name]();
}

export function setMuted(next: boolean): void {
  muted = next;
  try {
    localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  } catch {
    /* storage unavailable — sound stays session-only */
  }
}

export function isMuted(): boolean {
  return muted;
}

/** Resume the context once a user gesture happens; browsers block audio otherwise. */
export function armAudio(): void {
  const unlock = () => {
    ensureCtx();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock);
}
