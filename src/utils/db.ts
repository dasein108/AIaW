import Dexie from 'dexie'
import { Workspace, Folder, Dialog, Message, Assistant, Artifact, StoredReactive, InstalledPlugin, AvatarImage, StoredItem, CustomProvider } from './types'
import dexieCloud, { DexieCloudTable } from 'dexie-cloud-addon'
// import { DexieDBURL } from './config'

type Db = Dexie & {
  // workspaces: DexieCloudTable<Workspace | Folder, 'id'>
  dialogs: DexieCloudTable<Dialog, 'id'>
  messages: DexieCloudTable<Message, 'id'>
  // assistants: DexieCloudTable<Assistant, 'id'>
  artifacts: DexieCloudTable<Artifact, 'id'>
  // installedPluginsV2: DexieCloudTable<InstalledPlugin, 'id'>
  reactives: DexieCloudTable<StoredReactive, 'key'>
  avatarImages: DexieCloudTable<AvatarImage, 'id'>
  // items: DexieCloudTable<StoredItem, 'id'>
  providers: DexieCloudTable<CustomProvider, 'id'>
}

const db = new Dexie('data') as Db

db.version(6).stores({
  // workspaces: 'id, type, parentId',
  dialogs: 'id, workspaceId',
  messages: 'id, type, dialogId',
  // assistants: 'id, workspaceId',
  // canvases: 'id, workspaceId', // deprecated
  artifacts: 'id, workspaceId',
  // installedPluginsV2: 'key, id',
  reactives: 'key',
  avatarImages: 'id',
  items: 'id, type, dialogId',
  providers: 'id'
})

const defaultModelSettings = {
  temperature: 0.6,
  topP: 1,
  presencePenalty: 0,
  frequencyPenalty: 0,
  maxSteps: 4,
  maxRetries: 1
}

export { db, defaultModelSettings }
export type { Db }
