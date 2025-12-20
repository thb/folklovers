import { Link } from '@tanstack/react-router'
import { Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Article } from '@/lib/api'

type ArticleCardProps = {
  article: Article
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <Link to="/blog/$slug" params={{ slug: article.slug }}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30 cursor-pointer h-full overflow-hidden">
        {article.cover_image_url && (
          <div className="aspect-video bg-muted relative overflow-hidden">
            <img
              src={article.cover_image_url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <CardContent className={article.cover_image_url ? 'p-4' : 'p-5'}>
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {article.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>{article.author.username}</span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
