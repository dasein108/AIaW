<template>
  <div
    v-if="images && images.length"
    class="post-image-gallery"
  >
    <!-- Single Image Display -->
    <div
      v-if="images.length === 1"
      class="single-image-container"
      @click="openLightbox(0)"
    >
      <q-img
        :src="images[0].url"
        :alt="images[0].alt || 'Post image'"
        :ratio="getSingleImageRatio(images[0])"
        fit="cover"
        loading="lazy"
        class="single-image cursor-pointer rounded-borders"
        :class="{ 'portrait': isPortrait(images[0]), 'landscape': !isPortrait(images[0]) }"
        spinner-color="primary"
        spinner-size="48px"
      >
        <template #loading>
          <div class="absolute-full flex flex-center bg-grey-2">
            <q-spinner-dots
              color="primary"
              size="48px"
            />
          </div>
        </template>
        <template #error>
          <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
            <div class="text-center">
              <q-icon
                name="sym_o_broken_image"
                size="48px"
                class="q-mb-sm"
              />
              <div class="text-caption">
                Failed to load image
              </div>
            </div>
          </div>
        </template>
      </q-img>
    </div>

    <!-- Multiple Images Grid -->
    <div
      v-else
      :class="[
        'image-grid',
        `grid-${Math.min(images.length, maxGridImages)}`
      ]"
    >
      <div
        v-for="(image, index) in displayImages"
        :key="index"
        class="image-container cursor-pointer"
        @click="openLightbox(index)"
      >
        <q-img
          :src="image.url"
          :alt="image.alt || `Image ${index + 1}`"
          :ratio="getGridImageRatio(images.length, index)"
          fit="cover"
          loading="lazy"
          class="grid-image rounded-borders"
          spinner-color="primary"
          spinner-size="32px"
        >
          <template #loading>
            <div class="absolute-full flex flex-center bg-grey-2">
              <q-spinner-dots
                color="primary"
                size="32px"
              />
            </div>
          </template>
          <template #error>
            <div class="absolute-full flex flex-center bg-grey-3 text-grey-6">
              <q-icon
                name="sym_o_broken_image"
                size="32px"
              />
            </div>
          </template>
        </q-img>

        <!-- Overlay for additional images -->
        <div
          v-if="index === maxGridImages - 1 && images.length > maxGridImages"
          class="absolute-full flex flex-center bg-black-50 text-white overlay-more"
        >
          <div class="text-center">
            <div class="text-h6 text-weight-medium">
              +{{ images.length - maxGridImages }}
            </div>
            <div class="text-caption">
              more
            </div>
          </div>
        </div>

        <!-- Image hover overlay -->
        <div class="image-hover-overlay absolute-full flex flex-center opacity-0 bg-black-30 transition-opacity">
          <q-icon
            name="sym_o_zoom_in"
            size="32px"
            color="white"
          />
        </div>
      </div>
    </div>

    <!-- Lightbox Dialog -->
    <q-dialog
      v-model="lightboxOpen"
      maximized
      transition-show="fade"
      transition-hide="fade"
      class="image-lightbox-dialog"
    >
      <div class="lightbox-container bg-black">
        <!-- Header -->
        <div class="lightbox-header absolute-top full-width z-top">
          <q-toolbar class="bg-transparent text-white">
            <q-toolbar-title class="text-caption">
              {{ currentImageIndex + 1 }} of {{ images.length }}
              <span
                v-if="currentImage?.alt"
                class="q-ml-sm"
              >
                - {{ currentImage.alt }}
              </span>
            </q-toolbar-title>
            <q-btn
              flat
              round
              dense
              icon="sym_o_close"
              @click="closeLightbox"
              class="text-white"
            />
          </q-toolbar>
        </div>

        <!-- Main Image -->
        <div class="lightbox-content absolute-full flex flex-center">
          <q-img
            :src="currentImage?.url"
            :alt="currentImage?.alt || `Image ${currentImageIndex + 1}`"
            fit="contain"
            class="lightbox-image"
            spinner-color="white"
            spinner-size="64px"
            @click="closeLightbox"
          >
            <template #loading>
              <div class="absolute-full flex flex-center">
                <q-spinner-dots
                  color="white"
                  size="64px"
                />
              </div>
            </template>
            <template #error>
              <div class="absolute-full flex flex-center text-white">
                <div class="text-center">
                  <q-icon
                    name="sym_o_broken_image"
                    size="64px"
                    class="q-mb-sm"
                  />
                  <div class="text-body1">
                    Failed to load image
                  </div>
                </div>
              </div>
            </template>
          </q-img>
        </div>

        <!-- Navigation Arrows -->
        <div
          v-if="images.length > 1"
          class="lightbox-navigation"
        >
          <q-btn
            v-if="currentImageIndex > 0"
            flat
            round
            size="lg"
            icon="sym_o_chevron_left"
            class="nav-btn nav-btn-left text-white"
            @click="previousImage"
          />
          <q-btn
            v-if="currentImageIndex < images.length - 1"
            flat
            round
            size="lg"
            icon="sym_o_chevron_right"
            class="nav-btn nav-btn-right text-white"
            @click="nextImage"
          />
        </div>

        <!-- Thumbnail Strip -->
        <div
          v-if="images.length > 1 && showThumbnails"
          class="lightbox-thumbnails absolute-bottom full-width"
        >
          <div class="thumbnail-strip q-pa-md">
            <div class="row justify-center q-gutter-xs">
              <div
                v-for="(image, index) in images"
                :key="index"
                class="thumbnail-container cursor-pointer"
                :class="{ 'thumbnail-active': index === currentImageIndex }"
                @click="goToImage(index)"
              >
                <q-img
                  :src="image.url"
                  :alt="image.alt || `Thumbnail ${index + 1}`"
                  ratio="1"
                  fit="cover"
                  class="thumbnail-image rounded-borders"
                  loading="lazy"
                  spinner-size="16px"
                >
                  <template #error>
                    <div class="absolute-full flex flex-center bg-grey-8">
                      <q-icon
                        name="sym_o_broken_image"
                        size="16px"
                        color="grey-5"
                      />
                    </div>
                  </template>
                </q-img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Types
interface PostImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

// Props
const props = withDefaults(defineProps<{
  images: PostImage[]
  maxGridImages?: number
  showThumbnails?: boolean
  aspectRatio?: 'auto' | 'square' | '16:9' | '4:3' | '3:2'
}>(), {
  maxGridImages: 4,
  showThumbnails: true,
  aspectRatio: 'auto'
})

// Emits
const emit = defineEmits<{
  imageClick: [index: number, image: PostImage]
  lightboxOpen: [index: number]
  lightboxClose: []
}>()

// Reactive state
const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

// Computed
const displayImages = computed(() => {
  if (!props.images) return []
  return props.images.slice(0, props.maxGridImages)
})

const currentImage = computed(() => {
  return props.images?.[currentImageIndex.value]
})

// Methods
const isPortrait = (image: PostImage) => {
  if (!image.width || !image.height) return false
  return image.height > image.width
}

const getSingleImageRatio = (image: PostImage) => {
  if (props.aspectRatio !== 'auto') {
    switch (props.aspectRatio) {
      case 'square': return 1
      case '16:9': return 16 / 9
      case '4:3': return 4 / 3
      case '3:2': return 3 / 2
      default: return 16 / 9
    }
  }

  if (image.width && image.height) {
    const ratio = image.width / image.height
    // Constrain extreme ratios for better display
    return Math.max(0.5, Math.min(2.5, ratio))
  }

  // Default to 16:9 for unknown dimensions
  return 16 / 9
}

const getGridImageRatio = (totalImages: number, index: number) => {
  if (props.aspectRatio === 'square') return 1

  // Dynamic ratios based on grid layout
  if (totalImages === 2) return 1
  if (totalImages === 3) {
    return index === 0 ? 4 / 3 : 1
  }
  return 1 // Square for 4+ images grid
}

const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
  emit('imageClick', index, props.images[index])
  emit('lightboxOpen', index)
}

const closeLightbox = () => {
  lightboxOpen.value = false
  emit('lightboxClose')
}

const nextImage = () => {
  if (currentImageIndex.value < props.images.length - 1) {
    currentImageIndex.value++
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const goToImage = (index: number) => {
  currentImageIndex.value = index
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return

  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

// Watch for lightbox state changes to add/remove keyboard listeners
watch(lightboxOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style lang="scss" scoped>
.post-image-gallery {
  .single-image-container {
    .single-image {
      transition: opacity 0.2s ease;
      max-height: 600px;

      &.portrait {
        max-height: 500px;
      }

      &.landscape {
        max-height: 400px;
      }

      &:hover {
        opacity: 0.95;
      }
    }
  }

  .image-grid {
    display: grid;
    gap: 2px;
    border-radius: 8px;
    overflow: hidden;

    &.grid-1 {
      grid-template-columns: 1fr;
    }

    &.grid-2 {
      grid-template-columns: 1fr 1fr;
    }

    &.grid-3 {
      grid-template-columns: 2fr 1fr;
      grid-template-rows: 1fr 1fr;

      .image-container:first-child {
        grid-row: 1 / 3;
      }
    }

    &.grid-4 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
    }

    .image-container {
      position: relative;
      overflow: hidden;

      .grid-image {
        transition: transform 0.2s ease;
      }

      &:hover {
        .grid-image {
          transform: scale(1.02);
        }

        .image-hover-overlay {
          opacity: 1;
        }
      }

      .image-hover-overlay {
        transition: opacity 0.2s ease;
      }

      .overlay-more {
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(2px);
      }
    }
  }
}

// Lightbox styles
.image-lightbox-dialog {
  .lightbox-container {
    position: relative;
    width: 100%;
    height: 100%;

    .lightbox-header {
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
      z-index: 2000;
    }

    .lightbox-content {
      padding: 60px 20px 80px;

      .lightbox-image {
        max-width: 100%;
        max-height: 100%;
        cursor: pointer;
      }
    }

    .lightbox-navigation {
      .nav-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 1000;

        &:hover {
          background: rgba(0, 0, 0, 0.7);
        }

        &.nav-btn-left {
          left: 20px;
        }

        &.nav-btn-right {
          right: 20px;
        }
      }
    }

    .lightbox-thumbnails {
      background: linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, transparent 100%);
      z-index: 2000;

      .thumbnail-strip {
        max-width: 100%;
        overflow-x: auto;

        .thumbnail-container {
          width: 60px;
          height: 60px;
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s ease;

          &:hover {
            border-color: rgba(255, 255, 255, 0.5);
          }

          &.thumbnail-active {
            border-color: white;
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
          }

          .thumbnail-image {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }
}

// Utility classes
.bg-black-30 {
  background-color: rgba(0, 0, 0, 0.3);
}

.bg-black-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.transition-opacity {
  transition: opacity 0.2s ease;
}

// Responsive adjustments
@media (max-width: 600px) {
  .post-image-gallery {
    .single-image-container {
      .single-image {
        max-height: 300px;

        &.portrait {
          max-height: 400px;
        }
      }
    }
  }

  .image-lightbox-dialog {
    .lightbox-container {
      .lightbox-content {
        padding: 50px 10px 60px;
      }

      .lightbox-navigation {
        .nav-btn {
          &.nav-btn-left {
            left: 10px;
          }

          &.nav-btn-right {
            right: 10px;
          }
        }
      }

      .lightbox-thumbnails {
        .thumbnail-container {
          width: 50px;
          height: 50px;
        }
      }
    }
  }
}

// Dark mode adjustments
.body--dark {
  .post-image-gallery {
    .image-grid {
      .image-container {
        .image-hover-overlay {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }
}
</style>
