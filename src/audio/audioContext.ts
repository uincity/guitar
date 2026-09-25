type SafariWindow = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }

let sharedContext: AudioContext | null = null

export const getSharedAudioContext = () => {
  if (sharedContext) return sharedContext
  const browserWindow = window as SafariWindow
  const AudioContextConstructor = browserWindow.AudioContext ?? browserWindow.webkitAudioContext
  if (!AudioContextConstructor) throw new Error('Web Audio API is not supported in this browser')
  sharedContext = new AudioContextConstructor()
  return sharedContext
}

export const resumeSharedAudioContext = async () => {
  const context = getSharedAudioContext()
  if (context.state === 'suspended') await context.resume()
  return context
}
