'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, ProtectedRoute } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Globe, Wrench, Shield, Bell, ChevronRight } from 'lucide-react'
import type { Language } from '@/lib/translations'

function ProfileContent() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  async function fetchProfile() {
    const supabaseClient = createClient() as any
    const { data } = await supabaseClient.from('profiles').select('*').eq('id', user?.id).single()
    if (data) {
      setProfile(data)
      setLanguage(data.language_preference || 'en')
    }
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function updateLanguage(lang: Language) {
    setLanguage(lang)
    const supabaseClient = createClient() as any
    await supabaseClient.from('profiles').update({ language_preference: lang, updated_at: new Date().toISOString() }).eq('id', user?.id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-3 animate-float">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-xl font-bold">{profile?.full_name || 'User'}</h1>
          <p className="text-emerald-100 text-sm mt-1">{user.email}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          {profile?.phone && (
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 text-sm">Phone</span>
              <span className="font-medium text-gray-900">{profile.phone}</span>
            </div>
          )}
          {profile?.city && (
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <span className="text-gray-500 text-sm">City</span>
              <span className="font-medium text-gray-900">{profile.city}</span>
            </div>
          )}
          <div className="flex items-center justify-between py-2 border-t border-gray-100">
            <span className="text-gray-500 text-sm">Loyalty Status</span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${profile?.loyalty_status === 'returning' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
              {profile?.loyalty_status === 'returning' ? 'Returning User' : 'New User'}
            </span>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="px-5 mt-4">
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={18} className="text-gray-600" />
            <h3 className="font-bold text-gray-900">Language</h3>
          </div>
          <div className="space-y-2">
            {[
              { value: 'en', label: 'English' },
              { value: 'ur-rom', label: 'Roman Urdu' },
              { value: 'ur', label: 'Urdu (اردو)' },
            ].map((lang) => (
              <button
                key={lang.value}
                onClick={() => updateLanguage(lang.value as Language)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between ${
                  language === lang.value
                    ? 'bg-emerald-50 border-2 border-emerald-500 text-emerald-700 font-medium'
                    : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                }`}
              >
                {lang.label}
                {language === lang.value && <ChevronRight size={16} className="text-emerald-600" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Credits */}
      <div className="px-5 mt-6">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 text-center border border-emerald-100">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Wrench size={18} className="text-emerald-600" />
            <span className="font-bold text-gray-900">Karigar.ai</span>
          </div>
          <p className="text-xs text-gray-500">
            Developed by <span className="text-emerald-600 font-medium">Shunaid Ahmed</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">AI Seekho 2026 • Har Karigar, Ek Click Dur</p>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5 mt-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 font-medium transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  )
}
