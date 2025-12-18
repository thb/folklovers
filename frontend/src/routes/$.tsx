import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
})

function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        {/* Vinyl record illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer vinyl */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl">
            {/* Grooves */}
            <div className="absolute inset-4 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-8 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-12 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-16 rounded-full border border-zinc-700/50" />
            {/* Label */}
            <div className="absolute inset-[4.5rem] rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[8px] text-amber-200/80 font-mono uppercase tracking-wider">Error</p>
                <p className="text-lg font-bold text-amber-100">404</p>
              </div>
            </div>
            {/* Center hole */}
            <div className="absolute inset-[5.5rem] rounded-full bg-zinc-950" />
          </div>
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
        </div>

        {/* Text content */}
        <h1 className="text-4xl font-bold text-foreground mb-3 font-serif">
          Lost in the Woods
        </h1>
        <p className="text-xl text-muted-foreground mb-2 italic font-serif">
          "The answer, my friend, is not on this page"
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          The page you're looking for has gone wanderin'.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/songs">
              <Search className="w-4 h-4 mr-2" />
              Browse Songs
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
