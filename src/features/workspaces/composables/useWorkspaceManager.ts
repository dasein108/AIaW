import { useQuasar } from "quasar"
import { computed, ref, watch, onMounted } from "vue"
import { useI18n } from "vue-i18n"

import { useUserStore } from "@/shared/store"

import { useProfileStore } from "@/features/profile/store"
import { useWorkspacesStore } from "@/features/workspaces/store"

export function useWorkspaceManager() {
  const { t } = useI18n()
  const $q = useQuasar()

  const loading = ref(false)
  const adding = ref<Record<string, boolean>>({})
  const removing = ref<Record<string, boolean>>({})

  const userStore = useUserStore()
  const workspacesStore = useWorkspacesStore()
  const profileStore = useProfileStore()

  // Memoized workspace ownership check with proper dependency tracking
  const workspaceOwnershipMap = computed(() => {
    if (!userStore.currentUserId) return new Map()

    const ownershipMap = new Map<string, boolean>()
    workspacesStore.workspaces.forEach(workspace => {
      // Check both direct ownership and admin membership
      const isDirectOwner = workspace.ownerId === userStore.currentUserId
      const isAdminMember = workspacesStore.isUserWorkspaceRole(workspace.id, userStore.currentUserId) === 'admin'

      // User is considered owner if they are direct owner OR admin member
      ownershipMap.set(workspace.id, isDirectOwner || isAdminMember)
    })

    return ownershipMap
  })

  // Memoized last member check with proper dependency tracking
  const lastMemberMap = computed(() => {
    const memberMap = new Map<string, boolean>()
    Object.entries(workspacesStore.workspaceMembers).forEach(([workspaceId, members]) => {
      memberMap.set(workspaceId, members.length === 1)
    })

    return memberMap
  })

  // Optimized method to get owner name with memoization
  const getOwnerName = computed(() => {
    return (workspace: any): string => {
      if (!workspace.ownerId) return t('common.unknown')

      const ownerProfile = profileStore.profiles[workspace.ownerId]

      return ownerProfile?.name || t('common.unknown')
    }
  })

  // Check if user is owner of a workspace - now using memoized map
  function isWorkspaceOwner(workspace: any): boolean {
    return workspaceOwnershipMap.value.get(workspace.id) || false
  }

  // Check if user is admin of a workspace
  function isWorkspaceAdmin(workspace: any): boolean {
    if (!userStore.currentUserId) return false

    const role = workspacesStore.isUserWorkspaceRole(workspace.id, userStore.currentUserId)

    return role === 'admin' || workspace.ownerId === userStore.currentUserId
  }

  // Check if user is the last member in a workspace - now using memoized map
  function isLastMember(workspaceId: string): boolean {
    return lastMemberMap.value.get(workspaceId) || false
  }

  // Get current user's workspaces with optimized dependency tracking
  const myWorkspaces = computed(() => {
    // Early return if no user - prevents unnecessary computation
    if (!userStore.currentUserId) return []

    // Cache the user ID to avoid repeated access
    const currentUserId = userStore.currentUserId

    // Get joined workspaces with optimized mapping
    const joinedWorkspaces = workspacesStore.getUserAccessibleWorkspaces(currentUserId)
      .map(uw => {
        const workspace = uw.workspace
        const isDirectOwner = workspace.ownerId === currentUserId
        const userRole = workspacesStore.isUserWorkspaceRole(workspace.id, currentUserId)
        const isAdmin = userRole === 'admin'
        const isOwner = isDirectOwner || isAdmin
        const isLast = lastMemberMap.value.get(workspace.id) || false

        // Determine action type based on ownership and membership
        let actionType: 'delete' | 'leave' = 'leave'

        if (isDirectOwner && isLast) {
          // Direct owner and last member - can delete
          actionType = 'delete'
        } else if (isAdmin && isLast) {
          // Admin and last member - can delete
          actionType = 'delete'
        } else {
          // Regular member or not last - can only leave
          actionType = 'leave'
        }

        return {
          ...workspace,
          isJoined: true,
          isOwned: isOwner,
          isAdmin,
          userRole,
          actionType
        }
      })

    return joinedWorkspaces
  })

  // Memoized set of my workspace IDs for efficient lookup
  const myWorkspaceIds = computed(() => {
    return new Set(myWorkspaces.value.map(w => w.id))
  })

  // Get all available workspaces with optimized filtering
  const availableWorkspaces = computed(() => {
    // Early return if no user
    if (!userStore.currentUserId) return []

    const myIds = myWorkspaceIds.value
    const ownershipMap = workspaceOwnershipMap.value

    return workspacesStore.workspaces
      .filter(workspace =>
        !myIds.has(workspace.id) &&
        workspace.isPublic &&
        !ownershipMap.get(workspace.id)
      )
      .map(workspace => ({
        ...workspace,
        isJoined: false,
        isOwned: false,
        actionType: 'join' as const
      }))
  })

  // Stable workspace list that maintains order and updates membership status in place
  const stableWorkspaceList = ref<any[]>([])

  // Initialize stable list on first load or when workspaces change significantly
  function updateStableList() {
    const current = stableWorkspaceList.value
    const my = myWorkspaces.value
    const available = availableWorkspaces.value

    // If this is the first load or the lists have changed dramatically, rebuild
    if (current.length === 0) {
      // 📌 Stable positioning & 📅 Base order: maintain database order (newest first by created_at)
      // 🔝 Joined workspaces (at the top) - COMMENTED OUT
      // 🔽 Available workspaces (at the bottom) - COMMENTED OUT
      // stableWorkspaceList.value = [...my, ...available]

      // Combine all workspaces without sorting by membership status, maintain database order
      const allWorkspaces = [...my, ...available]
      // Sort by original database order (created_at descending) instead of membership status
      stableWorkspaceList.value = allWorkspaces.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      return
    }

    // Update existing items in place without changing order
    const allWorkspaces = [...my, ...available]
    const workspaceMap = new Map(allWorkspaces.map(w => [w.id, w]))

    // Update existing items with new membership status
    stableWorkspaceList.value = stableWorkspaceList.value.map(existing => {
      const updated = workspaceMap.get(existing.id)

      return updated || existing
    })

    // Add any new workspaces that weren't in the stable list
    const existingIds = new Set(stableWorkspaceList.value.map(w => w.id))
    const newWorkspaces = allWorkspaces.filter(w => !existingIds.has(w.id))

    // 📌 Stable positioning: add new workspaces at the end to maintain order
    // 🔝 Joined workspaces (at the top) - COMMENTED OUT
    // const newJoined = newWorkspaces.filter(w => w.isJoined)
    // 🔽 Available workspaces (at the bottom) - COMMENTED OUT
    // const newAvailable = newWorkspaces.filter(w => !w.isJoined)

    // stableWorkspaceList.value = [...newJoined, ...stableWorkspaceList.value, ...newAvailable]
    stableWorkspaceList.value = [...stableWorkspaceList.value, ...newWorkspaces]
  }

  // Watch for workspace changes and update the stable list
  watch([myWorkspaces, availableWorkspaces], updateStableList, { deep: true })

  // Initialize on component mount
  onMounted(() => {
    updateStableList()
  })

  // Optimized filtered workspaces with stable ordering
  const filteredAvailableWorkspaces = computed(() => {
    // Return the stable list which maintains order and updates membership status in place
    return stableWorkspaceList.value
  })

  // Generic handler for workspace actions
  function handleWorkspaceAction(workspace: any) {
    switch (workspace.actionType) {
      case 'join':
        joinWorkspace(workspace)
        break
      case 'leave':
        leaveWorkspace(workspace)
        break
      case 'delete':
        deleteWorkspace(workspace)
        break
    }
  }

  // Actions
  async function joinWorkspace(workspace: any) {
    if (!userStore.currentUserId) {
      $q.notify({
        type: 'negative',
        message: t('common.loginRequired')
      })

      return
    }

    adding.value[workspace.id] = true
    try {
      await workspacesStore.addWorkspaceMember(
        workspace.id,
        userStore.currentUserId,
        'member'
      )
      $q.notify({
        type: 'positive',
        message: t('workspaces.joinSuccess', { name: workspace.name })
      })
    } catch (error) {
      console.error('Failed to join workspace:', error)
      $q.notify({
        type: 'negative',
        message: t('workspaces.joinError')
      })
    } finally {
      adding.value[workspace.id] = false
    }
  }

  async function leaveWorkspace(workspace: any) {
    if (!userStore.currentUserId) return

    $q.dialog({
      title: t('workspaces.leaveConfirmTitle'),
      message: t('workspaces.leaveConfirmMessage', { name: workspace.name }),
      cancel: true,
      persistent: true
    }).onOk(async () => {
      removing.value[workspace.id] = true
      try {
        await workspacesStore.removeWorkspaceMember(
          workspace.id,
          userStore.currentUserId
        )
        $q.notify({
          type: 'positive',
          message: t('workspaces.leaveSuccess', { name: workspace.name })
        })
      } catch (error) {
        console.error('Failed to leave workspace:', error)
        $q.notify({
          type: 'negative',
          message: t('workspaces.leaveError')
        })
      } finally {
        removing.value[workspace.id] = false
      }
    })
  }

  async function deleteWorkspace(workspace: any) {
    if (!userStore.currentUserId) return

    $q.dialog({
      title: t('workspaces.deleteConfirmTitle'),
      message: t('workspaces.deleteConfirmMessage', { name: workspace.name }),
      cancel: true,
      persistent: true
    }).onOk(async () => {
      removing.value[workspace.id] = true
      try {
        await workspacesStore.deleteItem(workspace.id)
        $q.notify({
          type: 'positive',
          message: t('workspaces.deleteSuccess', { name: workspace.name })
        })
      } catch (error) {
        console.error('Failed to delete workspace:', error)
        $q.notify({
          type: 'negative',
          message: t('workspaces.deleteError')
        })
      } finally {
        removing.value[workspace.id] = false
      }
    })
  }

  // Initialize workspace data
  async function initializeWorkspaces() {
    loading.value = true
    try {
      // Make sure all workspace data is loaded
      if (userStore.currentUserId) {
        await workspacesStore.getUserWorkspaces(userStore.currentUserId)
      }

      // Load all profiles to get workspace owner names
      if (!profileStore.isInitialized) {
        await profileStore.fetchProfiles()
      }

      // Force refresh the stable list to ensure proper initial sorting
      forceRefreshStableList()
    } catch (error) {
      console.error('Failed to load workspace data:', error)
    } finally {
      loading.value = false
    }
  }

  // Add a method to force refresh user workspaces (useful for ensuring reactivity)
  async function refreshUserWorkspaces() {
    if (userStore.currentUserId) {
      try {
        await workspacesStore.getUserWorkspaces(userStore.currentUserId)
      } catch (error) {
        console.error('Failed to refresh user workspaces:', error)
      }
    }
  }

  // Force refresh the stable list (useful for page reload or major changes)
  function forceRefreshStableList() {
    stableWorkspaceList.value = []
    updateStableList()
  }

  // Utility function for date formatting
  function formatDate(dateString: string) {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  // Add a debug method to check workspace membership
  function debugWorkspaceMembership(workspace: any) {
    if (process.env.NODE_ENV === 'development') {
      if (!userStore.currentUserId || !workspace?.id) {
        console.log("❌ Missing userId or workspaceId for debug")

        return
      }

      workspacesStore.debugWorkspaceMembership(workspace.id, userStore.currentUserId)
    }
  }

  return {
    // State
    loading,
    adding,
    removing,

    // Computed
    myWorkspaces,
    availableWorkspaces,
    filteredAvailableWorkspaces,
    getOwnerName,

    // Methods
    handleWorkspaceAction,
    joinWorkspace,
    leaveWorkspace,
    deleteWorkspace,
    initializeWorkspaces,
    refreshUserWorkspaces,
    forceRefreshStableList,
    formatDate,
    isWorkspaceOwner,
    isWorkspaceAdmin,
    isLastMember,
    ...(process.env.NODE_ENV === 'development' && { debugWorkspaceMembership })
  }
}
