import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, User, Vote, Disc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { admin, type AdminUser, type UserContributions, type User as UserType } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersPage,
})

function AdminUsersPage() {
  const { token, isAdmin, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedUser, setSelectedUser] = useState<{ user: UserType; contributions: UserContributions } | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      navigate({ to: '/' })
    }
  }, [isAdmin, isAuthLoading, navigate])

  useEffect(() => {
    if (token && isAdmin) {
      fetchUsers(1)
    }
  }, [token, isAdmin])

  async function fetchUsers(page: number) {
    if (!token) return
    setIsLoading(true)
    setError(null)

    try {
      const data = await admin.users.list(token, { page, per_page: 20 })
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  async function viewUserDetails(userId: number) {
    if (!token) return

    try {
      const data = await admin.users.get(token, userId)
      setSelectedUser(data)
      setIsDialogOpen(true)
    } catch (err) {
      setError('Failed to load user details')
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isAuthLoading || !isAdmin) {
    return null
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to admin
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Users</h1>
              <p className="text-muted-foreground">
                {pagination.total_count} registered users
              </p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-center">Covers</TableHead>
                <TableHead className="text-center">Votes</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={user.covers_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {user.covers_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={user.votes_count > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {user.votes_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewUserDetails(user.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.current_page} of {pagination.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.total_pages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* User Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                {selectedUser?.user.avatar_url ? (
                  <img src={selectedUser.user.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div>{selectedUser?.user.username}</div>
                  <div className="text-sm font-normal text-muted-foreground">{selectedUser?.user.email}</div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                    <Disc className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{selectedUser.contributions.covers_submitted.length}</div>
                      <div className="text-sm text-muted-foreground">Covers submitted</div>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
                    <Vote className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-2xl font-bold">{selectedUser.contributions.votes_count}</div>
                      <div className="text-sm text-muted-foreground">Votes cast</div>
                    </div>
                  </div>
                </div>

                {/* Submitted Covers */}
                {selectedUser.contributions.covers_submitted.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Submitted Covers</h3>
                    <div className="space-y-2">
                      {selectedUser.contributions.covers_submitted.map((cover) => (
                        <div key={cover.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div>
                            <div className="font-medium">{cover.artist}</div>
                            <Link
                              to="/songs/$slug"
                              params={{ slug: cover.song_slug }}
                              className="text-sm text-muted-foreground hover:text-primary"
                            >
                              {cover.song_title}
                            </Link>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(cover.created_at)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.contributions.covers_submitted.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No contributions yet
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
