import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, Wrench, Zap } from 'lucide-react'
import changelogRaw from '../../CHANGELOG.md?raw'

export const Route = createFileRoute('/changelog')({
  component: ChangelogPage,
})

type ChangeType = 'added' | 'changed' | 'fixed' | 'improved'

type ChangeEntry = {
  type: ChangeType
  items: string[]
}

type ChangelogEntry = {
  date: string
  title?: string
  changes: ChangeEntry[]
}

function parseChangelog(markdown: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = []
  const lines = markdown.split('\n')

  let currentEntry: ChangelogEntry | null = null
  let currentChange: ChangeEntry | null = null

  for (const line of lines) {
    // Match date header: ## 2025-12-24 or ## 2025-12-24 - Title
    const dateMatch = line.match(/^## (\d{4}-\d{2}-\d{2})(?:\s*-\s*(.+))?/)
    if (dateMatch) {
      if (currentChange && currentEntry) {
        currentEntry.changes.push(currentChange)
      }
      if (currentEntry) {
        entries.push(currentEntry)
      }
      currentEntry = { date: dateMatch[1], title: dateMatch[2], changes: [] }
      currentChange = null
      continue
    }

    // Match change type header: ### Added, ### Changed, etc.
    const typeMatch = line.match(/^### (Added|Changed|Fixed|Improved)/i)
    if (typeMatch && currentEntry) {
      if (currentChange) {
        currentEntry.changes.push(currentChange)
      }
      currentChange = {
        type: typeMatch[1].toLowerCase() as ChangeType,
        items: [],
      }
      continue
    }

    // Match list item: - Something
    const itemMatch = line.match(/^- (.+)/)
    if (itemMatch && currentChange) {
      currentChange.items.push(itemMatch[1])
      continue
    }

    // Match indented list item (sub-item): "  - Something"
    const subItemMatch = line.match(/^  - (.+)/)
    if (subItemMatch && currentChange && currentChange.items.length > 0) {
      // Append sub-item to the last item
      const lastIndex = currentChange.items.length - 1
      currentChange.items[lastIndex] += ` (${subItemMatch[1]})`
    }
  }

  // Don't forget the last entries
  if (currentChange && currentEntry) {
    currentEntry.changes.push(currentChange)
  }
  if (currentEntry) {
    entries.push(currentEntry)
  }

  return entries
}

const changelog = parseChangelog(changelogRaw)

const typeConfig: Record<ChangeType, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  added: { label: 'Added', icon: Plus, variant: 'default' },
  changed: { label: 'Changed', icon: RefreshCw, variant: 'secondary' },
  fixed: { label: 'Fixed', icon: Wrench, variant: 'destructive' },
  improved: { label: 'Improved', icon: Zap, variant: 'outline' },
}

function ChangelogPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        All notable changes to Folk Lovers are documented here.
      </p>

      <div className="space-y-8">
        {changelog.map((entry) => (
          <Card key={entry.date}>
            <CardHeader>
              <CardTitle className="text-2xl">
                {formatDate(entry.date)}
                {entry.title && <span className="text-muted-foreground font-normal"> — {entry.title}</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {entry.changes.map((change) => {
                const config = typeConfig[change.type]
                const Icon = config.icon
                return (
                  <div key={change.type}>
                    <Badge variant={config.variant} className="mb-3">
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {change.items.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
