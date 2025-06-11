import type { Meta, StoryObj } from '@storybook/vue3'
import PostImageGallery from '../components/PostImageGallery.vue'

const meta: Meta<typeof PostImageGallery> = {
  title: 'Social/PostImageGallery',
  component: PostImageGallery,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive image gallery component for displaying images in social media posts.

## Features
- **Single Image Display**: Optimized layout for single images with proper aspect ratio handling
- **Multiple Image Grid**: Smart grid layouts for 2-4+ images with overflow indicator
- **Image Lightbox**: Full-screen modal view with navigation and thumbnails
- **Lazy Loading**: Performance optimization with lazy loading for all images
- **Responsive Design**: Adapts to different screen sizes and orientations
- **Error Handling**: Graceful fallbacks for failed image loads
- **Keyboard Navigation**: Arrow keys and Escape for lightbox navigation
- **Aspect Ratio Control**: Support for different aspect ratios (auto, square, 16:9, 4:3, 3:2)

## Usage
\`\`\`vue
<PostImageGallery
  :images="postImages"
  :max-grid-images="4"
  :show-thumbnails="true"
  aspect-ratio="auto"
  @image-click="handleImageClick"
  @lightbox-open="handleLightboxOpen"
  @lightbox-close="handleLightboxClose"
/>
\`\`\`
        `
      }
    }
  },
  argTypes: {
    images: {
      description: 'Array of image objects with url, alt, width, and height properties',
      control: { type: 'object' }
    },
    maxGridImages: {
      description: 'Maximum number of images to show in grid before showing overflow indicator',
      control: { type: 'number', min: 2, max: 6 }
    },
    showThumbnails: {
      description: 'Whether to show thumbnail strip in lightbox for multiple images',
      control: { type: 'boolean' }
    },
    aspectRatio: {
      description: 'Aspect ratio for single images',
      control: { type: 'select' },
      options: ['auto', 'square', '16:9', '4:3', '3:2']
    },
    onImageClick: {
      description: 'Emitted when an image is clicked',
      action: 'imageClick'
    },
    onLightboxOpen: {
      description: 'Emitted when lightbox opens',
      action: 'lightboxOpen'
    },
    onLightboxClose: {
      description: 'Emitted when lightbox closes',
      action: 'lightboxClose'
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Sample images for stories
const sampleImages = [
  {
    url: 'https://picsum.photos/800/600?random=1',
    alt: 'Beautiful landscape',
    width: 800,
    height: 600
  },
  {
    url: 'https://picsum.photos/600/800?random=2',
    alt: 'Portrait photo',
    width: 600,
    height: 800
  },
  {
    url: 'https://picsum.photos/1200/800?random=3',
    alt: 'Wide panoramic view',
    width: 1200,
    height: 800
  },
  {
    url: 'https://picsum.photos/800/800?random=4',
    alt: 'Square composition',
    width: 800,
    height: 800
  },
  {
    url: 'https://picsum.photos/900/600?random=5',
    alt: 'Nature photography',
    width: 900,
    height: 600
  },
  {
    url: 'https://picsum.photos/700/900?random=6',
    alt: 'Vertical shot',
    width: 700,
    height: 900
  }
]

// Mixed aspect ratio images for testing
const mixedAspectImages = [
  {
    url: 'https://picsum.photos/1600/900?random=10',
    alt: 'Ultra-wide landscape',
    width: 1600,
    height: 900
  },
  {
    url: 'https://picsum.photos/400/600?random=11',
    alt: 'Tall portrait',
    width: 400,
    height: 600
  },
  {
    url: 'https://picsum.photos/800/800?random=12',
    alt: 'Perfect square',
    width: 800,
    height: 800
  },
  {
    url: 'https://picsum.photos/1200/400?random=13',
    alt: 'Panoramic banner',
    width: 1200,
    height: 400
  }
]

// Slow loading images for loading state demonstration
const slowLoadingImages = [
  {
    url: 'https://picsum.photos/800/600?random=20&blur=2',
    alt: 'Slow loading image 1',
    width: 800,
    height: 600
  },
  {
    url: 'https://picsum.photos/600/800?random=21&blur=2',
    alt: 'Slow loading image 2',
    width: 600,
    height: 800
  }
]

export const SingleImage: Story = {
  args: {
    images: [sampleImages[0]],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Single image display with automatic aspect ratio detection. The image maintains its natural proportions while being constrained to reasonable display limits.'
      }
    }
  }
}

export const SingleImagePortrait: Story = {
  args: {
    images: [sampleImages[1]],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Portrait orientation single image. The component automatically detects portrait images and applies appropriate height constraints.'
      }
    }
  }
}

export const TwoImages: Story = {
  args: {
    images: sampleImages.slice(0, 2),
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Two images displayed in a side-by-side grid layout. Both images are given equal space and square aspect ratios for consistency.'
      }
    }
  }
}

export const ThreeImages: Story = {
  args: {
    images: sampleImages.slice(0, 3),
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Three images in an asymmetric grid layout. The first image takes up more space (2:1 ratio) while the other two are stacked on the right.'
      }
    }
  }
}

export const FourImages: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Four images in a 2x2 grid layout. All images are displayed with square aspect ratios for a clean, uniform appearance.'
      }
    }
  }
}

export const ManyImages: Story = {
  args: {
    images: sampleImages,
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'More than 4 images with overflow indicator. The first 4 images are shown in a grid, with the 4th image displaying a "+2 more" overlay. All images are accessible via the lightbox.'
      }
    }
  }
}

export const MixedAspectRatios: Story = {
  args: {
    images: mixedAspectImages,
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Images with dramatically different aspect ratios (ultra-wide, tall portrait, square, panoramic). The component handles these gracefully with intelligent grid layouts.'
      }
    }
  }
}

export const LoadingStates: Story = {
  args: {
    images: slowLoadingImages,
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates loading states with spinner animations. Images are intentionally slow to load to showcase the loading experience.'
      }
    }
  }
}

export const ErrorHandling: Story = {
  args: {
    images: [
      {
        url: 'https://invalid-url-that-will-fail.jpg',
        alt: 'This image will fail to load',
        width: 800,
        height: 600
      },
      sampleImages[0],
      {
        url: 'https://another-invalid-url.png',
        alt: 'Another broken image',
        width: 600,
        height: 800
      }
    ],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates error handling for failed image loads. Broken images show a placeholder with an error icon and message.'
      }
    }
  }
}

export const EmptyGallery: Story = {
  args: {
    images: [],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Empty gallery state - when no images are provided, the component renders nothing gracefully without errors.'
      }
    }
  }
}

export const SquareAspectRatio: Story = {
  args: {
    images: [sampleImages[0]],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'square'
  },
  parameters: {
    docs: {
      description: {
        story: 'Single image forced to square aspect ratio. Useful for maintaining consistent layouts regardless of original image dimensions.'
      }
    }
  }
}

export const SixteenByNineAspectRatio: Story = {
  args: {
    images: [sampleImages[2]],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: '16:9'
  },
  parameters: {
    docs: {
      description: {
        story: 'Single image forced to 16:9 aspect ratio. Perfect for video thumbnails or cinematic content.'
      }
    }
  }
}

export const WithoutThumbnails: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    maxGridImages: 4,
    showThumbnails: false,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple images with thumbnail strip disabled in lightbox. Navigation is still available via arrow buttons and keyboard.'
      }
    }
  }
}

export const CustomMaxGridImages: Story = {
  args: {
    images: sampleImages,
    maxGridImages: 3,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Custom maximum grid images set to 3. The overflow indicator will show "+3 more" for the 6 total images.'
      }
    }
  }
}

export const ResponsiveDemo: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Responsive behavior on mobile devices. Images adapt to smaller screens with adjusted spacing and sizing.'
      }
    }
  }
}

export const Playground: Story = {
  args: {
    images: sampleImages.slice(0, 4),
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  argTypes: {
    images: {
      control: {
        type: 'select',
        options: {
          'Single Image': [sampleImages[0]],
          'Two Images': sampleImages.slice(0, 2),
          'Three Images': sampleImages.slice(0, 3),
          'Four Images': sampleImages.slice(0, 4),
          'Six Images': sampleImages,
          'Mixed Aspect Ratios': mixedAspectImages,
          'With Broken Images': [
            {
              url: 'https://invalid-url.jpg',
              alt: 'Broken image',
              width: 800,
              height: 600
            },
            sampleImages[0],
            sampleImages[1]
          ],
          'Empty Gallery': []
        }
      }
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different configurations. Use the controls panel to experiment with different image sets, aspect ratios, and settings.'
      }
    }
  }
}

export const ExtremeAspectRatios: Story = {
  args: {
    images: [
      {
        url: 'https://picsum.photos/2000/400?random=30',
        alt: 'Ultra-wide banner',
        width: 2000,
        height: 400
      },
      {
        url: 'https://picsum.photos/300/1200?random=31',
        alt: 'Very tall image',
        width: 300,
        height: 1200
      },
      {
        url: 'https://picsum.photos/800/800?random=32',
        alt: 'Square image',
        width: 800,
        height: 800
      }
    ],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests extreme aspect ratios to ensure the component handles edge cases gracefully with proper constraints.'
      }
    }
  }
}

export const AllAspectRatioModes: Story = {
  args: {
    images: [mixedAspectImages[0]],
    maxGridImages: 4,
    showThumbnails: true,
    aspectRatio: 'auto'
  },
  argTypes: {
    aspectRatio: {
      control: { type: 'select' },
      options: ['auto', 'square', '16:9', '4:3', '3:2']
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Test all available aspect ratio modes with the same image to see how each mode affects the display.'
      }
    }
  }
}
