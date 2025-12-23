import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Home, RefreshCw } from 'lucide-react'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Player } from '@/components/player/Player'
import { AuthProvider } from '@/lib/auth'
import { PlayerProvider } from '@/lib/player-context'
import { Button } from '@/components/ui/button'

import appCss from '../styles.css?url'

declare global {
  interface Window {
    _paq: unknown[]
  }
}

export const Route = createRootRoute({
  errorComponent: ErrorPage,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Folk Lovers - The Best Folk Song Covers',
      },
      {
        name: 'description',
        content: 'Discover and vote for the best folk song covers. A community for folk music enthusiasts.',
      },
    ],
    links: [
      // Preconnect to Google Fonts for faster loading
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      // Google Fonts - loaded via link instead of @import for better performance
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600&family=Special+Elite&display=swap',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isFirstRender = useRef(true)

  // Initialize Matomo (production only, when configured)
  useEffect(() => {
    const matomoUrl = import.meta.env.VITE_MATOMO_URL
    const matomoSiteId = import.meta.env.VITE_MATOMO_SITE_ID

    if (import.meta.env.DEV || !matomoUrl || !matomoSiteId) return

    const u = matomoUrl.endsWith('/') ? matomoUrl : matomoUrl + '/'

    window._paq = window._paq || []
    window._paq.push(['setTrackerUrl', u + 'matomo.php'])
    window._paq.push(['setSiteId', matomoSiteId])
    window._paq.push(['trackPageView'])
    window._paq.push(['enableLinkTracking'])

    const d = document
    const g = d.createElement('script')
    const s = d.getElementsByTagName('script')[0]
    g.async = true
    g.src = u + 'matomo.js'
    s.parentNode?.insertBefore(g, s)
  }, [])

  // Track route changes (production only, skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (import.meta.env.DEV || !import.meta.env.VITE_MATOMO_URL) return

    window._paq = window._paq || []
    window._paq.push(['setCustomUrl', location.pathname + location.search])
    window._paq.push(['setDocumentTitle', document.title])
    window._paq.push(['trackPageView'])
  }, [location.pathname, location.search])

  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <PlayerProvider>
            <Header />
            <main className="flex-1 pb-20">
              {children}
            </main>
            <Footer />
            <Player />
          </PlayerProvider>
        </AuthProvider>
        {import.meta.env.DEV && (
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}

function ErrorPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        {/* Scratched vinyl record */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          {/* Outer vinyl */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 shadow-2xl">
            {/* Grooves */}
            <div className="absolute inset-4 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-8 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-12 rounded-full border border-zinc-700/50" />
            <div className="absolute inset-16 rounded-full border border-zinc-700/50" />
            {/* Scratch marks */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="absolute top-8 left-1/2 w-0.5 h-16 bg-zinc-600/40 rotate-12 origin-top" />
              <div className="absolute top-12 left-1/3 w-0.5 h-12 bg-zinc-600/30 -rotate-6 origin-top" />
            </div>
            {/* Label */}
            <div className="absolute inset-[4.5rem] rounded-full bg-gradient-to-br from-red-700 to-red-900 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[8px] text-red-200/80 font-mono uppercase tracking-wider">Error</p>
                <p className="text-lg font-bold text-red-100">500</p>
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
          The Record is Scratched
        </h1>
        <p className="text-xl text-muted-foreground mb-2 italic font-serif">
          "Something's wrong, something's not quite right"
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8">
          Don't worry, it's not you — it's us. Try again in a moment.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Back Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
