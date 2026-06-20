// Runs inside AudioWorkletGlobalScope — no DOM, no module system.
// Receives float32 PCM at the AudioContext rate, downsamples to 16 kHz via
// linear interpolation, converts to Int16, and posts each chunk to the main
// thread as a transferred ArrayBuffer (zero-copy).
//
// Plain JS (not TS) on purpose: this file is loaded directly by the browser
// via audioWorklet.addModule(), so it must be valid JavaScript in production
// where Vite emits it as a static asset without transpilation. `sampleRate`,
// `AudioWorkletProcessor`, and `registerProcessor` are globals provided by the
// AudioWorklet runtime.

class CaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._ratio = sampleRate / 16000;
    this._phase = 0;
  }

  process(inputs) {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) return true;

    const out = [];
    let phase = this._phase;

    while (phase < channel.length) {
      const i = Math.floor(phase);
      const frac = phase - i;
      const a = channel[i];
      const b = i + 1 < channel.length ? channel[i + 1] : a;
      out.push(a + frac * (b - a));
      phase += this._ratio;
    }

    this._phase = phase - channel.length;

    if (out.length > 0) {
      const int16 = new Int16Array(out.length);
      for (let i = 0; i < out.length; i++) {
        int16[i] = Math.max(-32768, Math.min(32767, Math.round(out[i] * 32768)));
      }
      this.port.postMessage(int16.buffer, [int16.buffer]);
    }

    return true;
  }
}

registerProcessor("capture-processor", CaptureProcessor);
