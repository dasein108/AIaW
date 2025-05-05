/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

// WebCodecs API type declarations
interface AudioEncoderInit {
  output: (chunk: EncodedAudioChunk, metadata?: EncodedAudioChunkMetadata) => void;
  error: (error: Error) => void;
}

interface AudioEncoderConfig {
  codec: string;
  sampleRate: number;
  numberOfChannels: number;
  bitrate?: number;
}

interface AudioDataInit {
  format: string;
  sampleRate: number;
  numberOfChannels: number;
  numberOfFrames: number;
  timestamp: number;
  data: Float32Array;
}

interface AudioData {
  format: string;
  sampleRate: number;
  numberOfChannels: number;
  numberOfFrames: number;
  timestamp: number;
  data: Float32Array;
  close(): void;
}

interface EncodedAudioChunk {
  type: 'key' | 'delta';
  timestamp: number;
  duration?: number;
  data: ArrayBuffer;
}

interface EncodedAudioChunkMetadata {
  decoderConfig?: {
    codec: string;
    sampleRate: number;
    numberOfChannels: number;
  };
}

declare class AudioEncoder {
  constructor(init: AudioEncoderInit);
  configure(config: AudioEncoderConfig): void;
  encode(data: AudioData): void;
  flush(): Promise<void>;
  close(): void;
}

interface Window {
  AudioEncoder: typeof AudioEncoder;
  AudioData: {
    new(init: AudioDataInit): AudioData;
  };
}
