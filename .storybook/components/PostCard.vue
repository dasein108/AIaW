<template>
  <q-card
    :class="[
      'post-card',
      variant === 'compact' ? 'compact-card' : 'detailed-card',
      $q.dark.isActive ? 'bg-dark' : 'bg-white'
    ]"
    flat
    bordered
  >
    <!-- Post Header -->
    <q-card-section
      class="post-header"
      horizontal
    >
      <div class="row items-center full-width">
        <a-avatar
          v-if="post.author?.avatar"
          :avatar="post.author.avatar"
          :size="variant === 'compact' ? '40px' : '48px'"
          class="q-mr-md cursor-pointer"
          @click="onAuthorClick"
        />
        <div class="col">
          <div class="text-subtitle1 text-weight-medium">
            {{ post.author?.name || 'Anonymous' }}
          </div>
          <div class="text-caption text-grey-6">
            {{ formatDate(post.createdAt) }}
            <span
              v-if="post.location"
              class="q-ml-sm"
            >
              <q-icon
                name="sym_o_location_on"
                size="14px"
              />
              {{ post.location }}
            </span>
          </div>
        </div>
        <q-btn
          icon="sym_o_more_vert"
          flat
          round
          dense
          size="sm"
          class="text-grey-6"
          @click="showPostMenu"
        >
          <q-menu>
            <q-list dense>
              <q-item
                clickable
                @click="sharePost"
              >
                <q-item-section avatar>
                  <q-icon name="sym_o_share" />
                </q-item-section>
                <q-item-section>Share</q-item-section>
              </q-item>
              <q-item
                clickable
                @click="reportPost"
              >
                <q-item-section avatar>
                  <q-icon name="sym_o_flag" />
                </q-item-section>
                <q-item-section>Report</q-item-section>
              </q-item>
              <q-item
                v-if="isOwnPost"
                clickable
                @click="deletePost"
              >
                <q-item-section avatar>
                  <q-icon
                    name="sym_o_delete"
                    color="negative"
                  />
                </q-item-section>
                <q-item-section class="text-negative">
                  Delete
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-card-section>

    <!-- Post Content -->
    <q-card-section
      v-if="post.content"
      class="post-content"
    >
      <div
        v-if="variant === 'detailed' || !isContentTruncated"
        class="text-body1"
        v-html="formattedContent"
      />
      <div
        v-else
        class="text-body1"
      >
        {{ truncatedContent }}
        <q-btn
          flat
          dense
          no-caps
          color="primary"
          class="q-ml-xs"
          @click="expandContent"
        >
          Show more
        </q-btn>
      </div>
    </q-card-section>

    <!-- Post Images -->
    <q-card-section
      v-if="post.images?.length"
      class="post-images q-pa-none"
    >
      <div
        :class="[
          'image-grid',
          `images-${Math.min(post.images.length, 4)}`
        ]"
      >
        <div
          v-for="(image, index) in displayImages"
          :key="index"
          class="image-container cursor-pointer"
          @click="viewImage(index)"
        >
          <q-img
            :src="image.url"
            :alt="image.alt || `Image ${index + 1}`"
            :ratio="getImageRatio(post.images.length, index)"
            fit="cover"
            loading="lazy"
            class="rounded-borders"
          >
            <template #loading>
              <q-skeleton height="200px" />
            </template>
            <template #error>
              <div class="absolute-full flex flex-center bg-grey-3">
                <q-icon
                  name="sym_o_broken_image"
                  size="48px"
                  color="grey-5"
                />
              </div>
            </template>
          </q-img>
          <div
            v-if="index === 3 && post.images.length > 4"
            class="absolute-full flex flex-center bg-black-50 text-white text-h6"
          >
            +{{ post.images.length - 4 }}
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Post Stats (for detailed variant) -->
    <q-card-section
      v-if="variant === 'detailed' && (post.stats?.likes || post.stats?.comments || post.stats?.shares)"
      class="post-stats q-py-sm"
    >
      <div class="row items-center text-caption text-grey-6">
        <span
          v-if="post.stats?.likes"
          class="q-mr-md"
        >
          <q-icon
            name="sym_o_favorite"
            size="16px"
            class="q-mr-xs"
          />
          {{ formatCount(post.stats.likes) }}
        </span>
        <span
          v-if="post.stats?.comments"
          class="q-mr-md"
        >
          {{ formatCount(post.stats.comments) }} comments
        </span>
        <span v-if="post.stats?.shares">
          {{ formatCount(post.stats.shares) }} shares
        </span>
      </div>
    </q-card-section>

    <!-- Action Buttons -->
    <q-separator v-if="variant === 'detailed'" />
    <q-card-actions class="post-actions">
      <q-btn
        icon="sym_o_favorite"
        :label="variant === 'detailed' ? 'Like' : ''"
        color="grey-6"
        flat
        no-caps
        class="action-btn"
      >
        <q-tooltip
          v-if="variant === 'compact'"
          :delay="1000"
        >
          Like
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="sym_o_chat_bubble_outline"
        :label="variant === 'detailed' ? 'Comment' : ''"
        color="grey-6"
        flat
        no-caps
        class="action-btn"
        aria-label="Comment on this post"
        @click="openComments"
      >
        <q-tooltip
          v-if="variant === 'compact'"
          :delay="1000"
        >
          Comment
        </q-tooltip>
      </q-btn>
      <q-btn
        icon="sym_o_share"
        :label="variant === 'detailed' ? 'Share' : ''"
        color="grey-6"
        flat
        no-caps
        class="action-btn"
        aria-label="Share this post"
        @click="sharePost"
      >
        <q-tooltip
          v-if="variant === 'compact'"
          :delay="1000"
        >
          Share
        </q-tooltip>
      </q-btn>
      <q-space v-if="variant === 'detailed'" />
      <q-btn
        icon="sym_o_bookmark"
        color="grey-6"
        flat
        round
        dense
        class="bookmark-btn"
      >
        <q-tooltip
          :delay="1000"
        >
          Bookmark
        </q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import AAvatar from '../AAvatar.vue'

// Types
interface PostAuthor {
  id: string
  name: string
  avatar?: any
  username?: string
}

interface PostImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

interface PostStats {
  likes?: number
  comments?: number
  shares?: number
}

interface Post {
  id: string
  content?: string
  author?: PostAuthor
  createdAt: string
  images?: PostImage[]
  stats?: PostStats
  location?: string
}

// Props
const props = withDefaults(defineProps<{
  post: Post
  variant?: 'compact' | 'detailed'
  currentUserId?: string
}>(), {
  variant: 'detailed'
})

// Emits
const emit = defineEmits<{
  comment: [postId: string]
  share: [postId: string]
  authorClick: [authorId: string]
  imageClick: [imageIndex: number, images: PostImage[]]
  delete: [postId: string]
  report: [postId: string]
}>()

// Composables
const $q = useQuasar()

// Reactive state
const isContentExpanded = ref(false)

// Computed
const isOwnPost = computed(() =>
  props.currentUserId && props.post.author?.id === props.currentUserId
)

const formattedContent = computed(() => {
  if (!props.post.content) return ''
  // Basic formatting - convert URLs to links, mentions, hashtags
  return props.post.content
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-primary">$1</a>')
    .replace(/@(\w+)/g, '<span class="text-primary cursor-pointer">@$1</span>')
    .replace(/#(\w+)/g, '<span class="text-secondary cursor-pointer">#$1</span>')
})

const truncatedContent = computed(() => {
  if (!props.post.content) return ''
  const maxLength = 150
  return props.post.content.length > maxLength
    ? props.post.content.substring(0, maxLength) + '...'
    : props.post.content
})

const isContentTruncated = computed(() =>
  props.post.content && props.post.content.length > 150 && !isContentExpanded.value
)

const displayImages = computed(() => {
  if (!props.post.images) return []
  return props.post.images.slice(0, 4)
})

// Methods
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Just now'
  if (diffInHours < 24) return `${diffInHours}h`
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d`
  return date.toLocaleDateString()
}

const formatCount = (count: number) => {
  if (count < 1000) return count.toString()
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
  return `${(count / 1000000).toFixed(1)}M`
}

const getImageRatio = (totalImages: number, index: number) => {
  if (totalImages === 1) return 16 / 9
  if (totalImages === 2) return 1
  if (totalImages === 3) return index === 0 ? 4 / 3 : 1
  return 1
}

const expandContent = () => {
  isContentExpanded.value = true
}

const openComments = () => {
  emit('comment', props.post.id)
}

const sharePost = () => {
  emit('share', props.post.id)
}

const onAuthorClick = () => {
  if (props.post.author?.id) {
    emit('authorClick', props.post.author.id)
  }
}

const viewImage = (index: number) => {
  if (props.post.images) {
    emit('imageClick', index, props.post.images)
  }
}

const showPostMenu = () => {
  // Menu is handled by q-menu in template
}

const deletePost = () => {
  $q.dialog({
    title: 'Delete Post',
    message: 'Are you sure you want to delete this post? This action cannot be undone.',
    cancel: true,
    persistent: true
  }).onOk(() => {
    emit('delete', props.post.id)
  })
}

const reportPost = () => {
  $q.dialog({
    title: 'Report Post',
    message: 'Why are you reporting this post?',
    options: {
      type: 'radio',
      model: '',
      items: [
        { label: 'Spam', value: 'spam' },
        { label: 'Inappropriate content', value: 'inappropriate' },
        { label: 'Harassment', value: 'harassment' },
        { label: 'False information', value: 'false_info' },
        { label: 'Other', value: 'other' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk((reason) => {
    emit('report', props.post.id)
    $q.notify({
      message: 'Post reported successfully',
      type: 'positive',
      position: 'top'
    })
  })
}
</script>

<style lang="scss">
// Import PostCard component styles
@import '../css/PostCard.scss';
</style>
