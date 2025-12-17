import { useEffect, useRef, useState } from 'react'
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
}

export function GoogleSignInButton({ onError }: Props) {
  const buttonRef = useRef<HTMLDivElement>(null)
  const { loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

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
      if (window.google && buttonRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        })
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 400,
          text: 'continue_with',
          shape: 'rectangular',
          locale: 'fr',
        })
      }
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
    setIsLoading(true)
    try {
      await loginWithGoogle(response.credential)
      navigate({ to: '/' })
    } catch (err) {
      onError?.('Erreur lors de la connexion avec Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div
        ref={buttonRef}
        className={`flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      />
    </div>
  )
}
