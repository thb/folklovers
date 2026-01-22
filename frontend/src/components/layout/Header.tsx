import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Guitar, LogOut, Shield, Plus, Menu, Sparkles, Map, MessageSquare, ChevronDown, Trophy, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useAuth } from '@/lib/auth'
import { HeaderSearch } from './HeaderSearch'
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown'

export function Header() {
  const [isMounted, setIsMounted] = useState(false)
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Avoid SSR hydration mismatch - auth state only available on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // During SSR, treat as not authenticated to avoid hydration issues
  const showAuth = isMounted && isAuthenticated
  const showAdmin = isMounted && isAdmin

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Guitar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Folk Lovers
            </h1>
            <p className="text-xs text-muted-foreground -mt-1 font-mono">
              Since 1961
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: 'text-sm font-medium text-foreground' }}
          >
            Home
          </Link>
          <Link
            to="/songs"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: 'text-sm font-medium text-foreground' }}
          >
            Songs
          </Link>
          <Link
            to="/articles"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeProps={{ className: 'text-sm font-medium text-foreground' }}
          >
            Articles
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                Community
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/rankings" className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  Rankings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/changelog" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  What's New
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/roadmap" className="cursor-pointer">
                  <Map className="mr-2 h-4 w-4" />
                  Roadmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/feedback" className="cursor-pointer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Feedback
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <HeaderSearch />
        </nav>

        {/* Auth - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {showAuth && (
            <Link to="/covers/new">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add a cover
              </Button>
            </Link>
          )}
          {showAuth && <NotificationDropdown />}
          {showAuth && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/me" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    My Space
                  </Link>
                </DropdownMenuItem>
                {showAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      Administration
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center gap-1 md:hidden">
          {showAuth && <NotificationDropdown />}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-6 px-4">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
              <Link
                to="/songs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary transition-colors"
              >
                Songs
              </Link>
              <Link
                to="/articles"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-foreground hover:text-primary transition-colors"
              >
                Articles
              </Link>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Community</p>
                <div className="flex flex-col gap-2 pl-2">
                  <Link
                    to="/rankings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Trophy className="w-4 h-4" />
                    Rankings
                  </Link>
                  <Link
                    to="/changelog"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    What's New
                  </Link>
                  <Link
                    to="/roadmap"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <Map className="w-4 h-4" />
                    Roadmap
                  </Link>
                  <Link
                    to="/feedback"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Feedback
                  </Link>
                </div>
              </div>
              {showAuth && (
                <Link
                  to="/covers/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add a cover
                </Link>
              )}
              {showAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-medium text-foreground hover:text-primary transition-colors"
                >
                  <Shield className="w-4 h-4 inline mr-2" />
                  Administration
                </Link>
              )}
              <hr className="border-border" />
              {showAuth && user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/me"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    My Space
                  </Link>
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive hover:text-destructive"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        </div>
      </div>
    </header>
  )
}
