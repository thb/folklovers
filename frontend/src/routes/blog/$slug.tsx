import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MarkdownContent } from '@/components/blog/MarkdownContent'
import { blog } from '@/lib/api'

export const Route = createFileRoute('/blog/$slug')({
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
    <div className="py-12 px-4">
      <article className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link to="/blog" className="inline-block mb-8">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to blog
          </Button>
        </Link>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="aspect-video rounded-lg overflow-hidden mb-8">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.map((tag) => (
              <Link key={tag.id} to="/blog" search={{ tag: tag.slug }}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-bold text-foreground mb-6">{article.title}</h1>

        {/* Author & Date */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={article.author.avatar_url || undefined} alt={article.author.username} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {article.author.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{article.author.username}</p>
              {formattedDate && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formattedDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <MarkdownContent content={article.content} />
      </article>
    </div>
  )
}
