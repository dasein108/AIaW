import { MdPreviewProps } from 'md-editor-v3'
import { defineStore } from 'pinia'
import { Dark } from 'quasar'
import { Avatar, Model, PlatformEnabled, Provider, ShortcutKey } from 'src/utils/types'
import { models } from 'src/utils/values'
import { reactive, ref, watch, watchEffect } from 'vue'
import { UserDataMapped } from '@/services/supabase/types'
import { supabase } from 'src/services/supabase/client'
import { CODE_NO_RECORD_FOUND } from 'src/services/supabase/consts'
import { useUserStore } from './user'
import { isEqual, throttle, cloneDeep } from 'lodash'
import { useUserLoginCallback } from 'src/composables/auth/useUserLoginCallback'
import { createUserDataStore } from './createUserDataStore'

interface Perfs {
  darkMode: boolean | 'auto'
  themeHue: number
  provider: Provider
  model: Model
  systemProvider: Provider
  systemModel: Model
  userAvatar: Avatar
  commonModelOptions: string[]
  autoGenTitle: boolean
  sendKey: 'ctrl+enter' | 'shift+enter' | 'enter'
  messageSelectionBtn: boolean
  codePasteOptimize: boolean
  dialogScrollBtn: PlatformEnabled
  enableShortcutKey: PlatformEnabled
  scrollUpKeyV2?: ShortcutKey
  scrollDownKeyV2?: ShortcutKey
  scrollTopKey?: ShortcutKey
  scrollBottomKey?: ShortcutKey
  switchPrevKeyV2?: ShortcutKey
  switchNextKeyV2?: ShortcutKey
  switchFirstKey?: ShortcutKey
  switchLastKey?: ShortcutKey
  regenerateCurrKey?: ShortcutKey
  editCurrKey?: ShortcutKey
  createDialogKey?: ShortcutKey
  createSocialKey?: ShortcutKey
  focusDialogInputKey?: ShortcutKey
  saveArtifactKey?: ShortcutKey
  searchDialogKey?: ShortcutKey
  searchChatsKey?: ShortcutKey
  autoFocusDialogInput: PlatformEnabled
  artifactsEnabled: PlatformEnabled
  artifactsAutoExtract: boolean
  artifactsAutoName: boolean
  artifactsReserveOriginal: boolean
  mdPreviewTheme: MdPreviewProps['previewTheme']
  mdCodeTheme: MdPreviewProps['codeTheme']
  mdNoMermaid: MdPreviewProps['noMermaid']
  mdAutoFoldThreshold?: MdPreviewProps['autoFoldThreshold']
  streamingLockBottom: boolean
  messageCatalog: boolean
  showWarnings: boolean
}

const defaultPerfs: Perfs = {
  darkMode: 'auto',
  themeHue: 300,
  provider: null,
  model: models.find(m => m.name === 'gpt-4.1'),
  systemProvider: null,
  systemModel: models.find(m => m.name === 'gpt-4o-mini'),
  userAvatar: {
    type: 'text',
    text: 'U',
    hue: 300
  },
  commonModelOptions: [
    'gpt-4.1',
    'gpt-4.1-mini',
    'o4-mini',
    'claude-3-7-sonnet-20250219',
    'claude-3-5-sonnet-20241022',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'deepseek-chat',
    'deepseek-reasoner'
  ],
  autoGenTitle: true,
  sendKey: 'ctrl+enter',
  messageSelectionBtn: true,
  codePasteOptimize: true,
  dialogScrollBtn: 'always',
  enableShortcutKey: 'desktop-only',
  scrollUpKeyV2: { key: 'ArrowUp', withCtrl: true },
  scrollDownKeyV2: { key: 'ArrowDown', withCtrl: true },
  scrollTopKey: { key: 'ArrowUp', withShift: true },
  scrollBottomKey: { key: 'ArrowDown', withShift: true },
  switchPrevKeyV2: { key: 'ArrowLeft', withCtrl: true },
  switchNextKeyV2: { key: 'ArrowRight', withCtrl: true },
  switchFirstKey: { key: 'ArrowLeft', withShift: true },
  switchLastKey: { key: 'ArrowRight', withShift: true },
  regenerateCurrKey: null,
  editCurrKey: null,
  createDialogKey: null,
  createSocialKey: null,
  focusDialogInputKey: null,
  saveArtifactKey: { key: 'KeyS', withCtrl: true },
  searchDialogKey: null,
  searchChatsKey: null,
  autoFocusDialogInput: 'desktop-only',
  artifactsEnabled: 'desktop-only',
  artifactsAutoExtract: false,
  artifactsAutoName: false,
  artifactsReserveOriginal: false,
  mdPreviewTheme: 'vuepress',
  mdCodeTheme: 'atom',
  mdNoMermaid: false,
  mdAutoFoldThreshold: null,
  streamingLockBottom: true,
  messageCatalog: true,
  showWarnings: false
}

const USER_PERFS_KEY = 'perfs'

export const useUserPerfsStore = () => {
  const store = createUserDataStore<Perfs>('user-perfs', defaultPerfs)()

  watchEffect(() => {
    console.log('darkMode', store.data.darkMode)
    Dark.set(store.data.darkMode)
  })
  return store
}
// export const useUserPerfsStore = defineStore('user-perfs', () => {
//   const perfs = reactive<Perfs>(defaultPerfs)
//   const ready = ref(false)
//   const userStore = useUserStore()
//   const lastPerfsSnapshot = ref(cloneDeep(perfs))

//   const fetchPerfs = async () => {
//     const { data, error } = await supabase.from('user_data').select('*').eq('key', USER_PERFS_KEY).single()
//     if (error) {
//       if (error.code === CODE_NO_RECORD_FOUND) {
//         await addPerfs(defaultPerfs)
//       } else {
//         console.error(error)
//         return
//       }
//     } else {
//       Object.assign(perfs, data.value as Perfs)
//     }

//     ready.value = true
//   }

//   const init = async () => {
//     Object.assign(perfs, defaultPerfs)
//     await fetchPerfs()
//   }

//   useUserLoginCallback(init)

//   const addPerfs = async (value:Perfs) => {
//     const { data, error } = await supabase.from('user_data').insert({ user_id: userStore.currentUserId, key: USER_PERFS_KEY, value }).select().single()
//     if (data) {
//       Object.assign(perfs, data.value as Perfs)
//     }
//   }

//   const updatePerfs = async (value: Perfs) => {
//     const { data, error } = await supabase.from('user_data').upsert({ key: USER_PERFS_KEY, value })
//       .eq('key', USER_PERFS_KEY).eq('user_id', userStore.currentUserId).select().single()

//     if (data) {
//       Object.assign(perfs, data.value as Perfs)
//     }
//     if (error) {
//       console.error(error)
//     }
//   }

//   const restore = () => {
//     Object.assign(perfs, defaultPerfs)
//     updatePerfs(perfs)
//   }

//   const throttledUpdate = throttle((perfs: Perfs) => {
//     updatePerfs(perfs)
//   }, 2000)

//   watch(perfs, () => {
//     if (!ready.value) return
//     if (!isEqual(perfs, lastPerfsSnapshot.value)) {
//       throttledUpdate(perfs)
//       lastPerfsSnapshot.value = cloneDeep(perfs)
//     }
//   }, { deep: true })

//   watchEffect(() => {
//     Dark.set(perfs.darkMode)
//   })

//   return { perfs, ready, init, restore }
// })
