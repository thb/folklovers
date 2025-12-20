import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { blog } from '@/lib/api'
import type { Article, Tag } from '@/lib/api'
import { z } from 'zod'

const blogSearchSchema = z.object({
  page: z.number().optional().default(1),
  search: z.string().optional(),
  tag: z.string().optional(),
})

type BlogSearch = z.infer<typeof blogSearchSchema>

export const Route = createFileRoute('/blog/')({
  component: BlogPage,
  validateSearch: blogSearchSchema,
  loaderDeps: ({ search }) => ({ page: search.page, search: search.search, tag: search.tag }),
  loader: async ({ deps }) => {
    const [articlesData, tagsData] = await Promise.all([
      blog.list({
        per_page: 9,
        page: deps.page,
        search: deps.search,
        by_tag: deps.tag,
      }),
      blog.tags(),
    ])
    return {
      articles: articlesData.articles,
      pagination: articlesData.pagination,
      tags: tagsData.tags,
    }
  },
})

function BlogPage() {
  const { articles, pagination, tags } = Route.useLoaderData()
  const { page, search, tag } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  const [searchInput, setSearchInput] = useState(search || '')

  useEffect(() => {
    setSearchInput(search || '')
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (search || '')) {
        navigate({
          search: (prev: BlogSearch) => ({
            ...prev,
            search: searchInput || undefined,
            page: 1,
          }),
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, navigate])

  const goToPage = (newPage: number) => {
    navigate({
      search: (prev: BlogSearch) => ({
        ...prev,
        page: newPage,
      }),
    })
  }

  const selectTag = (tagSlug: string | undefined) => {
    navigate({
      search: (prev: BlogSearch) => ({
        ...prev,
        tag: tagSlug,
        page: 1,
      }),
    })
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Blog</h1>
          <p className="text-muted-foreground">
            {search
              ? `${pagination.total_count} results for "${search}"`
              : tag
                ? `Articles tagged with "${tag}"`
                : 'News, stories, and insights about folk music'}
          </p>
        </div>

        {/* Search & Tags */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!tag ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => selectTag(undefined)}
              >
                All
              </Badge>
              {tags.map((t: Tag) => (
                <Badge
                  key={t.id}
                  variant={tag === t.slug ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => selectTag(t.slug)}
                >
                  {t.name}
                  {t.articles_count !== undefined && (
                    <span className="ml-1 opacity-60">({t.articles_count})</span>
                  )}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {search || tag ? 'No articles found' : 'No articles yet'}
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                .filter((p) => {
                  return (
                    p === 1 ||
                    p === pagination.total_pages ||
                    Math.abs(p - page) <= 1
                  )
                })
                .map((p, i, arr) => {
                  const showEllipsisBefore = i > 0 && p - arr[i - 1] > 1
                  return (
                    <span key={p} className="flex items-center gap-2">
                      {showEllipsisBefore && (
                        <span className="text-muted-foreground px-1">...</span>
                      )}
                      <Button
                        variant={p === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(p)}
                        className="min-w-[2.5rem]"
                      >
                        {p}
                      </Button>
                    </span>
                  )
                })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= pagination.total_pages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
