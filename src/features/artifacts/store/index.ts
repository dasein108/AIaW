import { throttle } from "lodash"
import { defineStore } from "pinia"
import { reactive, computed } from "vue"

import { useUserLoginCallback } from "@/features/auth/composables/useUserLoginCallback"

import { supabase } from "@/services/data/supabase/client"
import { Artifact, DbArtifactInsert, mapArtifactToDb } from "@/services/data/types/artifact"

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
    Record<string, Record<string, Artifact>>
  >({})
  const artifacts = computed(() =>
    Object.values(workspaceArtifacts).flatMap((workspace) =>
      Object.values(workspace)
    )
  )

  const fetchArtifacts = async () => {
    const { data, error } = await supabase.from("artifacts").select("*") as { data: Artifact[], error: Error }

    if (error) {
      console.error(error)
    }

    for (const artifact of data) {
      if (!(artifact.workspaceId in workspaceArtifacts)) {
        workspaceArtifacts[artifact.workspaceId] = {} as Record<string, Artifact>
      }

      workspaceArtifacts[artifact.workspaceId][artifact.id] = artifact
    }
  }

  async function add (artifact: Artifact<DbArtifactInsert>) {
    const { data, error } = await supabase
      .from("artifacts")
      .insert(mapArtifactToDb(artifact))
      .select("*")
      .single() as { data: Artifact, error: Error }

    if (error) {
      console.error(error)
    }

    if (!(data.workspaceId in workspaceArtifacts)) {
      workspaceArtifacts[data.workspaceId] = {}
    }

    workspaceArtifacts[data.workspaceId][data.id] = data as Artifact

    return data as Artifact
  }

  // background update with throttle, for "no save button" UI
  const throttledUpdate = throttle((artifact: Partial<Artifact>) => {
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

  async function update (artifact: Partial<Artifact>) {
    throttledUpdate(artifact)
    workspaceArtifacts[artifact.workspaceId][artifact.id] = {
      ...workspaceArtifacts[artifact.workspaceId][artifact.id],
      ...artifact,
    } as Artifact
  }

  async function remove (artifact: Partial<Artifact>) {
    const { error } = await supabase
      .from("artifacts")
      .delete()
      .eq("id", artifact.id)

    if (error) {
      console.error(error)
    }

    delete workspaceArtifacts[artifact.workspaceId][artifact.id]
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
