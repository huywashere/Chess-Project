"use client";

// Professional Chess Sound Manager
// High-fidelity move and capture sound effects matching Listudy / Lichess standard
class SoundManager {
  private moveAudio: HTMLAudioElement | null = null;
  private captureAudio: HTMLAudioElement | null = null;
  private victoryAudio: HTMLAudioElement | null = null;
  private errorAudio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      try {
        this.moveAudio = new Audio("/sounds/move.mp3");
        this.captureAudio = new Audio("/sounds/capture.mp3");
        this.victoryAudio = new Audio("/sounds/victory.mp3");
        this.errorAudio = new Audio("/sounds/error.mp3");

        [this.moveAudio, this.captureAudio, this.victoryAudio, this.errorAudio].forEach(
          (a) => {
            if (a) {
              a.preload = "auto";
            }
          }
        );
      } catch {
        // audio element not supported
      }
    }
  }

  private getContext(): AudioContext | null {
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
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Realistic wooden chess move sound (knock) — Exact Listudy / Lichess standard
  playMove() {
    if (this.moveAudio) {
      try {
        const clone = this.moveAudio.cloneNode(true) as HTMLAudioElement;
        clone.volume = 0.85;
        clone.play().catch(() => this.fallbackMove());
        return;
      } catch {
        this.fallbackMove();
        return;
      }
    }
    this.fallbackMove();
  }

  private fallbackMove() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  // Capture piece sound (heavier crack) — Exact Listudy / Lichess standard
  playCapture() {
    if (this.captureAudio) {
      try {
        const clone = this.captureAudio.cloneNode(true) as HTMLAudioElement;
        clone.volume = 0.9;
        clone.play().catch(() => this.fallbackCapture());
        return;
      } catch {
        this.fallbackCapture();
        return;
      }
    }
    this.fallbackCapture();
  }

  private fallbackCapture() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.45, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  // Check alert sound (double bell/ping)
  playCheck() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [587.33, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.16);
      });
    } catch {
      // ignore
    }
  }

  // Victory / Game over fanfare
  playVictory() {
    if (this.victoryAudio) {
      try {
        const clone = this.victoryAudio.cloneNode(true) as HTMLAudioElement;
        clone.volume = 0.8;
        clone.play().catch(() => this.fallbackVictory());
        return;
      } catch {
        this.fallbackVictory();
        return;
      }
    }
    this.fallbackVictory();
  }

  private fallbackVictory() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.32);
      });
    } catch {
      // ignore
    }
  }

  // Error sound
  playError() {
    if (this.errorAudio) {
      try {
        const clone = this.errorAudio.cloneNode(true) as HTMLAudioElement;
        clone.volume = 0.7;
        clone.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }
}

export const soundManager = new SoundManager();
