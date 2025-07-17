// const FACT_MAP = {
export function formatGraphResultToMarkdown(result: any[]): string {
  if (!Array.isArray(result)) return ''

  // Helper to format group name
  function formatName(name: string): string {
    if (!name) return ''

    const formatted = name.replace(/_/g, ' ').toLowerCase()

    return "**" + formatted.charAt(0).toUpperCase() + formatted.slice(1) + "**"
  }

  // Group by name
  const groups: Record<string, any[]> = {}
  for (const item of result) {
    if (!groups[item.name]) groups[item.name] = []

    // Only push if this fact is not already in the group
    if (!groups[item.name].some(existing => existing.fact === item.fact)) {
      groups[item.name].push(item)
    }
  }

  const lines: string[] = []
  for (const [name, items] of Object.entries(groups)) {
    const displayName = formatName(name)

    if (items.length > 1) {
      // Group header
      lines.push(`- ${displayName}`)
      for (const item of items) {
        const bullet = `  - ${item.fact ?? ''}`

        // bug: if invalid_at and valid_at are same, then it is valid
        // TODO: differs only in microseconds
        // if ((item.invalid_at || item.expired_at) && item.invalid_at !== item.valid_at) {
        //   bullet = `  - ~~${item.fact ?? ''}~~`
        // }

        lines.push(bullet)
      }
    } else {
      // Single item, first-level bullet
      const item = items[0]
      const bullet = `- ${displayName}: ${item.fact ?? ''}`

      // Same BUG as above
      // if (item.invalid_at || item.expired_at) {
      //   bullet = `- ~~${displayName}: ${item.fact ?? ''}~~`
      // }
      lines.push(bullet)
    }
  }

  return lines.join('\n')
}
