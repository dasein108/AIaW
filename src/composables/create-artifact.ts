import { db } from 'src/utils/db'
import { genId } from 'src/utils/functions'
import { Artifact } from 'src/utils/types'
import { Ref } from 'vue'
import { useRouter } from 'vue-router'

export function useCreateArtifact(workspaceId: Ref<string>) {
  const router = useRouter()
  async function createArtifact(props: Partial<Artifact> = {}) {
    const id = genId()
    await db.artifacts.add({
      id,
      name: 'new_artifact',
      versions: [{ date: new Date(), text: '' }],
      currIndex: 0,
      readable: true,
      writable: true,
      open: true,
      workspaceId: workspaceId.value,
      tmp: '',
      ...props
    })
    router.push({ query: { artifactId: id } })
    return id
  }
  return { createArtifact }
}
