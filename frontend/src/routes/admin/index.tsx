import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Music, Disc } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { admin } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { token, isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const [songsCount, setSongsCount] = useState<number | null>(null)
  const [coversCount, setCoversCount] = useState<number | null>(null)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: '/' })
    }
  }, [isAdmin, isLoading, navigate])

  useEffect(() => {
    if (token && isAdmin) {
      fetchCounts()
    }
  }, [token, isAdmin])

  async function fetchCounts() {
    if (!token) return
    try {
      const [songsData, coversData] = await Promise.all([
        admin.songs.list(token, { per_page: 1 }),
        admin.covers.list(token, { per_page: 1 }),
      ])
      setSongsCount(songsData.pagination.total_count)
      setCoversCount(coversData.pagination.total_count)
    } catch (err) {
      // Ignore errors for counts
    }
  }

  if (isLoading || !isAdmin) {
    return null
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Gérez les chansons et les interprétations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/admin/songs">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Music className="w-6 h-6 text-primary" />
                  </div>
                  {songsCount !== null && (
                    <span className="text-3xl font-bold text-primary">{songsCount}</span>
                  )}
                </div>
                <CardTitle className="mt-4">Chansons</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des chansons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gérez la collection de chansons folk originales
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/covers">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Disc className="w-6 h-6 text-primary" />
                  </div>
                  {coversCount !== null && (
                    <span className="text-3xl font-bold text-primary">{coversCount}</span>
                  )}
                </div>
                <CardTitle className="mt-4">Interprétations</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des covers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gérez les différentes versions et reprises
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
