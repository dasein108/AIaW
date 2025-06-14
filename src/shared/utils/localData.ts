import { localReactive } from "@/shared/composables/localReactive"

interface LocalData {
  lastReloadTimestamp: number | null
  visited: boolean
  language: "en-US" | null
  ignoredUpdate: string
}

const localData = localReactive<LocalData>("local-data", {
  lastReloadTimestamp: null,
  visited: false,
  language: null,
  ignoredUpdate: null,
})

export { localData }
