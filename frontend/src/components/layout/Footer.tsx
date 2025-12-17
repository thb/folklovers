import { Music } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Folklovers</p>
              <p className="text-xs text-muted-foreground font-mono">
                Celebrating folk music since 1961
              </p>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="text-center md:text-right max-w-md">
            <p className="text-sm italic text-muted-foreground">
              "The times they are a-changin'"
            </p>
            <cite className="text-xs text-muted-foreground/70 not-italic">
              — Bob Dylan, 1964
            </cite>
          </blockquote>
        </div>

        {/* Bottom */}
        <div className="mt-6 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Made with love for folk music enthusiasts
          </p>
        </div>
      </div>
    </footer>
  )
}
