<template>
  <view-common-header no-drawer>
    <q-toolbar-title>
      {{ $t("accountPage.accountTitle") }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container>
    <q-page
      :style-fn="pageFhStyle"
      v-if="authStore.isAuthenticated && authStore.user"
    >
      <q-list
        pb-2
        max-w="1000px"
        mx-a
      >
        <q-item-label header>
          {{ $t("accountPage.infoHeader") }}
        </q-item-label>
        <q-item>
          <q-item-section>
            {{ $t("accountPage.emailLabel") }}
          </q-item-section>
          <q-item-section side>
            {{ authStore.user.email }}
          </q-item-section>
        </q-item>
        <q-item v-if="authStore.user.phone">
          <q-item-section>
            {{ $t("accountPage.phoneLabel") }}
          </q-item-section>
          <q-item-section side>
            {{ authStore.user.phone }}
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item>
          <q-item-section>
            {{ $t("accountPage.name") }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="profile.name"
              filled
              clearable
              autogrow
              placeholder="Name..."
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t("accountPage.description") }}
          </q-item-section>
          <q-item-section>
            <q-input
              v-model="profile.description"
              autogrow
              filled
              clearable
              placeholder="Description..."
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickAvatar"
        >
          <q-item-section>
            {{ $t("accountPage.avatar") }}
          </q-item-section>
          <q-item-section side>
            <a-avatar :avatar="getUserAvatar()" />
          </q-item-section>
        </q-item>

        <!-- Связанные аккаунты -->
        <q-separator spaced />
        <q-item-label header>
          {{ $t("accountPage.linkedAccounts") }}
        </q-item-label>
        <q-item
          v-for="account in authStore.user.linked_accounts"
          :key="account.type"
        >
          <q-item-section avatar>
            <q-icon :name="getAccountIcon(account.type)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ getAccountLabel(account.type) }}</q-item-label>
            <q-item-label caption>
              {{ account.username || account.email || account.subject }}
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />
        <q-item
          clickable
          v-ripple
          @click="signOut"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_logout" />
          </q-item-section>
          <q-item-section>{{ $t("auth.logout") }}</q-item-section>
        </q-item>
      </q-list>
    </q-page>

    <!-- Страница для неавторизованных пользователей -->
    <q-page
      v-else
      :style-fn="pageFhStyle"
      class="flex flex-center"
    >
      <div class="text-center">
        <q-icon
          name="sym_o_person"
          size="4rem"
          class="text-grey-6 q-mb-md"
        />
        <div class="text-h6 q-mb-md">
          {{ $t("accountPage.notLoggedIn") }}
        </div>
        <p class="text-grey-7 q-mb-lg">
          {{ $t("accountPage.loginRequired") }}
        </p>
        <privy-account-btn />
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import AAvatar from "@/shared/components/avatar/AAvatar.vue"
import PickAvatarDialog from "@/shared/components/avatar/PickAvatarDialog.vue"
import { syncRef } from "@/shared/composables/syncRef"
import { pageFhStyle } from "@/shared/utils/functions"

import PrivyAccountBtn from "@/features/auth/components/PrivyAccountBtn.vue"
import { usePrivyAuthStore } from "@/features/auth/store/privyAuth"
import { useProfileStore } from "@/features/profile/store"

import ViewCommonHeader from "@/layouts/components/ViewCommonHeader.vue"

const { t } = useI18n()
const authStore = usePrivyAuthStore()
const profileStore = useProfileStore()
const router = useRouter()
const $q = useQuasar()

// Используем ID пользователя из Privy вместо старого useUserStore
const currentUserId = computed(() => authStore.user?.id || '')
const currentProfile = computed(
  () => profileStore.profiles[currentUserId.value]
)

const profile = syncRef(
  currentProfile,
  (val) => {
    if (val && currentUserId.value) {
      profileStore.put(val)
    }
  },
  { valueDeep: true }
)

function getUserAvatar() {
  // Пытаемся получить аватар из профиля пользователя
  if (profile.value?.avatar) {
    return profile.value.avatar
  }

  // Пытаемся получить аватар из социальных аккаунтов
  const linkedAccounts = authStore.user?.linked_accounts || []

  // Ищем аватар из Google
  const googleAccount = linkedAccounts.find((account: any) =>
    account.type === 'google_oauth'
  )

  if (googleAccount?.avatar_url) {
    return googleAccount.avatar_url
  }

  // Ищем аватар из Discord
  const discordAccount = linkedAccounts.find((account: any) =>
    account.type === 'discord_oauth'
  )

  if (discordAccount?.avatar_url) {
    return discordAccount.avatar_url
  }

  // Ищем аватар из GitHub
  const githubAccount = linkedAccounts.find((account: any) =>
    account.type === 'github_oauth'
  )

  if (githubAccount?.avatar_url) {
    return githubAccount.avatar_url
  }

  // Возвращаем дефолтный аватар или первую букву email
  const email = authStore.user?.email

  if (email) {
    return email.charAt(0).toUpperCase()
  }

  return "U" // Default user icon
}

function getAccountIcon(accountType: string) {
  const icons: Record<string, string> = {
    google_oauth: 'sym_o_account_circle',
    discord_oauth: 'sym_o_discord',
    twitter_oauth: 'sym_o_alternate_email',
    github_oauth: 'sym_o_code',
    email: 'sym_o_email',
    phone: 'sym_o_phone',
  }

  return icons[accountType] || 'sym_o_account_circle'
}

function getAccountLabel(accountType: string) {
  const labels: Record<string, string> = {
    google_oauth: 'Google',
    discord_oauth: 'Discord',
    twitter_oauth: 'Twitter',
    github_oauth: 'GitHub',
    email: 'Email',
    phone: 'Phone',
  }

  return labels[accountType] || accountType
}

async function signOut() {
  try {
    await authStore.logout()
    $q.notify({
      type: 'positive',
      message: t('auth.logoutSuccess')
    })
    router.replace("/")
  } catch (error) {
    console.error('Logout error:', error)
    $q.notify({
      type: 'negative',
      message: t('auth.logoutError')
    })
  }
}

function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: {
      model: getUserAvatar(),
      defaultTab: "icon"
    },
  }).onOk((avatar) => {
    if (profile.value) {
      profile.value.avatar = avatar
    }
  })
}
</script>
