import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, User, Bug, Lightbulb, MessageSquare, Trash2 } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { admin, type Feedback } from '@/lib/api'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin/feedbacks')({
  component: AdminFeedbacksPage,
})

const categoryConfig = {
  bug: { label: 'Bug', icon: Bug, color: 'bg-red-500/10 text-red-600' },
  feature: { label: 'Feature', icon: Lightbulb, color: 'bg-amber-500/10 text-amber-600' },
  general: { label: 'General', icon: MessageSquare, color: 'bg-blue-500/10 text-blue-600' },
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500/10 text-yellow-600' },
  reviewed: { label: 'Reviewed', color: 'bg-blue-500/10 text-blue-600' },
  resolved: { label: 'Resolved', color: 'bg-green-500/10 text-green-600' },
}

function AdminFeedbacksPage() {
  const { token, isAdmin } = useAuth()

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([])
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_count: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (token && isAdmin) {
      fetchFeedbacks(1)
    }
  }, [token, isAdmin, statusFilter])

  async function fetchFeedbacks(page: number) {
    if (!token) return
    setIsLoading(true)
    setError(null)

    try {
      const params: { page: number; status?: string } = { page }
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      const data = await admin.feedbacks.list(token, params)
      setFeedbacks(data.feedbacks)
      setPagination(data.pagination)
    } catch (err) {
      setError('Failed to load feedbacks')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateStatus(id: number, status: string) {
    if (!token) return

    try {
      const data = await admin.feedbacks.update(token, id, { status })
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? data.feedback : f))
      )
    } catch (err) {
      setError('Failed to update status')
    }
  }

  async function handleDelete() {
    if (!token || !deleteId) return

    setIsDeleting(true)
    try {
      await admin.feedbacks.delete(token, deleteId)
      setFeedbacks((prev) => prev.filter((f) => f.id !== deleteId))
      setPagination((prev) => ({ ...prev, total_count: prev.total_count - 1 }))
    } catch (err) {
      setError('Failed to delete feedback')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Feedbacks</h1>
            <p className="text-muted-foreground">
              {pagination.total_count} feedback{pagination.total_count !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
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
                <TableHead>Category</TableHead>
                <TableHead className="w-[40%]">Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : feedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No feedbacks found
                  </TableCell>
                </TableRow>
              ) : (
                feedbacks.map((feedback) => {
                  const catConfig = categoryConfig[feedback.category]
                  const CatIcon = catConfig.icon
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {feedback.user.avatar_url ? (
                            <img src={feedback.user.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{feedback.user.username}</div>
                            <div className="text-xs text-muted-foreground">{feedback.user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={catConfig.color}>
                          <CatIcon className="w-3 h-3 mr-1" />
                          {catConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2">{feedback.message}</p>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={feedback.status}
                          onValueChange={(value) => updateStatus(feedback.id, value)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <Badge variant="secondary" className={config.color}>
                                  {config.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDate(feedback.created_at)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(feedback.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
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
              onClick={() => fetchFeedbacks(pagination.current_page - 1)}
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
              onClick={() => fetchFeedbacks(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.total_pages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete feedback?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The feedback will be permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
