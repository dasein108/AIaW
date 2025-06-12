import { getBranchList, getDialogItemList } from './dialogTreeUtils'

describe('dialogTreeUtils', () => {
  describe('getBranchList', () => {
    it('should create a branch list map from message map', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true },
        msg2: { id: 'msg2', parent_id: 'msg1', is_active: true },
        msg3: { id: 'msg3', parent_id: 'msg1', is_active: false },
        msg4: { id: 'msg4', parent_id: 'msg2', is_active: true }
      }

      const result = getBranchList(messageMap)
      expect(result.get(null)).toEqual(['msg1'])
      expect(result.get('msg1')).toEqual(['msg2', 'msg3'])
      expect(result.get('msg2')).toEqual(['msg4'])
    })

    it('should handle empty message map', () => {
      const messageMap = {}
      const result = getBranchList(messageMap)
      expect(result.size).toBe(0)
    })

    it('should handle single message with no parent', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true }
      }

      const result = getBranchList(messageMap)
      expect(result.get(null)).toEqual(['msg1'])
      expect(result.size).toBe(1)
    })

    it('should group multiple root messages', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true },
        msg2: { id: 'msg2', parent_id: null, is_active: false }
      }

      const result = getBranchList(messageMap)
      expect(result.get(null)).toEqual(['msg1', 'msg2'])
    })
  })

  describe('getDialogItemList', () => {
    it('should build dialog item list following active path', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true },
        msg2: { id: 'msg2', parent_id: 'msg1', is_active: true },
        msg3: { id: 'msg3', parent_id: 'msg1', is_active: false },
        msg4: { id: 'msg4', parent_id: 'msg2', is_active: true }
      }

      const branchListMap = getBranchList(messageMap)
      const result = getDialogItemList(null, messageMap, branchListMap, [])
      console.log(result)

      expect(result).toHaveLength(3)
      expect(result[0].message.id).toBe('msg1')
      expect(result[0].index).toBe(0)
      expect(result[0].siblingMessageIds).toEqual(['msg1'])

      expect(result[1].message.id).toBe('msg2')
      expect(result[1].index).toBe(0)
      expect(result[1].siblingMessageIds).toEqual(['msg2', 'msg3'])

      expect(result[2].message.id).toBe('msg4')
      expect(result[2].index).toBe(0)
      expect(result[2].siblingMessageIds).toEqual(['msg4'])
    })

    it('should select correct sibling when active is not first', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: false },
        msg2: { id: 'msg2', parent_id: null, is_active: true },
        msg3: { id: 'msg3', parent_id: 'msg2', is_active: true }
      }

      const branchListMap = getBranchList(messageMap)
      const result = getDialogItemList(null, messageMap, branchListMap, [])

      expect(result).toHaveLength(2)
      expect(result[0].message.id).toBe('msg2')
      expect(result[0].index).toBe(1)
      expect(result[0].siblingMessageIds).toEqual(['msg1', 'msg2'])
    })

    it('should handle case with no children', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true }
      }

      const branchListMap = getBranchList(messageMap)
      const result = getDialogItemList(null, messageMap, branchListMap, [])

      expect(result).toHaveLength(1)
      expect(result[0].message.id).toBe('msg1')
    })

    it('should return empty array when no siblings found for root', () => {
      const messageMap = {}
      const branchListMap = new Map()
      const result = getDialogItemList('nonexistent', messageMap, branchListMap, [])

      expect(result).toHaveLength(0)
    })

    it('should default to first sibling when no active sibling found', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: false },
        msg2: { id: 'msg2', parent_id: null, is_active: false }
      }

      const branchListMap = getBranchList(messageMap)
      const result = getDialogItemList(null, messageMap, branchListMap, [])

      expect(result).toHaveLength(1)
      expect(result[0].message.id).toBe('msg1')
      expect(result[0].index).toBe(0)
    })

    it('should handle complex branching tree', () => {
      const messageMap = {
        root: { id: 'root', parent_id: null, is_active: true },
        branch1: { id: 'branch1', parent_id: 'root', is_active: false },
        branch2: { id: 'branch2', parent_id: 'root', is_active: true },
        leaf1: { id: 'leaf1', parent_id: 'branch2', is_active: true },
        leaf2: { id: 'leaf2', parent_id: 'branch2', is_active: false }
      }

      const branchListMap = getBranchList(messageMap)
      const result = getDialogItemList(null, messageMap, branchListMap, [])

      expect(result).toHaveLength(3)
      expect(result[0].message.id).toBe('root')
      expect(result[1].message.id).toBe('branch2')
      expect(result[1].index).toBe(1) // branch2 is second among siblings
      expect(result[2].message.id).toBe('leaf1')
    })

    it('should preserve accumulator items', () => {
      const messageMap = {
        msg1: { id: 'msg1', parent_id: null, is_active: true }
      }

      const branchListMap = getBranchList(messageMap)
      const existingItem = {
        message: { id: 'existing', parent_id: null, is_active: true },
        index: 0,
        siblingMessageIds: ['existing'],
        siblingMessageMap: {
          existing: { id: 'existing', parent_id: null, is_active: true }
        }
      }
      const result = getDialogItemList(null, messageMap, branchListMap, [existingItem])

      expect(result).toHaveLength(2)
      expect(result[0]).toBe(existingItem)
      expect(result[1].message.id).toBe('msg1')
    })
  })

  describe('integration tests', () => {
    it('should work together to build complete dialog tree', () => {
      const messageMap = {
        'conversation-start': { id: 'conversation-start', parent_id: null, is_active: true },
        'user-msg-1': { id: 'user-msg-1', parent_id: 'conversation-start', is_active: true },
        'ai-response-1a': { id: 'ai-response-1a', parent_id: 'user-msg-1', is_active: false },
        'ai-response-1b': { id: 'ai-response-1b', parent_id: 'user-msg-1', is_active: true },
        'user-msg-2': { id: 'user-msg-2', parent_id: 'ai-response-1b', is_active: true },
        'ai-response-2': { id: 'ai-response-2', parent_id: 'user-msg-2', is_active: true }
      }

      const branchList = getBranchList(messageMap)
      const dialogItems = getDialogItemList(null, messageMap, branchList, [])

      // Should follow the active path through the conversation
      expect(dialogItems.map(item => item.message.id)).toEqual([
        'conversation-start',
        'user-msg-1',
        'ai-response-1b',
        'user-msg-2',
        'ai-response-2'
      ])

      // Check that branch information is preserved
      const aiResponseItem = dialogItems.find(item => item.message.id === 'ai-response-1b')
      expect(aiResponseItem?.siblingMessageIds).toEqual(['ai-response-1a', 'ai-response-1b'])
      expect(aiResponseItem?.index).toBe(1)
    })
  })
})
