import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Bug, Lightbulb, Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth'

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
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [category, setCategory] = useState<FeedbackCategory | ''>('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Build mailto link
    const subject = category ? `[${categoryConfig[category].label}] Folk Lovers Feedback` : 'Folk Lovers Feedback'
    const body = `From: ${email || 'Anonymous'}\nCategory: ${category ? categoryConfig[category].label : 'Not specified'}\n\n${message}`
    const mailtoLink = `mailto:feedback@folklovers.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Open email client
    window.location.href = mailtoLink

    // Show thank you message
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank you!</h1>
        <p className="text-muted-foreground mb-8">
          Your email client should have opened with your feedback ready to send.
          If it didn't, you can email us directly at{' '}
          <a href="mailto:feedback@folklovers.com" className="text-primary hover:underline">
            feedback@folklovers.com
          </a>
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Send another
          </Button>
          <Link to="/">
            <Button>Back to home</Button>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="text-xs text-muted-foreground">
                So we can follow up if needed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as FeedbackCategory)}>
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

            <Button type="submit" className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Send feedback
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
