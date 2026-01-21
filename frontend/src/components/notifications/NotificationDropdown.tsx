import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Bell, ThumbsUp, ThumbsDown, Music, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { notifications, type Notification } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export function NotificationDropdown() {
  const { token } = useAuth()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notifications.list(token!),
    enabled: !!token,
    refetchInterval: 60000, // Refresh every minute
  })

  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notifications.markAsRead(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notifications.markAllAsRead(token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unreadCount = data?.unread_count ?? 0
  const notificationsList = data?.notifications ?? []

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id)
    }
    setIsOpen(false)
  }

  const getNotificationContent = (notification: Notification) => {
    const { type, data } = notification

    if (type === 'vote_received') {
      const isUpvote = data.vote_value === 1
      return {
        icon: isUpvote ? (
          <ThumbsUp className="h-4 w-4 text-green-600" />
        ) : (
          <ThumbsDown className="h-4 w-4 text-red-600" />
        ),
        text: (
          <>
            Someone {isUpvote ? 'upvoted' : 'downvoted'} your cover of{' '}
            <span className="font-medium">{data.cover_artist}</span> on{' '}
            <span className="font-medium">{data.song_title}</span>
          </>
        ),
        link: data.song_slug ? `/songs/${data.song_slug}` : undefined,
      }
    }

    if (type === 'new_cover_on_song') {
      return {
        icon: <Music className="h-4 w-4 text-primary" />,
        text: (
          <>
            New cover by <span className="font-medium">{data.cover_artist}</span> on{' '}
            <span className="font-medium">{data.song_title}</span>
          </>
        ),
        link: data.song_slug ? `/songs/${data.song_slug}` : undefined,
      }
    }

    return {
      icon: <Bell className="h-4 w-4" />,
      text: 'New notification',
      link: undefined,
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="font-semibold text-sm">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Loading...
          </div>
        ) : notificationsList.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notificationsList.map((notification) => {
              const content = getNotificationContent(notification)
              const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })

              const itemContent = (
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-0.5">{content.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-snug">{content.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              )

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'px-3 py-3 cursor-pointer focus:bg-accent',
                    !notification.read && 'bg-accent/50'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                  asChild={!!content.link}
                >
                  {content.link ? (
                    <Link to={content.link}>{itemContent}</Link>
                  ) : (
                    itemContent
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
