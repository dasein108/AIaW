<template>
  <router-view @toggle-drawer="drawerOpen = !drawerOpen" />
  <q-page-container>
    <q-page :style-fn="pageFhStyle">
      <div>
        <h3>Cyberlinks</h3>
        <q-list
          v-if="cyberlinks"
          bordered
          separator
        >
          <q-item
            v-for="link in cyberlinks"
            :key="link.id"
          >
            <q-item-section>
              <q-item-label>{{ link.value }}</q-item-label>
              <q-item-label caption>
                {{ link.fid }} | {{ link.type }} |
                {{ new Date(link.created_at).toLocaleString() }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-inner-loading :showing="loading" />
        <div v-if="error">
          {{ error }}
        </div>
      </div>
    </q-page>
  </q-page-container>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar"
import { useCallApi } from "src/composables/call-api"
import { useActiveWorkspace } from "src/composables/workspaces/useActiveWorkspace"
import { getLocalStorageWalletState } from "src/services/kepler/KeplerWallet"
import { useAuthStore } from "src/stores/auth"
import { usePluginsStore } from "src/stores/plugins"
import { IsTauri } from "src/utils/platform-api"
import { computed, provide, ref, onMounted, watch } from "vue"

const pageFhStyle = (offset: number, height: number) => ({
  height: `${height - offset}px`,
  overflowY: "auto",
})

const cyberlinks = ref()
const loading = ref(false)
const error = ref<string | null>(null)

const drawerOpen = ref(false)
const drawerBreakpoint = 960
const $q = useQuasar()
const rightDrawerAbove = computed(() => $q.screen.width > drawerBreakpoint)
provide("rightDrawerAbove", rightDrawerAbove)

const pluginsStore = usePluginsStore()
const { workspace } = useActiveWorkspace()
const { callApi } = useCallApi(workspace, ref(null))
const authStore = useAuthStore()

onMounted(async () => {
  loading.value = true
  error.value = null

  if (!pluginsStore.isLoaded) {
    await new Promise<void>((resolve) => {
      const stop = watch(
        () => pluginsStore.isLoaded,
        (loaded) => {
          if (loaded) {
            stop()
            resolve()
          }
        }
      )
    })
  }

  let owner: string | undefined

  if (authStore.granterSigner) {
    const accounts = await authStore.granterSigner.getAccounts()
    owner = accounts[0]?.address
  } else if (!IsTauri) {
    const walletState = getLocalStorageWalletState()
    owner = walletState.address
  }

  if (!owner) {
    error.value = "User not logged in. Please connect your wallet."
    loading.value = false

    return
  }

  const pluginWithTool = pluginsStore.plugins.find((p) =>
    p.apis.some((a) => a.name === "query_cyberlinks")
  )

  if (pluginWithTool) {
    const api = pluginWithTool.apis.find((a) => a.name === "query_cyberlinks")

    if (api) {
      const { result, error: apiError } = await callApi(
        pluginWithTool,
        api,
        { owner }
      )

      if (apiError) {
        error.value = `Error loading cyberlinks: ${apiError}`
        console.error(error.value)
      } else if (
        result &&
        result[0] &&
        result[0].type === "text" &&
        result[0].contentText
      ) {
        try {
          cyberlinks.value = JSON.parse(result[0].contentText)
        } catch (e) {
          error.value = "Failed to parse cyberlinks data."
          console.error(e)
        }
      } else {
        error.value = "Received unexpected data format for cyberlinks."
        console.error("Unexpected result format:", result)
      }
    } else {
      error.value = "query_cyberlinks API not found on the plugin."
      console.error(error.value)
    }
  } else {
    error.value =
      "No plugin with the 'query_cyberlinks' tool is available or enabled."
    console.error(error.value)
  }

  loading.value = false
})
</script>
