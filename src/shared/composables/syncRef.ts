import { Ref, ref, watch, WatchSource } from "vue"

export function syncRef<T> (
  source: WatchSource<T>,
  set: (value: T) => void,
  options?: {
    sourceDeep?: boolean
    valueDeep?: boolean
    initialValue?: T
  }
) {
  const val = ref(options?.initialValue) as Ref<T>
  let flag = false
  watch(
    val,
    (newVal) => {
      if (flag) {
        flag = false

        return
      }

      set(newVal)
    },
    { deep: options?.valueDeep }
  )
  watch(
    source,
    (newVal) => {
      flag = true
      val.value = newVal
    },
    { immediate: true, deep: options?.sourceDeep }
  )

  return val
}
