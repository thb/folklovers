import { useState } from 'react'
import { Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { MarkdownContent } from '@/components/blog/MarkdownContent'

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  rows?: number
}

export function MarkdownEditor({
  value,
  onChange,
  label = 'Content',
  placeholder = 'Write your article in Markdown...',
  rows = 20,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? (
            <>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </>
          )}
        </Button>
      </div>

      {showPreview ? (
        <div className="min-h-[400px] p-4 border rounded-lg bg-background overflow-auto">
          {value ? (
            <MarkdownContent content={value} />
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="font-mono text-sm"
          placeholder={placeholder}
        />
      )}
    </div>
  )
}
