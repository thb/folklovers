import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/lib/auth'
import { admin } from '@/lib/api'
import type { ArticleWithContent } from '@/lib/api'

export const Route = createFileRoute('/admin/articles/')({
  component: AdminArticlesPage,
})

function AdminArticlesPage() {
  const { token, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState<ArticleWithContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingArticle, setDeletingArticle] = useState<ArticleWithContent | null>(null)

  useEffect(() => {
    if (token && isAdmin) {
      fetchArticles()
    }
  }, [token, isAdmin])

  const fetchArticles = async () => {
    if (!token) return
    try {
      const data = await admin.articles.list(token, { per_page: 100 })
      setArticles(data.articles)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async (article: ArticleWithContent) => {
    if (!token) return
    try {
      const { article: updated } = await admin.articles.publish(token, article.id)
      setArticles(articles.map((a) => (a.id === updated.id ? updated : a)))
    } catch (error) {
      console.error('Failed to toggle publish:', error)
    }
  }

  const handleDelete = async () => {
    if (!token || !deletingArticle) return
    try {
      await admin.articles.delete(token, deletingArticle.id)
      setArticles(articles.filter((a) => a.id !== deletingArticle.id))
    } catch (error) {
      console.error('Failed to delete article:', error)
    } finally {
      setDeleteDialogOpen(false)
      setDeletingArticle(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Access denied</div>
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link to="/admin/articles/$id" params={{ id: 'new' }}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No articles yet. Create your first article!
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.map((article) => (
              <TableRow key={article.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {article.title}
                    {article.is_published && (
                      <a
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={article.is_published ? 'default' : 'secondary'}>
                    {article.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{article.author.username}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{formatDate(article.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePublish(article)}
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {article.is_published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Link to="/admin/articles/$id" params={{ id: article.id.toString() }}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeletingArticle(article)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingArticle?.title}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
