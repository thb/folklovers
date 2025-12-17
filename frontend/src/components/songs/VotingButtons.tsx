import { useState, useEffect } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'
import { votes } from '@/lib/api'
import type { Cover } from '@/lib/api'

type VotingButtonsProps = {
  cover: Cover
  onVoteChange?: (updatedCover: Cover) => void
}

export function VotingButtons({ cover, onVoteChange }: VotingButtonsProps) {
  const { isAuthenticated, token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentVote, setCurrentVote] = useState<1 | -1 | null>(cover.user_vote)
  const [score, setScore] = useState(cover.votes_score)

  // Sync state when cover prop changes (e.g., after refetch with token)
  useEffect(() => {
    setCurrentVote(cover.user_vote)
    setScore(cover.votes_score)
  }, [cover.user_vote, cover.votes_score])

  const handleVote = async (value: 1 | -1) => {
    if (!isAuthenticated || !token) {
      // Could open a login dialog here
      return
    }

    setIsLoading(true)
    try {
      const result = await votes.vote(cover.id, value, token)
      setCurrentVote(result.cover.user_vote)
      setScore(result.cover.votes_score)
      onVoteChange?.(result.cover)
    } catch (error) {
      console.error('Vote error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Upvote */}
      <Button
        variant={currentVote === 1 ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(1)}
        disabled={isLoading || !isAuthenticated}
        className={`gap-1.5 ${
          currentVote === 1
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>

      {/* Score */}
      <span
        className={`min-w-[3rem] text-center font-semibold ${
          score > 0
            ? 'text-green-600'
            : score < 0
              ? 'text-red-500'
              : 'text-muted-foreground'
        }`}
      >
        {score > 0 ? '+' : ''}
        {score}
      </span>

      {/* Downvote */}
      <Button
        variant={currentVote === -1 ? 'default' : 'outline'}
        size="sm"
        onClick={() => handleVote(-1)}
        disabled={isLoading || !isAuthenticated}
        className={`gap-1.5 ${
          currentVote === -1
            ? 'bg-red-500 hover:bg-red-600 text-white'
            : 'hover:bg-red-50 hover:text-red-500 hover:border-red-300'
        }`}
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
