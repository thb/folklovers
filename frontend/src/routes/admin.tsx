import { createFileRoute, Outlet, Link, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Music, Disc, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const { isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate({ to: '/' })
    }
  }, [isAdmin, isLoading, navigate])

  if (isLoading || !isAdmin) {
    return null
  }

  return (
    <div>
      {/* Admin Navigation */}
      <div className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex items-center gap-1">
            <NavLink to="/admin" icon={<Music className="w-4 h-4" />} exact>
              Dashboard
            </NavLink>
            <NavLink to="/admin/songs" icon={<Music className="w-4 h-4" />}>
              Songs
            </NavLink>
            <NavLink to="/admin/covers" icon={<Disc className="w-4 h-4" />}>
              Covers
            </NavLink>
            <NavLink to="/admin/users" icon={<Users className="w-4 h-4" />}>
              Users
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <Outlet />
    </div>
  )
}

function NavLink({
  to,
  children,
  icon,
  exact = false
}: {
  to: string
  children: React.ReactNode
  icon?: React.ReactNode
  exact?: boolean
}) {
  return (
    <Link
      to={to}
      activeOptions={{ exact }}
      className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent transition-colors"
      activeProps={{
        className: 'flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground border-b-2 border-primary transition-colors'
      }}
    >
      {icon}
      {children}
    </Link>
  )
}
