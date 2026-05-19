'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type AuthContextType = {
  user: User | null
  supabase: SupabaseClient<Database>
  loading: boolean
  onboardingCompleted: boolean
  setOnboardingCompleted: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingCompleted, setOnboardingCompleted] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await checkOnboarding(session.user.id)
      } else {
        setOnboardingCompleted(true)
      }
      setLoading(false)
    })

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await checkOnboarding(session.user.id)
      } else {
        setOnboardingCompleted(true)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function checkOnboarding(userId: string) {
    const supabaseClient = createClient() as any
    const { data } = await supabaseClient
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .single()
    setOnboardingCompleted(data?.onboarding_completed ?? false)
  }

  return (
    <AuthContext.Provider value={{ user, supabase, loading, onboardingCompleted, setOnboardingCompleted }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
