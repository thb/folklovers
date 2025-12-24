import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MarkdownContent } from '@/components/articles/MarkdownContent'
import { blog } from '@/lib/api'

export const Route = createFileRoute('/articles/$slug')({
  component: ArticlePage,
  loader: async ({ params }) => {
    const data = await blog.get(params.slug)
    return data.article
  },
})

function ArticlePage() {
  const article = Route.useLoaderData()

  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="py-8 md:py-16 px-4">
      <article className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link to="/articles" className="inline-block mb-8">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to articles
          </Button>
        </Link>

        {/* Cover image */}
        {article.cover_image_url && (
          <figure className="mb-10 -mx-4 md:mx-0">
            <div className="aspect-video md:rounded-lg overflow-hidden">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
            {article.cover_image_credit && (
              <figcaption className="mt-3 text-sm text-muted-foreground text-center">
                {article.cover_image_credit}
              </figcaption>
            )}
          </figure>
        )}

        {/* Header */}
        <header className="mb-10">
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <Link key={tag.id} to="/articles" search={{ tag: tag.slug }}>
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 text-xs uppercase tracking-wide"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={article.author.avatar_url || undefined}
                alt={article.author.username}
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {article.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{article.author.username}</p>
              {formattedDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Separator */}
        <hr className="border-border mb-10" />

        {/* Content */}
        <MarkdownContent content={article.content} />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <Link to="/articles">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all articles
            </Button>
          </Link>
        </footer>
      </article>
    </div>
  )
}
