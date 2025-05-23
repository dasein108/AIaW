import Dexie from 'dexie'
import { StoredReactive } from './types'
import { DexieCloudTable } from 'dexie-cloud-addon'

type Db = Dexie & {
  reactives: DexieCloudTable<StoredReactive, 'key'>
}

const db = new Dexie('data') as Db

db.version(6).stores({
  reactives: 'key',
})

export { db }
export type { Db }
