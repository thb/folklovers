import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { useNavigate } from '@tanstack/react-router'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
        }
      }
    }
  }
}

type GoogleIdConfig = {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
}

type GoogleButtonConfig = {
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  width?: number
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  locale?: string
}

type GoogleCredentialResponse = {
  credential: string
}

type Props = {
  onError?: (error: string) => void
  onSuccess?: () => void
}

export function GoogleSignInButton({ onError, onSuccess }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  const renderButton = useCallback(() => {
    if (!window.google || !buttonRef.current || !containerRef.current) return

    // Clear previous button
    buttonRef.current.innerHTML = ''

    // Calculate width based on container, max 400px
    const containerWidth = containerRef.current.offsetWidth
    const buttonWidth = Math.min(containerWidth, 400)

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      width: buttonWidth,
      text: 'continue_with',
      shape: 'rectangular',
      locale: 'fr',
    })
  }, [])

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (!clientId) {
      console.error('VITE_GOOGLE_CLIENT_ID is not configured')
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        })
        setIsGoogleLoaded(true)
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Render button when Google is loaded and on resize
  useEffect(() => {
    if (!isGoogleLoaded) return

    renderButton()

    const handleResize = () => renderButton()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [isGoogleLoaded, renderButton])

  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    setIsLoading(true)
    try {
      await loginWithGoogle(response.credential)
      if (onSuccess) {
        onSuccess()
      } else {
        navigate({ to: '/' })
      }
    } catch (err) {
      onError?.('Erreur lors de la connexion avec Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={containerRef} className="w-full">
      <div
        ref={buttonRef}
        className={`flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />
    </div>
  )
}
