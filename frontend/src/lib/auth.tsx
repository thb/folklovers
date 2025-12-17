import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { auth as authApi, type User } from './api'

type AuthContextType = {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const TOKEN_KEY = 'folklovers_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const saveToken = useCallback((newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
  }, [])

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const fetchUser = useCallback(async (authToken: string) => {
    try {
      const { user } = await authApi.me(authToken)
      setUser(user)
      setToken(authToken)
    } catch {
      clearAuth()
    }
  }, [clearAuth])

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      fetchUser(storedToken).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.login({ email, password })
    saveToken(newToken)
    setUser(newUser)
  }

  const register = async (email: string, username: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.register({ email, username, password })
    saveToken(newToken)
    setUser(newUser)
  }

  const loginWithGoogle = async (credential: string) => {
    const { token: newToken, user: newUser } = await authApi.google({ credential })
    saveToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    clearAuth()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
