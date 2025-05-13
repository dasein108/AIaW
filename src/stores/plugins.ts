import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk'
import { defineStore } from 'pinia'
import { useLiveQuery } from 'src/composables/live-query'
import { persistentReactive } from 'src/composables/persistent-reactive'
import { db } from 'src/utils/db'
import { GradioPluginManifest, HuggingPluginManifest, InstalledPlugin, McpPluginDump, McpPluginManifest, PluginsData } from 'src/utils/types'
import { buildLobePlugin, timePlugin, defaultData, whisperPlugin, videoTranscriptPlugin, buildGradioPlugin, calculatorPlugin, huggingToGradio, fluxPlugin, lobeDefaultData, gradioDefaultData, emotionsPlugin, docParsePlugin, mermaidPlugin, mcpDefaultData, dumpMcpPlugin, buildMcpPlugin } from 'src/utils/plugins'
import { computed, ref } from 'vue'
import { genId } from 'src/utils/functions'
import artifacts from 'src/utils/artifacts-plugin'
import { IsTauri } from 'src/utils/platform-api'
import { useI18n } from 'vue-i18n'
import webSearchPlugin from 'src/utils/web-search-plugin'
import { keplerPlugin } from 'src/services/kepler/kepler-plugin'
import { supabase } from 'src/services/supabase/client'
import { UserPlugin } from '@/services/supabase/types'

export const usePluginsStore = defineStore('plugins', () => {
  const installedPlugins = ref<UserPlugin[]>([])
  async function fetchPlugins() {
    const { data, error } = await supabase
      .from('user_plugins')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Failed to fetch chats:', error.message)
      return
    }
    installedPlugins.value = data// .map(i => ({ ...i, manifest: i.manifest as PluginManifest }))
    console.log('---installedPlugins.value', installedPlugins.value)
  }

  async function upsertPlugin(plugin: Omit<UserPlugin, 'user_id'>) {
    const { data, error } = await supabase.from('user_plugins').upsert(plugin).select().single()
    if (error) {
      console.error('❌ Failed to put plugin:', error.message)
      return
    }
    installedPlugins.value = installedPlugins.value.map(i => i.id === plugin.id ? data : i)
    return data.id
  }

  async function deletePlugin(id: string) {
    const { error } = await supabase.from('user_plugins').delete().eq('id', id)
    if (error) {
      console.error('❌ Failed to delete plugin:', error.message)
      return
    }
    installedPlugins.value = installedPlugins.value.filter(i => i.id !== id)
  }

  const availableIds = computed(() => installedPlugins.value.filter(i => i.available).map(i => i.id))
  const [data, ready] = persistentReactive<PluginsData>('#plugins-data', defaultData)
  const plugins = computed(() => [
    webSearchPlugin.plugin,
    calculatorPlugin,
    videoTranscriptPlugin,
    whisperPlugin,
    fluxPlugin,
    emotionsPlugin,
    mermaidPlugin,
    docParsePlugin,
    timePlugin,
    keplerPlugin,
    artifacts.plugin,
    ...installedPlugins.value.map(i => {
      if (i.type === 'lobechat') return buildLobePlugin(i.manifest as LobeChatPluginManifest, i.available)
      else if (i.type === 'gradio') return buildGradioPlugin(i.manifest as GradioPluginManifest, i.available)
      else return buildMcpPlugin(i.manifest as McpPluginDump, i.available)
    })
  ])
  console.log('---plugins', plugins.value)
  async function installLobePlugin(manifest: LobeChatPluginManifest) {
    const id = await upsertPlugin({
      key: `lobe-${manifest.identifier}`,
      type: 'lobechat',
      available: true,
      manifest,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    // @ts-expect-error - Dexie transaction doesn't support recursive type inference (LobeChatPluginManifest)
    await db.transaction('rw', db.installedPluginsV2, db.reactives, async () => {
      // const id = `lobe-${manifest.identifier}`
      // await db.installedPluginsV2.put({
      //   id,
      //   key: genId(),
      //   type: 'lobechat',
      //   available: true,
      //   manifest
      // })

      await db.reactives.update('#plugins-data', {
        [`value.${id}`]: lobeDefaultData(manifest)
      })
    })
  }

  async function installGradioPlugin(manifest: GradioPluginManifest) {
    const id = await upsertPlugin({
      key: manifest.id,
      type: 'gradio',
      available: true,
      manifest,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    await db.transaction('rw', db.installedPluginsV2, db.reactives, async () => {
      await db.reactives.update('#plugins-data', {
        [`value.${manifest.id}`]: gradioDefaultData(manifest)
      })
    })
  }

  async function installHuggingPlugin(manifest: HuggingPluginManifest) {
    await installGradioPlugin(huggingToGradio(manifest))
  }

  const { t } = useI18n()
  async function installMcpPlugin(manifest: McpPluginManifest) {
    if (manifest.transport.type === 'stdio' && !IsTauri) throw new Error(t('stores.plugins.stdioRequireDesktop'))
    const dump = await dumpMcpPlugin(manifest)
    const id = await upsertPlugin({
      key: manifest.id,
      type: 'mcp',
      available: true,
      manifest: dump,
    })
    await db.transaction('rw', db.installedPluginsV2, db.reactives, async () => {
      await db.reactives.update('#plugins-data', {
        [`value.${manifest.id}`]: mcpDefaultData(manifest)
      })
    })
  }

  async function uninstall(id) {
    await db.transaction('rw', db.installedPluginsV2, db.assistants, async () => {
      const { error } = await supabase.from('user_plugins').update({ available: false }).eq('id', id)
      if (error) {
        console.error('❌ Failed to uninstall plugin:', error.message)
        return
      }
      await db.assistants.filter(a => !!a.plugins[id]).modify({ [`plugins.${id}`]: undefined })
    })
  }

  async function init() {
    await fetchPlugins()
  }

  return {
    init,
    data,
    ready,
    plugins,
    availableIds,
    installLobePlugin,
    installHuggingPlugin,
    installGradioPlugin,
    installMcpPlugin,
    uninstall
  }
})
