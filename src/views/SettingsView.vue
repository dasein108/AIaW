<template>
  <view-common-header @toggle-drawer="$emit('toggle-drawer')">
    <q-toolbar-title>
      {{ $t('settingsView.title') }}
    </q-toolbar-title>
  </view-common-header>
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <q-list
        pb-4
        max-w="1000px"
        mx-a
      >
        <q-item>
          <q-item-section>
            <q-item-label v-if="!isTauri">
              Link Kepler Wallet
            </q-item-label>
            <q-item-label v-else>
              Link Cosmos Wallet
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <kepler-wallet v-if="!isTauri" />
            <cosmos-wallet v-else />
          </q-item-section>
        </q-item>
        <grantee-wallet />
        <q-item-label
          header
          id="default-provider"
        >
          {{ $t('settingsView.defaultProviderHeader') }}
        </q-item-label>
        <provider-input-items v-model="perfs.provider" />
        <q-item v-if="perfs.provider && !perfs.provider.type.startsWith('custom:')">
          <q-item-section>
            <q-item-label>{{ $t('settingsView.shareLinkLabel') }}</q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.shareLinkCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <copy-btn
              :label="$t('settingsView.copyLinkLabel')"
              :value="providerLink"
              flat
              text-pri
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="$emit('toggle-drawer')"
        >
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.customProvider') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.customProviderCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
          v-if="!perfs.provider && LitellmBaseURL"
        >
          {{ $t('settingsView.noProviderConfigured') }}
          <router-link
            pri-link
            to="/account"
          >
            {{ $t('settingsView.accountPage') }}
          </router-link>
          {{ $t('settingsView.pageSuffix') }}
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="default-model"
        >
          {{ $t('settingsView.defaultModelHeader') }}
        </q-item-label>
        <model-input-items v-model="perfs.model" />
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.commonModels') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.commonModelsCaption') }}<br>
              <get-model-list
                :provider
                v-model="perfs.commonModelOptions"
              /> -
              <a
                href="javascript:void(0)"
                @click="sortModels"
                pri-link
              >
                {{ $t('settingsView.sort') }}
              </a>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <models-input
              class="xs:w-250px md:w-400px"
              v-model="perfs.commonModelOptions"
              filled
              dense
            />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="system-assistant"
        >
          {{ $t('settingsView.systemAssistantHeader') }}
        </q-item-label>
        <provider-input-items v-model="perfs.systemProvider" />
        <model-input-items v-model="perfs.systemModel" />
        <q-item-label
          caption
          p="x-4 y-2"
          text-on-sur-var
        >
          {{ $t('settingsView.systemAssistantCaption') }}
        </q-item-label>
        <q-separator spaced />
        <q-item-label
          header
          id="feature"
        >
          {{ $t('settingsView.featureHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>
            <q-item-label>{{ $t('settingsView.autoSummarizeTitle') }}</q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.autoSummarizeCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.autoGenTitle" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.messageSelectionMenu') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.messageSelectionCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.messageSelectionBtn" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.codePasteOptimize') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.codePasteCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.codePasteOptimize" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.quickScrollButton') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.quickScrollCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <platform-enabled-input
              v-model="perfs.dialogScrollBtn"
              class="min-w-120px"
              dense
              filled
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.autoFocusInput') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <platform-enabled-input
              v-model="perfs.autoFocusDialogInput"
              class="min-w-120px"
              dense
              filled
            />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.autoLockBottom') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.streamingLockBottom" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.messageContentCatalog') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.messageContentCatalogCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.messageCatalog" />
          </q-item-section>
        </q-item>
        <q-expansion-item :label="$t('settingsView.artifactsSettings')">
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsView.enableArtifacts') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <platform-enabled-input
                v-model="perfs.artifactsEnabled"
                class="min-w-120px"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsView.autoExtractArtifact') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('settingsView.autoExtractArtifactCaption') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsAutoExtract" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsView.reserveOriginalArtifact') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsReserveOriginal" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsView.autoNameArtifact') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.artifactsAutoName" />
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-separator spaced />
        <q-item-label
          header
          id="operation"
        >
          {{ $t('settingsView.operationHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section>{{ $t('settingsView.sendKeyShortcut') }}</q-item-section>
          <q-item-section side>
            <q-select
              class="w-150px"
              v-model="perfs.sendKey"
              :options="[{ label: 'Ctrl + Enter', value: 'ctrl+enter' }, { label: 'Shift + Enter', value: 'shift+enter' }, { label: 'Enter', value: 'enter' }]"
              filled
              dense
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          to="/settings/shortcut-keys"
        >
          <q-item-section>{{ $t('settingsView.keyboardShortcuts') }}</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
        <q-separator spaced />
        <q-item-label
          header
          id="ui"
        >
          {{ $t('settingsView.uiHeader') }}
        </q-item-label>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_dark_mode" />
          </q-item-section>
          <q-item-section>{{ $t('settingsView.appearance') }}</q-item-section>
          <q-item-section side>
            <q-select
              class="min-w-120px"
              filled
              dense
              :options="darkModeOptions"
              v-model="perfs.darkMode"
              emit-value
              map-options
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickThemeHue"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_palette" />
          </q-item-section>
          <q-item-section>{{ $t('settingsView.themeColor') }}</q-item-section>
          <q-item-section side>
            <hct-preview-circle
              :hue="perfs.themeHue"
              :size="40"
            />
          </q-item-section>
        </q-item>
        <q-item
          clickable
          v-ripple
          @click="pickUserAvatar"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_account_circle" />
          </q-item-section>
          <q-item-section>{{ $t('settingsView.userAvatar') }}</q-item-section>
          <q-item-section
            side
            text-on-sur
          >
            <a-avatar :avatar="perfs.userAvatar" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_report" />
          </q-item-section>
          <q-item-section>
            <q-item-label>
              {{ $t('settingsView.showWarnings') }}
            </q-item-label>
            <q-item-label caption>
              {{ $t('settingsView.showWarningsCaption') }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="perfs.showWarnings" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section avatar>
            <q-icon name="sym_o_language" />
          </q-item-section>
          <q-item-section>{{ $t('settingsView.language') }}</q-item-section>
          <q-item-section side>
            <q-select
              filled
              dense
              :options="langOptions"
              v-model="localData.language"
              emit-value
              map-options
              class="w-120px"
            />
          </q-item-section>
        </q-item>
        <q-expansion-item
          :label="$t('settingsView.markdownRendering')"
          icon="sym_o_markdown"
          :content-inset-level="1"
        >
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsView.theme') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-select
                :options="mdPreviewThemes"
                v-model="perfs.mdPreviewTheme"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsView.codeTheme') }}
            </q-item-section>
            <q-item-section side>
              <q-select
                :options="mdCodeThemes"
                v-model="perfs.mdCodeTheme"
                dense
                filled
              />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              {{ $t('settingsView.disableMermaid') }}
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="perfs.mdNoMermaid" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>
                {{ $t('settingsView.codeAutoFoldThreshold') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('settingsView.codeAutoFoldThresholdCaption') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <a-input
                type="number"
                v-model.number="perfs.mdAutoFoldThreshold"
                dense
                filled
                class="w-120px"
                clearable
              />
            </q-item-section>
          </q-item>
        </q-expansion-item>
        <q-separator spaced />
        <q-item-label
          header
          id="ui"
        >
          {{ $t('settingsView.dataHeader') }}
        </q-item-label>
        <q-item
          clickable
          v-ripple
          @click="restoreSettings"
        >
          <q-item-section avatar>
            <q-icon name="sym_o_restore" />
          </q-item-section>
          <q-item-section>{{ $t('settingsView.restoreDefaultSettings') }}</q-item-section>
          <q-item-section side>
            <q-icon name="sym_o_chevron_right" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import AAvatar from 'src/components/AAvatar.vue'
import CopyBtn from 'src/components/CopyBtn.vue'
import CosmosWallet from 'src/components/CosmosWallet.vue'
import GetModelList from 'src/components/GetModelList.vue'
import HctPreviewCircle from 'src/components/HctPreviewCircle.vue'
import HueSliderDialog from 'src/components/HueSliderDialog.vue'
import KeplerWallet from 'src/components/KeplerWallet.vue'
import ModelDragSortDialog from 'src/components/ModelDragSortDialog.vue'
import ModelInputItems from 'src/components/ModelInputItems.vue'
import ModelsInput from 'src/components/ModelsInput.vue'
import PickAvatarDialog from 'src/components/PickAvatarDialog.vue'
import PlatformEnabledInput from 'src/components/PlatformEnabledInput.vue'
import ProviderInputItems from 'src/components/ProviderInputItems.vue'
import ViewCommonHeader from 'src/components/ViewCommonHeader.vue'
import { useGetModel } from 'src/composables/get-model'
import { useLocateId } from 'src/composables/locate-id'
import { useUserPerfsStore } from 'src/stores/user-perfs'
import { LitellmBaseURL } from 'src/utils/config'
import { pageFhStyle } from 'src/utils/functions'
import { localData } from 'src/utils/local-data'
import { IsTauri } from 'src/utils/platform-api'
import { dialogOptions, mdCodeThemes, mdPreviewThemes } from 'src/utils/values'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import GranteeWallet from '../components/GranteeWallet.vue'
import { useAuthStore } from '../stores/auth'

defineEmits(['toggle-drawer'])

const { t } = useI18n()

const isTauri = computed(() => IsTauri)

const { perfs, restore } = useUserPerfsStore()
const darkModeOptions = [
  { label: t('settingsView.followSystem'), value: 'auto' },
  { label: t('settingsView.light'), value: false },
  { label: t('settingsView.dark'), value: true }
]

const $q = useQuasar()
function pickThemeHue() {
  $q.dialog({
    component: HueSliderDialog,
    componentProps: { value: perfs.themeHue }
  }).onOk(hue => { perfs.themeHue = hue })
}
function pickUserAvatar() {
  $q.dialog({
    component: PickAvatarDialog,
    componentProps: { model: perfs.userAvatar, defaultTab: 'text' }
  }).onOk(avatar => { perfs.userAvatar = avatar })
}
function restoreSettings() {
  $q.dialog({
    title: t('settingsView.restoreDefaultSettings'),
    message: t('settingsView.restoreSettingsConfirmation'),
    cancel: true,
    ...dialogOptions
  }).onOk(() => { restore() })
}
const providerLink = computed(() => {
  if (!perfs.provider) return ''
  return `${window.location.origin}/#/provider/${perfs.provider.settings.id}`
})

const { getProvider } = useGetModel()
const provider = computed(() => getProvider())

const langOptions = [
  { label: t('settingsView.auto'), value: null },
  { label: 'English', value: 'en-US' },
  { label: '简体中文', value: 'zh-CN' },
  { label: '繁體中文', value: 'zh-TW' }
]

function sortModels() {
  const models = perfs.commonModelOptions
  $q.dialog({
    component: ModelDragSortDialog,
    componentProps: { models },
    persistent: true,
    ...dialogOptions
  }).onOk(sortedModels => {
    perfs.commonModelOptions = sortedModels
  })
}

useLocateId(ref(true))

const showPinModal = ref(false)
const authStore = useAuthStore()
const walletInfo = ref(authStore.walletInfo)
const handlePinSubmit = async (pin: string) => {
  walletInfo.value = await authStore.createGranteeWallet(pin)
  showPinModal.value = false
}
</script>
