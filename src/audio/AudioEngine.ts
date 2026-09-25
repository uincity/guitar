import type { SoundingNote } from '../types/music'

export type StrokeDirection = 'down' | 'up'

export interface AudioEngine {
  playNote(note: SoundingNote): Promise<void>
  playChord(notes: SoundingNote[], direction?: StrokeDirection, onString?: (stringNumber: number) => void): Promise<void>
  resume(): Promise<void>
  preloadNotes(notes: SoundingNote[]): Promise<void>
  stopAll(): void
}
