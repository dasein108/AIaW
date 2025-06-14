# Media Module

## Overview

The Media module handles all media-related functionality in the AIaW application, including image processing, audio handling, and file management. It provides components and utilities for displaying, managing, and manipulating media files throughout the application.

## Responsibilities

- Processing and displaying images
- Handling audio recording and playback
- Managing file uploads and downloads
- Providing media preview capabilities
- Supporting various media formats
- Offering UI components for media display
- Processing and optimizing media files

## Directory Structure

```
media/
├── components/        # UI components for media handling
├── utils/             # Utility functions for media processing
```

## Key Files

- `components/MessageAudio.vue`: Audio playback component
- `components/MessageFile.vue`: File display component
- `components/MessageImage.vue`: Image display component
- `components/ViewFileDialog.vue`: File preview dialog
- `components/ViewImageDialog.vue`: Image preview dialog
- `components/ImageInputArea.vue`: Image input component
- `utils/audioProcess.ts`: Audio processing utilities
- `utils/imageProcess.ts`: Image processing utilities

## Media Types

The module handles several types of media:

- Images (PNG, JPG, WEBP, GIF, etc.)
- Audio (MP3, WAV, etc.)
- Documents (PDF, DOCX, etc.)
- Code files (various extensions)
- Other file types

## Media Processing

The module provides several processing capabilities:

- Image resizing and optimization
- Audio compression
- Thumbnail generation
- MIME type detection
- File size handling

## Dependencies

The Media module integrates with several other modules:

- **Storage**: For file storage and retrieval
- **Dialogs**: For displaying media in conversations
- **Chats**: For sharing media between users
- **Artifacts**: For handling code and document files

## Usage Examples

### Displaying an Image

```vue
<template>
  <MessageImage :content="imageContent" />
</template>

<script setup lang="ts">
import { MessageImage } from '@/features/media/components';
</script>
```

### Processing an Image

```typescript
import { scaleBlob } from '@/features/media/utils/imageProcess';

const processedImage = await scaleBlob(
  originalBlob,
  { maxWidth: 800, maxHeight: 600 }
);
```

### Handling File Upload

```vue
<template>
  <SelectFileBtn @file-selected="handleFile" />
</template>

<script setup lang="ts">
import { SelectFileBtn } from '@/shared/components/ui';

const handleFile = async (file) => {
  // Process the file
  // Store using storage composable
};
</script>
```

### Viewing a File

```vue
<template>
  <ViewFileDialog
    :file-url="fileUrl"
    :mime-type="mimeType"
    :file-name="fileName"
    v-model="showDialog"
  />
</template>

<script setup lang="ts">
import { ViewFileDialog } from '@/features/media/components';
</script>
```

## Flow Diagram

```
Media Selection → Media Processing → 
Media Storage → Media Retrieval →
Media Display → Media Interaction
```