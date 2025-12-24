import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Bug, Lightbulb, Heart, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { feedbacks, ApiError } from '@/lib/api'

export const Route = createFileRoute('/feedback')({
  component: FeedbackPage,
})

type FeedbackCategory = 'bug' | 'feature' | 'general'

const categoryConfig: Record<FeedbackCategory, { label: string; icon: React.ElementType }> = {
  bug: { label: 'Bug Report', icon: Bug },
  feature: { label: 'Feature Request', icon: Lightbulb },
  general: { label: 'General Feedback', icon: MessageSquare },
}

function FeedbackPage() {
  const { isAuthenticated, token } = useAuth()
  const [category, setCategory] = useState<FeedbackCategory | ''>('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !category) return

    setIsSubmitting(true)
    setError(null)

    try {
      await feedbacks.create({ category, message }, token)
      setSubmitted(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { errors?: string[]; error?: string }
        setError(data.errors?.join(', ') || data.error || 'Failed to submit feedback')
      } else {
        setError('Network error. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
        <p className="text-muted-foreground mb-8">
          Your feedback has been submitted. We appreciate you taking the time to help us improve Folk Lovers.
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => {
            setSubmitted(false)
            setCategory('')
            setMessage('')
          }}>
            Send another
          </Button>
          <Link to="/">
            <Button>Back to home</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
          <LogIn className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Sign in to send feedback</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to your account to submit feedback. This helps us follow up with you if needed.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button>
              <LogIn className="w-4 h-4 mr-2" />
              Sign in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Create account</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-2">Feedback</h1>
      <p className="text-muted-foreground mb-8">
        Help us improve Folk Lovers! Report bugs, request features, or share your thoughts.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
          <CardDescription>
            Your feedback helps shape the future of Folk Lovers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feedback, bug, or feature request..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || !category}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Check out our <Link to="/roadmap" className="text-primary hover:underline">roadmap</Link> to see what we're working on.
      </p>
    </div>
  )
}
