import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ExpandableTextProps {
  text: string
  maxLines?: number
  className?: string
}

export function ExpandableText({ text, maxLines = 5, className }: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [needsTruncation, setNeedsTruncation] = useState(false)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    // Check if content exceeds maxLines
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
    const maxHeight = lineHeight * maxLines
    setNeedsTruncation(element.scrollHeight > maxHeight + 1)
  }, [text, maxLines])

  return (
    <div className={className}>
      <p
        ref={textRef}
        className={cn(
          'text-muted-foreground leading-relaxed',
          !isExpanded && needsTruncation && 'line-clamp-5'
        )}
        style={!isExpanded && needsTruncation ? { WebkitLineClamp: maxLines } : undefined}
      >
        {text}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary hover:underline mt-1"
        >
          {isExpanded ? 'less' : 'more'}
        </button>
      )}
    </div>
  )
}
