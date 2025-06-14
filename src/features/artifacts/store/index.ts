import { throttle } from "lodash"
import { defineStore } from "pinia"
import { reactive, computed } from "vue"

import { useUserLoginCallback } from "@/features/auth/composables/useUserLoginCallback"

import { supabase } from "@/services/data/supabase/client"
import { ArtifactMapped } from "@/services/data/supabase/types"

/**
 * Store for managing code and document artifacts
 *
 * This store handles:
 * - Fetching, creating, updating, and deleting artifacts
 * - Organizing artifacts by workspace
 * - Background synchronization of artifact content
 *
 * Artifacts are user-generated or AI-generated code snippets and documents
 * that can be saved and organized within workspaces.
 *
 * @dependencies
 * - {@link useUserLoginCallback} - For initialization after user login
 *
 * @database
 * - Table: "artifacts" - Stores artifact metadata and content
 *
 * @related
 * - Used by {@link artifactsPlugin} for artifact creation from dialogs
 * - Used by {@link EditArtifact} view for artifact editing
 */
export const useArtifactsStore = defineStore("artifacts", () => {
  const workspaceArtifacts = reactive<
    Record<string, Record<string, ArtifactMapped>>
  >({})
  const artifacts = computed(() =>
    Object.values(workspaceArtifacts).flatMap((workspace) =>
      Object.values(workspace)
    )
  )

  const fetchArtifacts = async () => {
    const { data, error } = await supabase.from("artifacts").select("*")

    if (error) {
      console.error(error)
    }

    for (const artifact of data) {
      const artifactMapped = artifact as ArtifactMapped

      if (!(artifactMapped.workspace_id in workspaceArtifacts)) {
        workspaceArtifacts[artifactMapped.workspace_id] = {}
      }

      workspaceArtifacts[artifactMapped.workspace_id][artifact.id] =
        artifactMapped
    }
  }

  async function add (artifact: ArtifactMapped) {
    const { data, error } = await supabase
      .from("artifacts")
      .insert(artifact)
      .select("*")
      .single()

    if (error) {
      console.error(error)
    }

    if (!(data.workspace_id in workspaceArtifacts)) {
      workspaceArtifacts[data.workspace_id] = {}
    }

    workspaceArtifacts[data.workspace_id][data.id] = data as ArtifactMapped

    return data as ArtifactMapped
  }

  // background update with throttle, for "no save button" UI
  const throttledUpdate = throttle((artifact: Partial<ArtifactMapped>) => {
    supabase
      .from("artifacts")
      .update(artifact)
      .eq("id", artifact.id)
      .select("*")
      .single()
      .then((res) => {
        if (res.error) {
          console.error(res.error)
        }
      })
  }, 2000)

  async function update (artifact: Partial<ArtifactMapped>) {
    throttledUpdate(artifact)
    workspaceArtifacts[artifact.workspace_id][artifact.id] = {
      ...workspaceArtifacts[artifact.workspace_id][artifact.id],
      ...artifact,
    } as ArtifactMapped
  }

  async function remove (artifact: Partial<ArtifactMapped>) {
    const { error } = await supabase
      .from("artifacts")
      .delete()
      .eq("id", artifact.id)

    if (error) {
      console.error(error)
    }

    delete workspaceArtifacts[artifact.workspace_id][artifact.id]
  }

  async function init () {
    Object.assign(workspaceArtifacts, {})
    await fetchArtifacts()
  }

  useUserLoginCallback(init)

  return {
    artifacts,
    workspaceArtifacts,
    init,
    add,
    update,
    remove,
  }
})
