import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownEditor } from '@/components/admin/MarkdownEditor'
import { TagsInput } from '@/components/admin/TagsInput'
import { useAuth } from '@/lib/auth'
import { admin } from '@/lib/api'
import type { ArticleWithContent } from '@/lib/api'

export const Route = createFileRoute('/admin/articles/$id')({
  component: AdminArticleEditorPage,
})

type FormData = {
  title: string
  content: string
  excerpt: string
  cover_image_url: string
  tag_names: string[]
}

const emptyForm: FormData = {
  title: '',
  content: '',
  excerpt: '',
  cover_image_url: '',
  tag_names: [],
}

function AdminArticleEditorPage() {
  const { id } = Route.useParams()
  const { token, isAdmin } = useAuth()
  const navigate = useNavigate()

  const isNew = id === 'new'

  const [article, setArticle] = useState<ArticleWithContent | null>(null)
  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [isLoading, setIsLoading] = useState(!isNew)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!isNew && token && isAdmin) {
      fetchArticle()
    }
  }, [id, token, isAdmin, isNew])

  const fetchArticle = async () => {
    if (!token) return
    try {
      const data = await admin.articles.get(token, parseInt(id))
      setArticle(data.article)
      setFormData({
        title: data.article.title,
        content: data.article.content,
        excerpt: data.article.excerpt || '',
        cover_image_url: data.article.cover_image_url || '',
        tag_names: data.article.tags.map((t) => t.name),
      })
    } catch (error) {
      console.error('Failed to fetch article:', error)
      setError('Failed to load article')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!token) return
    setIsSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const data = {
        ...formData,
        published_at: publish ? new Date().toISOString() : (article?.published_at || null),
      }

      let result: { article: ArticleWithContent }

      if (isNew) {
        result = await admin.articles.create(token, data)
        navigate({ to: '/admin/articles/$id', params: { id: result.article.id.toString() } })
      } else {
        result = await admin.articles.update(token, parseInt(id), data)
        setArticle(result.article)
      }

      setSuccessMessage('Saved!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.data?.errors?.join(', ') || 'Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublishToggle = async () => {
    if (!token || !article) return
    setIsSaving(true)
    setError(null)

    try {
      const result = await admin.articles.publish(token, article.id)
      setArticle(result.article)
      setSuccessMessage(result.article.is_published ? 'Published!' : 'Unpublished')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError('Failed to toggle publish status')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isAdmin) {
    return <div className="p-8 text-center text-muted-foreground">Access denied</div>
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/articles">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">
            {isNew ? 'New Article' : 'Edit Article'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {successMessage && (
            <span className="text-sm text-green-600">{successMessage}</span>
          )}
          {!isNew && article && (
            <Button
              variant="outline"
              onClick={handlePublishToggle}
              disabled={isSaving}
            >
              {article.is_published ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Unpublish
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Publish
                </>
              )}
            </Button>
          )}
          <Button onClick={() => handleSave()} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-6 text-sm text-red-500 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Article title..."
          />
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label htmlFor="cover_image_url">Cover Image URL</Label>
          <Input
            id="cover_image_url"
            type="url"
            value={formData.cover_image_url}
            onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
            placeholder="https://..."
          />
          {formData.cover_image_url && (
            <div className="mt-2 aspect-video max-w-md rounded-lg overflow-hidden border">
              <img
                src={formData.cover_image_url}
                alt="Cover preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <TagsInput
          value={formData.tag_names}
          onChange={(tags) => setFormData({ ...formData, tag_names: tags })}
        />

        {/* Content (Markdown Editor) */}
        <MarkdownEditor
          value={formData.content}
          onChange={(content) => setFormData({ ...formData, content })}
        />

        {/* Excerpt */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">
            Excerpt <span className="text-muted-foreground">(optional, auto-generated if empty)</span>
          </Label>
          <Textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            placeholder="Brief summary of the article..."
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
