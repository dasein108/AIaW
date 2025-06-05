<template>
  <view-common-header
    @toggle-drawer="$emit('toggle-drawer')"
    back-to="."
  >
    <q-toolbar-title>
      {{ $t('pluginSettings.title') }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container v-if="plugin">
    <q-page
      bg-sur
      pb-2
    >
      <q-list>
        <q-item-label header>
          {{ $t('pluginSettings.info') }}
        </q-item-label>
        <q-item>
          <q-item-section>{{ $t('pluginSettings.name') }}</q-item-section>
          <q-item-section side>
            {{ plugin.title }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section min-w="fit">
            {{ $t('pluginSettings.description') }}
          </q-item-section>
          <q-item-section side>
            <q-item-label caption>
              {{ plugin.description }}
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item v-if="plugin.author">
          <q-item-section>{{ $t('pluginSettings.author') }}</q-item-section>
          <q-item-section side>
            {{ plugin.author }}
          </q-item-section>
        </q-item>
        <q-item v-if="plugin.homepage">
          <q-item-section>{{ $t('pluginSettings.homepage') }}</q-item-section>
          <q-item-section side>
            <a
              pri-link
              :href="plugin.homepage"
              target="_blank"
            >
              {{ plugin.homepage }}
            </a>
          </q-item-section>
        </q-item>
        <q-item
          clickable
          @click="pickAvatar"
        >
          <q-item-section>{{ $t('pluginSettings.icon') }}</q-item-section>
          <q-item-section
            side
            text-on-sur
          >
            <a-avatar :avatar="plugin.data.avatar" />
          </q-item-section>
        </q-item>
        <template v-if="plugin.fileparsers.length">
          <q-separator spaced />
          <q-item>
            <q-item-section text-sec>
              {{ $t('pluginSettings.fileParsing') }}
            </q-item-section>
            <q-item-section side>
              <div>
                {{ $t('pluginSettings.enable') }}
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-for="fp of plugin.fileparsers"
            :key="fp.name"
          >
            <q-item-section avatar>
              <q-item-label>{{ fp.name }}</q-item-label>
              <q-item-label caption>
                {{ fp.description }}
              </q-item-label>
            </q-item-section>
            <q-item-section items-end>
              <list-input
                v-if="plugin.data.fileparsers?.[fp.name]?.mimeTypes"
                :label="$t('pluginSettings.mimeType')"
                class="xs:w-200px sm:w-250px"
                filled
                dense
                v-model="plugin.data.fileparsers[fp.name].mimeTypes"
                new-value-mode="add-unique"
              />
            </q-item-section>
            <q-item-section
              side
              v-if="plugin.data.fileparsers?.[fp.name]?.enabled"
            >
              <q-checkbox v-model="plugin.data.fileparsers[fp.name].enabled" />
            </q-item-section>
          </q-item>
        </template>
        <q-separator spaced />
        <q-item-label header>
          {{ $t('pluginSettings.settings') }}
        </q-item-label>
        <json-input
          :schema="plugin.settings"
          v-model="plugin.data.settings"
          component="item"
          lazy
        />
      </q-list>
    </q-page>
  </q-page-container>
  <error-not-found v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePluginsStore } from 'src/stores/plugins'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import AAvatar from 'src/components/AAvatar.vue'
import { useQuasar } from 'quasar'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import ListInput from 'src/components/ListInput.vue'
import JsonInput from 'src/components/JsonInput.vue'
import { useSetTitle } from 'src/composables/set-title'

const props = defineProps<{
  id: string
}>()

defineEmits(['toggle-drawer'])

const pluginsStore = usePluginsStore()
// const { data } = pluginsStore

const plugin = computed(() => pluginsStore.plugins.find(p => p.id === props.id))
console.log('plugin', props.id, plugin.value)
const $q = useQuasar()
function pickAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: {
      model: plugin.value?.data.avatar,
      defaultTab: 'icon'
    }
  }).onOk(avatar => {
    plugin.value.data.avatar = avatar
  })
}

import { useI18n } from 'vue-i18n'
const { t } = useI18n()
useSetTitle(computed(() => plugin.value && `${t('pluginSettings.title')} - ${plugin.value.title}`))
</script>
