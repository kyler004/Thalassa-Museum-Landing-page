/**
 * Zero-dependency Web Audio API procedural soundscape for the Mediterranean Peristyle
 * Produces subtle harmonic resonant tones when transitioning between exhibits or toggling acoustic atmosphere.
 */
class MuseumSoundscape {
  private ctx: AudioContext | null = null;
  private isMuted = true;
  private masterGain: GainNode | null = null;
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;

  public toggleAmbient(): boolean {
    if (this.isMuted) {
      this.startAmbient();
      return true;
    } else {
      this.stopAmbient();
      return false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startAmbient() {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.stopAmbient();
      this.isMuted = false;

      const now = this.ctx.currentTime;
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.001, now);
      master.gain.exponentialRampToValueAtTime(0.035, now + 1.2);
      master.connect(this.ctx.destination);
      this.masterGain = master;

      // Pythagorean fifth harmonic interval (144 Hz & 216 Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(144, now);
      osc2.frequency.setValueAtTime(216, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(340, now);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);

      osc1.start(now);
      osc2.start(now);

      this.droneOsc1 = osc1;
      this.droneOsc2 = osc2;
    } catch {
      // Ignore autoplay restrictions
    }
  }

  public stopAmbient() {
    this.isMuted = true;
    try {
      if (this.droneOsc1) {
        this.droneOsc1.stop();
        this.droneOsc1.disconnect();
        this.droneOsc1 = null;
      }
      if (this.droneOsc2) {
        this.droneOsc2.stop();
        this.droneOsc2.disconnect();
        this.droneOsc2 = null;
      }
      if (this.masterGain) {
        this.masterGain.disconnect();
        this.masterGain = null;
      }
    } catch {
      // Ignore cleanup errors
    }
  }

  public playChime(exhibitIndex: number) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = [288, 324, 384, 432, 512];
      const freq = freqs[exhibitIndex % freqs.length];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.45);
    } catch {
      // Ignore
    }
  }
}

export const museumAudio = new MuseumSoundscape();
