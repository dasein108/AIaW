type MessageLike = {
  id: string;
  parent_id: string | null;
  is_active: boolean;
}

 type TreeListItem<T extends MessageLike> = {
  message: T;
  index: number;
  siblingMessageMap: Record<string, T>;
  siblingMessageIds: string[];
}

export const getBranchList = <T extends MessageLike>(messageMap: Record<string, T>): Map<string | null, string[]> => {
  const branchListMap: Map<string | null, string[]> = new Map()

  for (const message of Object.values(messageMap)) {
    if (!branchListMap.has(message.parent_id)) {
      branchListMap.set(message.parent_id, [])
    }

    branchListMap.get(message.parent_id)!.push(message.id)
  }

  return branchListMap
}

export const getDialogItemList = <T extends MessageLike>(
  rootId: string | null,
  messageMap: Record<string, T>,
  branchListMap: Map<string | null, string[]>,
  accDialogItems: TreeListItem<T>[]
): TreeListItem<T>[] => {
  const siblingIds = branchListMap.get(rootId)

  if (!siblingIds) {
    return accDialogItems
  }

  const siblings = siblingIds.map(id => messageMap[id])
  const activeSiblingIndex = siblings.findIndex(sibling => sibling.is_active)
  const selectedIndex = activeSiblingIndex === -1 ? 0 : activeSiblingIndex

  const siblingMessageMap = siblings.reduce((acc, sibling) => {
    acc[sibling.id] = sibling

    return acc
  }, {} as Record<string, T>)

  accDialogItems.push({
    message: siblings[selectedIndex],
    index: selectedIndex,
    siblingMessageIds: siblingIds,
    siblingMessageMap
  })

  getDialogItemList(siblings[selectedIndex].id, messageMap, branchListMap, accDialogItems)

  return accDialogItems
}

// Export types for testing
export type { MessageLike, TreeListItem }
