import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Music, Disc, Users, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { admin } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const { token, isAdmin } = useAuth()
  const [songsCount, setSongsCount] = useState<number | null>(null)
  const [coversCount, setCoversCount] = useState<number | null>(null)
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [feedbacksCount, setFeedbacksCount] = useState<number | null>(null)
  const [pendingFeedbacksCount, setPendingFeedbacksCount] = useState<number | null>(null)

  useEffect(() => {
    if (token && isAdmin) {
      fetchCounts()
    }
  }, [token, isAdmin])

  async function fetchCounts() {
    if (!token) return
    try {
      const [songsData, coversData, usersData, feedbacksData, pendingFeedbacksData] = await Promise.all([
        admin.songs.list(token, { per_page: 1 }),
        admin.covers.list(token, { per_page: 1 }),
        admin.users.list(token, { per_page: 1 }),
        admin.feedbacks.list(token, { per_page: 1 }),
        admin.feedbacks.list(token, { per_page: 1, status: 'pending' }),
      ])
      setSongsCount(songsData.pagination.total_count)
      setCoversCount(coversData.pagination.total_count)
      setUsersCount(usersData.pagination.total_count)
      setFeedbacksCount(feedbacksData.pagination.total_count)
      setPendingFeedbacksCount(pendingFeedbacksData.pagination.total_count)
    } catch (err) {
      // Ignore errors for counts
    }
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Manage songs and covers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <CardTitle className="mt-4">Songs</CardTitle>
                <CardDescription>
                  Add, edit or delete songs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage the original folk songs collection
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
                <CardTitle className="mt-4">Covers</CardTitle>
                <CardDescription>
                  Add, edit or delete covers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage the different versions and interpretations
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/users">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  {usersCount !== null && (
                    <span className="text-3xl font-bold text-primary">{usersCount}</span>
                  )}
                </div>
                <CardTitle className="mt-4">Users</CardTitle>
                <CardDescription>
                  View user contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  See registered users and their activity
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/feedbacks">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-right">
                    {feedbacksCount !== null && (
                      <span className="text-3xl font-bold text-primary">{feedbacksCount}</span>
                    )}
                    {pendingFeedbacksCount !== null && pendingFeedbacksCount > 0 && (
                      <div className="text-xs text-amber-600 font-medium">
                        {pendingFeedbacksCount} pending
                      </div>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-4">Feedbacks</CardTitle>
                <CardDescription>
                  Review user feedbacks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Bug reports, feature requests, and suggestions
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
