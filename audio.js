/**
 * Web Audio API Sound Synthesizer
 * Provides crisp tick sounds when wheel pin crosses segment boundary
 * and celebratory fanfare audio when wheel stops.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // Realistic mechanical wheel tick click sound
  playTick() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      // Fast drop pitch to sound like a physical peg click
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.audioCtx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.035);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  // Celebratory fanfare sound when wheel lands on decision
  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const notes = [
        { freq: 523.25, duration: 0.1, delay: 0 },     // C5
        { freq: 659.25, duration: 0.1, delay: 0.1 },   // E5
        { freq: 783.99, duration: 0.1, delay: 0.2 },   // G5
        { freq: 1046.50, duration: 0.35, delay: 0.3 }  // C6
      ];

      notes.forEach(({ freq, duration, delay }) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + delay);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(this.audioCtx.currentTime + delay);
        osc.stop(this.audioCtx.currentTime + delay + duration);
      });
    } catch (e) {
      console.warn('Audio fanfare error:', e);
    }
  }
}

export const soundEngine = new SoundEngine();
