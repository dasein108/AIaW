// This file is being kept for backward compatibility during the refactoring process.
// It re-exports the utils from its new location in the features/media module.
// TODO: Update all imports to reference @/features/media/utils/audioProcess directly and remove this file.

export { AudioEncoderSupported, extractAudioBlob, encodeAudioBlob } from "@/features/media/utils/audioProcess"
