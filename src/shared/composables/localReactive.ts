import { LocalStorage } from "quasar"
import { watch, reactive } from "vue"

export function localReactive<T extends object> (key: string, value: T) {
  const val = reactive({
    ...value,
    ...((LocalStorage.getItem(key) as T) || {}),
  })
  let flag = false
  watch(val, () => {
    if (flag) {
      flag = false

      return
    }

    LocalStorage.setItem(key, val)
  })
  addEventListener("storage", (event) => {
    if (event.key === key) {
      flag = true
      Object.assign(val, LocalStorage.getItem(key) as T)
    }
  })

  return val
}
