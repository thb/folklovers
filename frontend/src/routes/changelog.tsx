import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, RefreshCw, Wrench, Zap } from 'lucide-react'

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
  changes: ChangeEntry[]
}

const changelog: ChangelogEntry[] = [
  {
    date: '2025-12-20',
    changes: [
      {
        type: 'added',
        items: [
          'Song sorting: alphabetical (A-Z, Z-A), by year, by date added',
        ],
      },
    ],
  },
  {
    date: '2025-12-19',
    changes: [
      {
        type: 'added',
        items: [
          'Persistent audio player bar (plays across page navigation, like France Inter)',
          'Play queue with add-to-queue functionality on covers',
          'Original version now displayed as first "cover" with distinctive amber badge',
          'Custom 404 page with vinyl record illustration',
          'Custom 500 error page with scratched record theme',
          'Changelog page (/changelog)',
        ],
      },
      {
        type: 'changed',
        items: [
          'Unified data model: original song version is now a cover with original flag',
          'Song detail page renamed "Covers" section to "Versions"',
          'Thumbnails now served directly from API instead of client-side extraction',
        ],
      },
      {
        type: 'improved',
        items: [
          'Cover cards now show play/pause state and queue controls on hover',
          'Original versions always appear first, regardless of vote count',
          'Faster deployments: images built in CI, server just pulls (~30s vs ~5min)',
        ],
      },
    ],
  },
  {
    date: '2025-12-18',
    changes: [
      {
        type: 'added',
        items: [
          'Users can submit new songs via /songs/new form (requires authentication)',
          'Users can add covers to existing songs with YouTube URL',
          'Playable cover cards on homepage (top covers section)',
          'Admin user management interface (/admin/users) with role editing',
          'Search and pagination on songs listing page',
          'Admin dashboard counters (songs, covers, users)',
          'Filter covers by song in admin panel',
        ],
      },
      {
        type: 'changed',
        items: [
          'Translated entire site from French to English (UI and seed data)',
          'Wait for database migrations before starting frontend in deployment',
        ],
      },
    ],
  },
  {
    date: '2025-12-17',
    changes: [
      {
        type: 'improved',
        items: [
          'Lighthouse performance: moved Google Fonts from @import to preconnect + link tags',
          'Lighthouse performance: TanStack Devtools now conditionally loaded only in development',
          'Lighthouse CLS: added explicit width/height dimensions to YouTube thumbnail images',
        ],
      },
      {
        type: 'added',
        items: [
          'Google OAuth authentication (Sign in with Google)',
          'Google Sign-In button on login and register pages',
          'Tests for Google auth endpoint and service',
        ],
      },
      {
        type: 'fixed',
        items: [
          'Votes +1/-1: user vote state now persists after page reload',
        ],
      },
      {
        type: 'changed',
        items: [
          'Renamed "Folklovers" to "Folk Lovers" everywhere',
          'Reduced deployment downtime with rolling restart',
        ],
      },
    ],
  },
]

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
