import { useDialogsStore } from "src/stores/dialogs"
import { computed, Ref, ref, watch } from "vue"
import { useDialogMessages } from "./useDialogMessages"

export const useDialogChain = (dialogId: Ref<string>) => {
  const historyChain = ref<string[]>([])
  const dialogsStore = useDialogsStore()
  const { dialogMessages, dialog } = useDialogMessages(dialogId)

  const chain = computed<string[]>(() =>
    dialogId.value ? getChain(null, dialog.value.msg_route)[0] : []
  )

  async function updateMsgRoute (route) {
    const res = getChain(null, route)
    historyChain.value = res[0]
    await dialogsStore.updateDialog({ id: dialogId.value, msg_route: res[1] })
    // console.log("--useDialogChain updateMsgRoute", route, dialog.value.msg_tree, 'RES', res, 'HC', historyChain.value)
  }

  function getChain (node, route: number[]) {
    const children = dialog.value.msg_tree[node]
    const r = route.at(0) || 0

    if (children[r]) {
      const [restChain, restRoute] = getChain(children[r], route.slice(1))

      return [
        [node, ...restChain],
        [r, ...restRoute],
      ]
    } else {
      return [[node], [r]]
    }
  }

  async function switchChain (index: number, value: number) {
    const route = [...dialog.value.msg_route.slice(0, index), value]
    await updateMsgRoute(route)
  }

  watch([() => dialogMessages.value.length, () => dialog.value?.id], () => {
    dialog.value && updateMsgRoute(dialog.value.msg_route)
  }, { immediate: true })

  // const msgTree = computed(() => dialog.value.msg_tree)
  // const msgRoute = computed(() => dialog.value.msg_route)

  // let lastMsgTree: any = null

  // watch(
  //   () => msgTree.value,
  //   (newVal) => {
  //     if (!messageMap.value || Object.keys(messageMap.value).length === 0) return

  //     if (!isEqual(newVal, lastMsgTree)) {
  //       console.log("---msg_tree",
  //         Object.fromEntries(Object.entries(newVal).map(([k, v]) =>
  //           [messageMap.value[k] ? messageMap.value[k].message_contents[0].text : k, toRaw(v).map(vv => messageMap.value[vv].message_contents[0].text)]))
  //         // Object.fromEntries(Object.entries(newVal).map(([k, v]) =>
  //         // [k ? messageMap.value[k] : k, toRaw(v.map(vv => messageMap.value[vv].message_contents[0].text))])
  //         // )
  //       )
  //       lastMsgTree = JSON.parse(JSON.stringify(newVal)) // deep clone
  //     }
  //   },
  //   { deep: true }
  // )

  // let lastMsgRoute: any = null
  // watch(
  //   () => msgRoute.value,
  //   (newVal) => {
  //     if (!isEqual(newVal, lastMsgRoute)) {
  //       console.log("---msg_route", toRaw(newVal))
  //       lastMsgRoute = JSON.parse(JSON.stringify(newVal)) // deep clone
  //     }
  //   },
  //   { deep: true }
  // )

  return { chain, historyChain, updateMsgRoute, switchChain }
}
