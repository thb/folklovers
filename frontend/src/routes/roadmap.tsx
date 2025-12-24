import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Circle } from 'lucide-react'
import todoRaw from '../../TODO.md?raw'

export const Route = createFileRoute('/roadmap')({
  component: RoadmapPage,
})

type RoadmapCategory = {
  title: string
  items: string[]
}

// Sections to exclude from public roadmap
const EXCLUDED_SECTIONS = ['Blog Article Ideas']

function parseRoadmap(markdown: string): RoadmapCategory[] {
  const categories: RoadmapCategory[] = []
  const lines = markdown.split('\n')

  let currentCategory: RoadmapCategory | null = null
  let skipSection = false

  for (const line of lines) {
    // Match category header: ## Category Name
    const categoryMatch = line.match(/^## (.+)/)
    if (categoryMatch) {
      if (currentCategory && currentCategory.items.length > 0) {
        categories.push(currentCategory)
      }
      const title = categoryMatch[1].trim()
      skipSection = EXCLUDED_SECTIONS.includes(title)
      if (!skipSection) {
        currentCategory = { title, items: [] }
      } else {
        currentCategory = null
      }
      continue
    }

    // Skip if in excluded section
    if (skipSection || !currentCategory) continue

    // Match checkbox item: - [ ] Something or - [x] Something
    const itemMatch = line.match(/^- \[[ x]\] (.+)/)
    if (itemMatch) {
      currentCategory.items.push(itemMatch[1])
    }
  }

  // Don't forget the last category
  if (currentCategory && currentCategory.items.length > 0) {
    categories.push(currentCategory)
  }

  return categories
}

const roadmap = parseRoadmap(todoRaw)

function RoadmapPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">Roadmap</h1>
      <p className="text-muted-foreground mb-8">
        Features and improvements we're planning for Folk Lovers.
        Have a suggestion? <a href="/feedback" className="text-primary hover:underline">Let us know!</a>
      </p>

      <div className="space-y-6">
        {roadmap.map((category) => (
          <Card key={category.title}>
            <CardHeader>
              <CardTitle className="text-xl">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {category.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-3 text-muted-foreground">
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>This roadmap reflects our current plans and may change based on community feedback.</p>
      </div>
    </div>
  )
}
