import { useQuasar } from "quasar"
import SaveDialog from "src/components/SaveDialog.vue"
import {
  restoreArtifactChanges,
  saveArtifactChanges,
} from "src/utils/functions"
import { useArtifactsStore, useUserDataStore } from "@/app/store"
import { ArtifactMapped } from "@/services/supabase/types"
export function useCloseArtifact () {
  const $q = useQuasar()
  const artifactsStore = useArtifactsStore()
  const userDataStore = useUserDataStore()

  function closeArtifact (artifact: ArtifactMapped) {
    if (artifact.tmp !== artifact.versions[artifact.curr_index].text) {
      $q.dialog({
        component: SaveDialog,
        componentProps: {
          name: artifact.name,
        },
      }).onOk((save: boolean) => {
        const changes = save
          ? saveArtifactChanges(artifact)
          : restoreArtifactChanges(artifact)
        artifactsStore.update({
          id: artifact.id,
          ...changes,
        })
        userDataStore.data.openedArtifacts =
          userDataStore.data.openedArtifacts.filter((id) => id !== artifact.id)
      })
    } else {
      userDataStore.data.openedArtifacts =
        userDataStore.data.openedArtifacts.filter((id) => id !== artifact.id)
    }
  }

  return { closeArtifact }
}
