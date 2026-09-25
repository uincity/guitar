import type { SoundingNote } from '../types/music'
import type { AudioEngine, StrokeDirection } from './AudioEngine'
import { resumeSharedAudioContext } from './audioContext'
import { resolveGuitarSample, type ResolvedGuitarSample } from './sampleResolver'
import { SynthAudioEngine } from './SynthAudioEngine'

const STRUM_DELAY_MS = 45
const DEFAULT_VELOCITY = 0.9

export class SampleAudioEngine implements AudioEngine {
  private output: GainNode | null = null
  private bufferCache = new Map<string, Promise<AudioBuffer>>()
  private active = new Set<AudioBufferSourceNode>()
  private warnedFiles = new Set<string>()

  constructor(private fallback: AudioEngine = new SynthAudioEngine()) {}

  private async ready() {
    const context = await resumeSharedAudioContext()
    if (!this.output) {
      this.output = context.createGain()
      this.output.gain.value = 0.42
      this.output.connect(context.destination)
    }
    return context
  }

  async resume() { await this.ready() }

  private loadBuffer(sample: ResolvedGuitarSample) {
    const existing = this.bufferCache.get(sample.url)
    if (existing) return existing
    const loading = this.ready().then(async (context) => {
      const response = await fetch(sample.url)
      if (!response.ok) throw new Error(`HTTP ${response.status} while loading ${sample.sourceFile}`)
      return context.decodeAudioData(await response.arrayBuffer())
    })
    this.bufferCache.set(sample.url, loading)
    return loading
  }

  private warnOnce(sample: ResolvedGuitarSample | null, error: unknown) {
    if (!import.meta.env.DEV) return
    const key = sample?.sourceFile ?? 'unresolved-sample'
    if (this.warnedFiles.has(key)) return
    this.warnedFiles.add(key)
    console.warn(`Nylon guitar sample unavailable (${key}); using synth fallback.`, error)
  }

  async playNote(note: SoundingNote) {
    const sample = resolveGuitarSample({ midi: note.midi, velocity: DEFAULT_VELOCITY, string: note.stringNumber, fret: note.fret })
    if (!sample) {
      this.warnOnce(null, new Error(`No SFZ region for MIDI ${note.midi}`))
      return this.fallback.playNote(note)
    }
    try {
      const [context, buffer] = await Promise.all([this.ready(), this.loadBuffer(sample)])
      const source = context.createBufferSource()
      const gain = context.createGain()
      const now = context.currentTime
      const volumeScale = 10 ** (sample.volumeDb / 20)
      source.buffer = buffer
      source.playbackRate.value = sample.playbackRate
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(DEFAULT_VELOCITY * volumeScale, now + 0.006)
      source.connect(gain).connect(this.output!)
      this.active.add(source)
      source.onended = () => this.active.delete(source)
      source.start(now, sample.offset / context.sampleRate)
    } catch (error) {
      this.warnOnce(sample, error)
      await this.fallback.playNote(note)
    }
  }

  async playChord(notes: SoundingNote[], direction: StrokeDirection = 'down', onString?: (stringNumber: number) => void) {
    await this.resume()
    const ordered = direction === 'down' ? notes : [...notes].reverse()
    ordered.forEach((note, index) => {
      window.setTimeout(() => {
        void this.playNote(note)
        onString?.(note.stringNumber)
      }, index * STRUM_DELAY_MS)
    })
  }

  async preloadNotes(notes: SoundingNote[]) {
    // Do not create/resume an AudioContext before the first user gesture.
    if (!this.output) return
    const uniqueSamples = new Map<string, ResolvedGuitarSample>()
    notes.forEach((note) => {
      const sample = resolveGuitarSample({ midi: note.midi, string: note.stringNumber, fret: note.fret })
      if (sample) uniqueSamples.set(sample.url, sample)
    })
    await Promise.all([...uniqueSamples.values()].map((sample) => this.loadBuffer(sample).catch((error) => this.warnOnce(sample, error))))
  }

  stopAll() {
    this.active.forEach((source) => {
      try { source.stop() } catch { /* Source already ended. */ }
    })
    this.active.clear()
    this.fallback.stopAll()
  }
}
