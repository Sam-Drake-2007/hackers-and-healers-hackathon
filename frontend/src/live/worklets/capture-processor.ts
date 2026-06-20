// Runs inside AudioWorkletGlobalScope — no DOM, no module system.
// Receives float32 PCM at the AudioContext rate, downsamples to 16 kHz via
// linear interpolation, converts to Int16, and posts each chunk to the main
// thread as a transferred ArrayBuffer (zero-copy).

declare const sampleRate: number;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, ctor: typeof AudioWorkletProcessor): void;

class CaptureProcessor extends AudioWorkletProcessor {
  private _ratio: number;
  private _phase: number;

  constructor() {
    super();
    this._ratio = sampleRate / 16000;
    this._phase = 0;
  }

  process(inputs: Float32Array[][]): boolean {
    const channel = inputs[0]?.[0];
    if (!channel || channel.length === 0) return true;

    const out: number[] = [];
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
