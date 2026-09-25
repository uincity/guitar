import type { SoundingNote } from '../types/chord'
import type { AudioEngine, StrokeDirection } from './AudioEngine'

export class SynthAudioEngine implements AudioEngine {
  private context: AudioContext | null = null
  private output: GainNode | null = null
  private active = new Set<OscillatorNode>()

  private async ready() {
    if (!this.context) {
      this.context = new AudioContext()
      this.output = this.context.createGain()
      this.output.gain.value = 0.55
      this.output.connect(this.context.destination)
    }
    if (this.context.state === 'suspended') await this.context.resume()
    return this.context
  }

  async playNote(note: SoundingNote) {
    const context = await this.ready()
    const now = context.currentTime
    const gain = context.createGain()
    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3200, now)
    filter.frequency.exponentialRampToValueAtTime(900, now + 1.25)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.7)
    filter.connect(gain)
    gain.connect(this.output!)

    const fundamental = context.createOscillator()
    fundamental.type = 'triangle'
    fundamental.frequency.value = note.frequency
    const fundamentalGain = context.createGain()
    fundamentalGain.gain.value = 0.8
    fundamental.connect(fundamentalGain).connect(filter)

    const harmonic = context.createOscillator()
    harmonic.type = 'sine'
    harmonic.frequency.value = note.frequency * 2
    const harmonicGain = context.createGain()
    harmonicGain.gain.value = 0.13
    harmonic.connect(harmonicGain).connect(filter)

    ;[fundamental, harmonic].forEach((oscillator) => {
      this.active.add(oscillator)
      oscillator.onended = () => this.active.delete(oscillator)
      oscillator.start(now)
      oscillator.stop(now + 1.75)
    })
  }

  async playChord(notes: SoundingNote[], direction: StrokeDirection = 'down', onString?: (stringNumber: number) => void) {
    await this.ready()
    const ordered = direction === 'down' ? notes : [...notes].reverse()
    ordered.forEach((note, index) => {
      window.setTimeout(() => {
        void this.playNote(note)
        onString?.(note.stringNumber)
      }, index * 45)
    })
  }

  stopAll() {
    this.active.forEach((oscillator) => {
      try { oscillator.stop() } catch { /* already stopped */ }
    })
    this.active.clear()
  }
}
