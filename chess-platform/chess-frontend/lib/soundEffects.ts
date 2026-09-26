"use client";

// Professional Chess Sound Engine
// High-fidelity move and capture sound effects matching Listudy / Lichess standard
// Powered by Web Audio API buffer playback + HTML5 Audio fallback + Procedural Wood Synthesizer
class SoundManager {
  private ctx: AudioContext | null = null;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private audioElements: Map<string, HTMLAudioElement[]> = new Map();
  private isUnlocked: boolean = false;
  private volume: number = 0.9;
  private isMuted: boolean = false;

  private soundUrls: Record<string, string> = {
    move: "/sounds/move.mp3",
    capture: "/sounds/capture.mp3",
    victory: "/sounds/victory.mp3",
    error: "/sounds/error.mp3",
  };

  constructor() {
    if (typeof window !== "undefined") {
      // Auto-unlock on first user interaction anywhere on the window
      const unlockHandler = () => {
        this.unlock();
      };

      window.addEventListener("pointerdown", unlockHandler, { passive: true });
      window.addEventListener("keydown", unlockHandler, { passive: true });
      window.addEventListener("click", unlockHandler, { passive: true });
      window.addEventListener("touchstart", unlockHandler, { passive: true });

      // Pre-initialize audio elements pool
      this.initAudioPool();

      // Check stored preference
      try {
        const storedMute = localStorage.getItem("chess_sound_enabled");
        if (storedMute !== null) {
          this.isMuted = storedMute === "false";
        }
      } catch {
        // ignore
      }
    }
  }

  // Pre-load audio pool for instant zero-latency playback
  private initAudioPool() {
    Object.entries(this.soundUrls).forEach(([key, url]) => {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < 4; i++) {
        try {
          const audio = new Audio(url);
          audio.preload = "auto";
          audio.volume = this.volume;
          pool.push(audio);
        } catch {
          // ignore
        }
      }
      this.audioElements.set(key, pool);
    });
  }

  // Pre-decode audio buffers into Web Audio memory
  private async loadBuffers() {
    const ctx = this.getContext();
    if (!ctx) return;

    for (const [key, url] of Object.entries(this.soundUrls)) {
      if (this.audioBuffers.has(key)) continue;
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        this.audioBuffers.set(key, decoded);
      } catch {
        // Fallback to pool or procedural
      }
    }
  }

  // Ensure AudioContext is initialized and resumed
  public unlock(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === "running") {
      this.isUnlocked = true;
    }

    // Attempt to load buffers once unlocked
    if (this.audioBuffers.size === 0) {
      this.loadBuffers().catch(() => {});
    }

    return this.ctx;
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      return this.unlock();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioElements.forEach((pool) => {
      pool.forEach((a) => {
        a.volume = this.volume;
      });
    });
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem("chess_sound_enabled", (!muted).toString());
    } catch {
      // ignore
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // Generic sound player with 3-tier safety:
  // 1. Web Audio Decoded Buffer (Zero latency, best quality)
  // 2. HTML5 Audio Element from preloaded pool
  // 3. Procedural Web Audio Synthesizer (Zero network required)
  private playSound(
    key: "move" | "capture" | "victory" | "error",
    fallbackSynth: () => void
  ) {
    if (this.isMuted) return;

    const ctx = this.getContext();

    // 1. Try Web Audio buffer source
    if (ctx && ctx.state === "running" && this.audioBuffers.has(key)) {
      try {
        const buffer = this.audioBuffers.get(key)!;
        const source = ctx.createBufferSource();
        const gainNode = ctx.createGain();
        source.buffer = buffer;
        gainNode.gain.setValueAtTime(this.volume, ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(ctx.destination);
        source.start(0);
        return;
      } catch {
        // fallback
      }
    }

    // 2. Try HTML5 Audio Pool
    const pool = this.audioElements.get(key);
    if (pool && pool.length > 0) {
      const audio = pool.find((a) => a.paused || a.ended) || pool[0];
      try {
        audio.currentTime = 0;
        audio.volume = this.volume;
        const promise = audio.play();
        if (promise !== undefined) {
          promise.catch(() => {
            // Browser autoplay blocked -> fallback to synth
            fallbackSynth();
          });
          return;
        }
      } catch {
        // fallback
      }
    }

    // 3. Procedural synthesis fallback
    fallbackSynth();
  }

  // Realistic wooden chess move sound (knock) — Exact Listudy / Lichess standard
  playMove() {
    this.playSound("move", () => this.synthesizeMove());
  }

  // Capture piece sound (heavier crack) — Exact Listudy / Lichess standard
  playCapture() {
    this.playSound("capture", () => this.synthesizeCapture());
  }

  // Check alert sound (double bell/ping)
  playCheck() {
    if (this.isMuted) return;
    this.synthesizeCheck();
  }

  // Castle sound (rapid double wooden knock)
  playCastle() {
    if (this.isMuted) return;
    this.playSound("move", () => this.synthesizeCastle());
    setTimeout(() => {
      this.playSound("move", () => this.synthesizeCastle());
    }, 120);
  }

  // Victory / Game over fanfare
  playVictory() {
    this.playSound("victory", () => this.synthesizeVictory());
  }

  // Defeat sound (somber descending minor notes)
  playDefeat() {
    if (this.isMuted) return;
    this.synthesizeDefeat();
  }

  // Low time warning pulse (tick-tock)
  playLowTime() {
    if (this.isMuted) return;
    this.synthesizeLowTime();
  }

  // Error sound
  playError() {
    this.playSound("error", () => this.synthesizeError());
  }

  // Quick sound tester
  public test() {
    this.unlock();
    this.playMove();
  }

  // -------------------------------------------------------------
  // PROCEDURAL HIGH-FIDELITY SYNTHESIZERS
  // -------------------------------------------------------------

  private synthesizeMove() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Wooden body punch (low sine rapid ramp)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.05);

      gain.gain.setValueAtTime(0.4 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);

      // Wood impact transient (felt/board tap)
      const tapOsc = ctx.createOscillator();
      const tapGain = ctx.createGain();
      tapOsc.type = "triangle";
      tapOsc.frequency.setValueAtTime(750, now);
      tapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.025);

      tapGain.gain.setValueAtTime(0.25 * this.volume, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      tapOsc.connect(tapGain);
      tapGain.connect(ctx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.035);
    } catch {
      // ignore
    }
  }

  private synthesizeCapture() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Heavy wood crack (triangle + fast drop)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.07);

      gain.gain.setValueAtTime(0.55 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      // Clack transient
      const snapOsc = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snapOsc.type = "sawtooth";
      snapOsc.frequency.setValueAtTime(980, now);
      snapOsc.frequency.exponentialRampToValueAtTime(200, now + 0.03);

      snapGain.gain.setValueAtTime(0.2 * this.volume, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      snapOsc.connect(snapGain);
      snapGain.connect(ctx.destination);
      snapOsc.start(now);
      snapOsc.stop(now + 0.04);
    } catch {
      // ignore
    }
  }

  private synthesizeCheck() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.2);
      });
    } catch {
      // ignore
    }
  }

  private synthesizeCastle() {
    this.synthesizeMove();
  }

  private synthesizeVictory() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.38);
      });
    } catch {
      // ignore
    }
  }

  private synthesizeDefeat() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [392.0, 349.23, 311.13, 261.63].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2 * this.volume, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.32);
      });
    } catch {
      // ignore
    }
  }

  private synthesizeLowTime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }

  private synthesizeError() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [220, 180].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.18 * this.volume, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.13);
      });
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
