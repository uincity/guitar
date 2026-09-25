import type { SoundingNote } from '../types/music'
import type { AudioEngine, StrokeDirection } from './AudioEngine'
import { SynthAudioEngine } from './SynthAudioEngine'

export class SampleAudioEngine implements AudioEngine {
  constructor(private fallback: AudioEngine = new SynthAudioEngine()) {}
  playNote(note: SoundingNote) { return this.fallback.playNote(note) }
  playChord(notes: SoundingNote[], direction?: StrokeDirection, onString?: (stringNumber: number) => void) {
    return this.fallback.playChord(notes, direction, onString)
  }
  stopAll() { this.fallback.stopAll() }
}
