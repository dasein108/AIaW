import { SearchResult } from "@/services/data/types/backend"

// const FACT_MAP = {
export function formatGraphResultToMarkdown(result: SearchResult[]): string {
  if (!Array.isArray(result)) return ''

  // Helper to format group name
  function formatName(name: string): string {
    if (!name) return ''

    const formatted = name.replace(/_/g, ' ').toLowerCase()

    return "**" + formatted.charAt(0).toUpperCase() + formatted.slice(1) + "**"
  }

  // Group by name
  const groups: Record<string, SearchResult[]> = {}
  for (const item of result) {
    if (!groups[item.relationship]) groups[item.relationship] = []

    // Only push if this fact is not already in the group
    if (!groups[item.relationship].some(existing => existing.metadata.summary === item.metadata.summary)) {
      groups[item.relationship].push(item)
    }
  }

  const lines: string[] = []
  for (const [name, items] of Object.entries(groups)) {
    const displayName = formatName(name)

    // if (items.length > 1) {
    // Group header
    lines.push(`- ${displayName}`)
    for (const item of items) {
      const bullet = item.metadata?.status === 'obsolete' ? `  - ~~${item.metadata.summary ?? ''}~~` : `  - ${item.metadata.summary ?? ''}`

      lines.push(bullet)
    }
    // } else {
    //   // Single item, first-level bullet
    //   const item = items[0]
    //   const bullet = item.metadata?.status === 'obsolete' ? `  - ~~${item.metadata.summary ?? ''}~~` : `  - ${item.metadata.summary ?? ''}`

    //   lines.push(bullet)
    // }
  }

  return lines.join('\n')
}
