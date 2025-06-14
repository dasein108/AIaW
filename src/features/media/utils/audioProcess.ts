import { Muxer, ArrayBufferTarget } from "webm-muxer"

const AudioEncoderSupported = "AudioEncoder" in window

async function extractAudioBlob (video: Blob, range?: [number, number]) {
  const buffer = await video.arrayBuffer()
  const audioCtx = new AudioContext()
  let audioBuffer = await audioCtx.decodeAudioData(buffer)

  if (range) {
    audioBuffer = sliceAudioBuffer(audioBuffer, range)
  }

  return await encodeAudioBlob(audioBuffer)
}

function sliceAudioBuffer (
  audioBuffer: AudioBuffer,
  [start, end]: [number, number]
) {
  const channels = audioBuffer.numberOfChannels
  const rate = audioBuffer.sampleRate
  const startOffset = rate * start
  const endOffset = rate * end
  const frameCount = endOffset - startOffset
  const newAudioBuffer = new AudioContext().createBuffer(
    channels,
    frameCount,
    rate
  )
  const tmpArray = new Float32Array(frameCount)
  for (let channel = 0; channel < channels; channel++) {
    audioBuffer.copyFromChannel(tmpArray, channel, startOffset)
    newAudioBuffer.copyToChannel(tmpArray, channel, 0)
  }

  return newAudioBuffer
}

async function encodeAudioBlob (audioBuffer: AudioBuffer) {
  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    audio: {
      codec: "A_OPUS",
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate: audioBuffer.sampleRate,
    },
  })
  const audioEncoder = new window.AudioEncoder({
    output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
    error: console.error,
  })
  audioEncoder.configure({
    codec: "opus",
    sampleRate: audioBuffer.sampleRate,
    numberOfChannels: audioBuffer.numberOfChannels,
    bitrate: 96_000,
  })
  const signal = bufferToF32Planar(audioBuffer)
  audioEncoder.encode(
    new window.AudioData({
      format: "f32-planar",
      sampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      numberOfFrames: audioBuffer.length,
      timestamp: 0,
      data: signal,
    })
  )
  await audioEncoder.flush()
  muxer.finalize()
  const { buffer } = muxer.target

  return new Blob([buffer], { type: "audio/webm" })
}

/**
 * Convert an audio buffer into a planar float 32 array
 * @param input processed audio buffer
 * @returns Typed array
 */
function bufferToF32Planar (input: AudioBuffer) {
  const result = new Float32Array(input.length * input.numberOfChannels)

  let offset = 0
  for (let i = 0; i < input.numberOfChannels; i++) {
    const data = input.getChannelData(i)
    result.set(data, offset)
    offset = data.length
  }

  return result
}

export { AudioEncoderSupported, extractAudioBlob, encodeAudioBlob }
