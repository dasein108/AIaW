import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import PostCard from '../components/PostCardWithGallery.vue'

const meta: Meta<typeof PostCard> = {
  title: 'Social/PostCard',
  component: PostCard,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'The PostCard component displays social media posts with support for text content, images, file attachments, and interactive features like likes, comments, and shares. It supports both compact and detailed variants.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    post: {
      description: 'The post object containing content, author, and metadata',
      control: { type: 'object' }
    },
    variant: {
      description: 'Display variant of the post card',
      control: { type: 'select' },
      options: ['compact', 'detailed']
    },
    currentUserId: {
      description: 'ID of the current user for determining ownership and permissions',
      control: { type: 'text' }
    },
    imageAspectRatio: {
      description: 'Aspect ratio for single images',
      control: { type: 'select' },
      options: ['auto', 'square', '16:9', '4:3', '3:2']
    }
  },
  args: {
    variant: 'detailed',
    currentUserId: 'user-1',
    imageAspectRatio: 'auto',
    // Mock event handlers - using the correct event names from PostCardWithGallery
    onLike: fn(),
    onUnlike: fn(),
    onComment: fn(),
    onShare: fn(),
    onBookmark: fn(),
    onUnbookmark: fn(),
    onAuthorClick: fn(),
    onImageClick: fn(),
    onImageView: fn(),
    onDelete: fn(),
    onReport: fn()
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Sample data
const sampleAuthor = {
  id: 'user-1',
  name: 'John Doe',
  username: 'johndoe',
  avatar: {
    type: 'text',
    text: 'JD',
    hue: 200
  }
}

const sampleAuthor2 = {
  id: 'user-2',
  name: 'Sarah Wilson',
  username: 'sarahw',
  avatar: {
    type: 'text',
    text: 'SW',
    hue: 120
  }
}

const sampleAuthor3 = {
  id: 'user-3',
  name: 'Mike Chen',
  username: 'mikechen',
  avatar: {
    type: 'text',
    text: 'MC',
    hue: 300
  }
}

const sampleAuthor4 = {
  id: 'user-4',
  name: 'Dr. Emily Rodriguez',
  username: 'emilyrod',
  avatar: {
    type: 'text',
    text: 'ER',
    hue: 60
  }
}

const sampleImages = [
  {
    url: 'https://picsum.photos/800/600?random=1',
    alt: 'Beautiful landscape'
  },
  {
    url: 'https://picsum.photos/800/600?random=2',
    alt: 'City skyline'
  },
  {
    url: 'https://picsum.photos/800/600?random=3',
    alt: 'Nature scene'
  },
  {
    url: 'https://picsum.photos/800/600?random=4',
    alt: 'Architecture'
  },
  {
    url: 'https://picsum.photos/800/600?random=5',
    alt: 'Street art'
  }
]

// Basic Stories
export const Default: Story = {
  args: {
    post: {
      id: 'post-1',
      content: 'Just had an amazing day exploring the city! The weather was perfect and I discovered some incredible street art. #citylife #streetart #photography',
      author: sampleAuthor,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      images: [sampleImages[0]],
      stats: {
        likes: 42,
        comments: 8,
        shares: 3
      },
      location: 'New York, NY',
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A default post card with text content, single image, location, and engagement stats.'
      }
    }
  }
}

export const TextOnlyPost: Story = {
  args: {
    post: {
      id: 'post-text-only',
      content: 'Sometimes the best moments are the ones you don\'t capture on camera. Just finished a wonderful conversation with an old friend over coffee. ☕️ #friendship #moments #coffee',
      author: sampleAuthor3,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      stats: {
        likes: 23,
        comments: 5,
        shares: 1
      },
      isLiked: true,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A text-only post without any images or attachments, showing how the component handles pure text content.'
      }
    }
  }
}

export const SingleImagePost: Story = {
  args: {
    post: {
      id: 'post-single-image',
      content: 'Caught this amazing sunset from my balcony tonight. Nature never fails to amaze me! 🌅',
      author: sampleAuthor2,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      images: [sampleImages[1]],
      stats: {
        likes: 156,
        comments: 12,
        shares: 8
      },
      location: 'San Francisco, CA',
      isLiked: false,
      isBookmarked: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with a single image, demonstrating the optimal image display ratio and layout.'
      }
    }
  }
}

export const MultipleImagesPost: Story = {
  args: {
    post: {
      id: 'post-multiple-images',
      content: 'Had an incredible weekend getaway! Here are some highlights from our trip. The views were absolutely breathtaking and the company was even better. Already planning our next adventure! 🏔️✨',
      author: sampleAuthor,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      images: sampleImages,
      stats: {
        likes: 128,
        comments: 24,
        shares: 12
      },
      location: 'Mountain View, CA',
      isLiked: false,
      isBookmarked: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with multiple images showing the grid layout and overflow indicator for more than 4 images.'
      }
    }
  }
}

export const PostWithFileAttachments: Story = {
  args: {
    post: {
      id: 'post-with-files',
      content: 'Sharing my latest research findings on sustainable energy solutions. The attached documents contain detailed analysis and recommendations. Looking forward to your feedback! 📊📋 #research #sustainability #energy\n\nNote: File attachments would be displayed here if the Post interface included an attachments property.',
      author: sampleAuthor4,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      stats: {
        likes: 89,
        comments: 15,
        shares: 7
      },
      location: 'Stanford University',
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post that would have file attachments. Note: File attachment support would need to be added to the Post interface and PostCard component implementation.'
      }
    }
  }
}

export const LongContentWithTruncation: Story = {
  args: {
    variant: 'compact',
    post: {
      id: 'post-long-content',
      content: 'Today I want to share some thoughts about the importance of taking breaks and disconnecting from technology. In our fast-paced world, we often forget to slow down and appreciate the simple moments. I recently took a week-long digital detox and it was incredibly refreshing. I rediscovered the joy of reading physical books, having face-to-face conversations without distractions, and simply observing the world around me. The experience reminded me that while technology is a powerful tool, it should enhance our lives rather than consume them. I encourage everyone to try taking small breaks from their devices and see how it affects their well-being. You might be surprised by what you discover about yourself and the world when you\'re not constantly connected. This journey of self-discovery has taught me valuable lessons about mindfulness, presence, and the importance of human connection in our digital age. #digitaldetox #mindfulness #wellbeing #balance #selfcare #mentalhealth',
      author: sampleAuthor2,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      stats: {
        likes: 89,
        comments: 15,
        shares: 7
      },
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with long content that gets truncated in compact mode, showing the "Show more" functionality.'
      }
    }
  }
}

// Interaction States
export const LikedAndBookmarkedPost: Story = {
  args: {
    post: {
      id: 'post-liked-bookmarked',
      content: 'This post has been liked and bookmarked by the current user. Notice the filled heart and bookmark icons.',
      author: sampleAuthor3,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      images: [sampleImages[2]],
      stats: {
        likes: 67,
        comments: 12,
        shares: 8
      },
      isLiked: true,
      isBookmarked: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post showing the liked and bookmarked states with filled icons and appropriate colors.'
      }
    }
  }
}

export const HighEngagementPost: Story = {
  args: {
    post: {
      id: 'post-high-engagement',
      content: 'Breaking: Major breakthrough in renewable energy technology! This could change everything. What are your thoughts? 🌱⚡️',
      author: sampleAuthor4,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      images: [sampleImages[3]],
      stats: {
        likes: 1247,
        comments: 89,
        shares: 156
      },
      location: 'Stanford, CA',
      isLiked: true,
      isBookmarked: true
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with high engagement numbers, demonstrating how large numbers are formatted (K, M notation).'
      }
    }
  }
}

export const OwnPost: Story = {
  args: {
    currentUserId: 'user-1',
    post: {
      id: 'post-own',
      content: 'Excited to announce that I\'ll be speaking at the upcoming tech conference! Looking forward to sharing insights about modern web development. #speaking #webdev #conference',
      author: sampleAuthor,
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      images: [sampleImages[4]],
      stats: {
        likes: 67,
        comments: 12,
        shares: 8
      },
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post owned by the current user, showing the delete option in the menu and different interaction possibilities.'
      }
    }
  }
}

// Variant Stories
export const CompactVariant: Story = {
  args: {
    variant: 'compact',
    post: {
      id: 'post-compact',
      content: 'Quick update: Working on something exciting! Can\'t wait to share more details soon. Stay tuned! 🚀',
      author: sampleAuthor,
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), // 30 minutes ago
      stats: {
        likes: 15,
        comments: 2
      },
      isLiked: true,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'The compact variant of the post card with reduced padding and simplified layout, ideal for feeds or smaller screens.'
      }
    }
  }
}

// Loading and Error States
export const LoadingState: Story = {
  args: {
    post: {
      id: 'post-loading',
      content: 'This post is loading its images...',
      author: sampleAuthor,
      createdAt: new Date().toISOString(),
      images: [
        {
          url: 'https://httpstat.us/200?sleep=5000', // Simulates slow loading
          alt: 'Loading image'
        }
      ],
      stats: {
        likes: 0,
        comments: 0,
        shares: 0
      },
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with images in loading state, showing skeleton placeholders while images load.'
      }
    }
  }
}

export const ErrorState: Story = {
  args: {
    post: {
      id: 'post-error',
      content: 'This post has images that failed to load, demonstrating the error state handling.',
      author: sampleAuthor,
      createdAt: new Date().toISOString(),
      images: [
        {
          url: 'https://httpstat.us/404', // Simulates failed image load
          alt: 'Failed to load image'
        },
        {
          url: 'https://httpstat.us/500', // Another failed image
          alt: 'Another failed image'
        }
      ],
      stats: {
        likes: 5,
        comments: 1,
        shares: 0
      },
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post with images that failed to load, showing the broken image icon and error handling.'
      }
    }
  }
}

// Interactive Testing Story
export const Interactive: Story = {
  args: {
    post: {
      id: 'post-interactive',
      content: 'This is an interactive post card. Try clicking the like, comment, share, and bookmark buttons to see the events in the Actions panel below. You can also click on the author avatar or images.',
      author: sampleAuthor,
      createdAt: new Date().toISOString(),
      images: [sampleImages[0], sampleImages[1]],
      stats: {
        likes: 10,
        comments: 3,
        shares: 1
      },
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'An interactive post for testing all the event handlers and user interactions. Check the Actions panel to see fired events.'
      }
    },
    actions: {
      handles: [
        'like',
        'unlike',
        'comment',
        'share',
        'bookmark',
        'unbookmark',
        'authorClick',
        'imageClick',
        'delete',
        'report'
      ]
    }
  }
}

// Edge Cases
export const MinimalPost: Story = {
  args: {
    post: {
      id: 'post-minimal',
      content: '👋',
      author: {
        id: 'user-minimal',
        name: 'Anonymous'
      },
      createdAt: new Date().toISOString(),
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A minimal post with just emoji content and basic author info, testing the component with minimal data.'
      }
    }
  }
}

export const NoStatsPost: Story = {
  args: {
    post: {
      id: 'post-no-stats',
      content: 'This post has no engagement stats yet. Perfect for new posts or when stats are not available.',
      author: sampleAuthor2,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      isLiked: false,
      isBookmarked: false
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'A post without any engagement statistics, showing how the component handles missing stats data.'
      }
    }
  }
}
