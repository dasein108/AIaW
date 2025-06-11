<template>
  <div class="social-links">
    <q-btn-dropdown
      size="md"

      dropdown-icon="link"
      :disable="disable"
      content-class="social-links-dropdown"
      auto-close
      class="social-links-main-btn"
    >
      <div class="social-links-container">
        <q-btn
          v-for="social in socialLinks"
          :key="social.name"
          round
          :icon="social.icon"
          :color="social.color"
          size="md"
          class="social-link-btn"
          @click="handleLinkClick(social)"
        />
      </div>
    </q-btn-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SocialLink {
  name: string
  label: string
  icon: string
  color: string
  url: string
}

interface Props {
  links?: {
    email?: string
    telegram?: string
    facebook?: string
    whatsapp?: string
    twitter?: string
    github?: string
  }
  disable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  links: () => ({}),
  disable: false
})

const emit = defineEmits<{
  linkClick: [social: SocialLink]
}>()

const socialLinks = computed<SocialLink[]>(() => {
  const defaultLinks = {
    email: 'mailto:contact@example.com',
    telegram: 'https://t.me/username',
    facebook: 'https://facebook.com/username',
    whatsapp: 'https://wa.me/1234567890',
    twitter: 'https://twitter.com/username',
    github: 'https://github.com/username'
  }

  const links = { ...defaultLinks, ...props.links }

  return [
    {
      name: 'Email',
      label: 'Email',
      icon: 'email',
      color: 'red-6',
      url: links.email
    },
    {
      name: 'Telegram',
      label: 'Telegram',
      icon: 'send',
      color: 'blue-6',
      url: links.telegram
    },
    {
      name: 'Facebook',
      label: 'Facebook',
      icon: 'facebook',
      color: 'blue-7',
      url: links.facebook
    },
    {
      name: 'WhatsApp',
      label: 'WhatsApp',
      icon: 'chat',
      color: 'green-6',
      url: links.whatsapp
    },
    {
      name: 'X',
      label: 'X (Twitter)',
      icon: 'alternate_email',
      color: 'grey-9',
      url: links.twitter
    },
    {
      name: 'GitHub',
      label: 'GitHub',
      icon: 'code',
      color: 'grey-8',
      url: links.github
    }
  ].filter(social => social.url) // Only show links that have URLs
})

function handleLinkClick(social: SocialLink) {
  if (social.url) {
    window.open(social.url, '_blank')
  }
  emit('linkClick', social)
}
</script>

<style src="../css/SocialLinks.scss" lang="scss"></style>
