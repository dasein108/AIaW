<template>
  <div class="social-share">
    <q-btn
      round
      color="primary"
      icon="share"
      @click="showDialog = true"
      :disable="disable"
    >
      <q-tooltip>Share</q-tooltip>
    </q-btn>

    <q-dialog
      v-model="showDialog"
      persistent
    >
      <q-card class="social-share-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            Share
          </div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="social-icons-container">
            <div
              class="social-icon-item"
              v-for="social in socialOptions"
              :key="social.name"
            >
              <q-btn
                round
                :color="social.color"
                :icon="social.icon"
                size="lg"
                class="social-icon-btn"
                @click="handleShare(social)"
              >
                <q-tooltip>{{ social.label }}</q-tooltip>
              </q-btn>
              <div class="social-label">
                {{ social.name }}
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface SocialOption {
  name: string
  label: string
  icon: string
  color: string
  url: string
}

interface Props {
  url?: string
  title?: string
  text?: string
  disable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  url: '',
  title: '',
  text: '',
  disable: false
})

const emit = defineEmits<{
  share: [social: SocialOption, url: string]
}>()

const showDialog = ref(false)

const socialOptions = computed<SocialOption[]>(() => [
  {
    name: 'Email',
    label: 'Share via email',
    icon: 'email',
    color: 'red-6',
    url: `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(props.text + ' ' + props.url)}`
  },
  {
    name: 'Telegram',
    label: 'Share via Telegram',
    icon: 'send',
    color: 'blue-6',
    url: `https://t.me/share/url?url=${encodeURIComponent(props.url)}&text=${encodeURIComponent(props.text)}`
  },
  {
    name: 'Facebook',
    label: 'Share on Facebook',
    icon: 'facebook',
    color: 'blue-7',
    url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`
  },
  {
    name: 'WhatsApp',
    label: 'Share on WhatsApp',
    icon: 'chat',
    color: 'green-6',
    url: `https://wa.me/?text=${encodeURIComponent(props.text + ' ' + props.url)}`
  },
  {
    name: 'X',
    label: 'Share on X (Twitter)',
    icon: 'alternate_email',
    color: 'grey-9',
    url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(props.text)}&url=${encodeURIComponent(props.url)}`
  },
  {
    name: 'GitHub',
    label: 'Share on GitHub',
    icon: 'code',
    color: 'grey-8',
    url: 'https://github.com'
  }
])

function handleShare(social: SocialOption) {
  if (social.name === 'Embed') {
    // Handle embed code copy
    const embedCode = `<iframe src="${props.url}" width="600" height="400"></iframe>`
    navigator.clipboard?.writeText(embedCode)
    showDialog.value = false
    return
  }

  if (social.name === 'Kaka') {
    // Handle Kakao sharing (would need Kakao SDK)
    console.log('Kakao sharing not implemented')
    showDialog.value = false
    return
  }

  if (social.url) {
    window.open(social.url, '_blank', 'width=600,height=400')
  }

  emit('share', social, social.url)
  showDialog.value = false
}
</script>
