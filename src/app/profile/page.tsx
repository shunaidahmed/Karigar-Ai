'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User, Globe, Wrench } from 'lucide-react'
import type { Language } from '@/lib/translations'

export default function ProfilePage() {
  const { user, supabase } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) fetchProfile()
  }, [user])

  async function fetchProfile() {
    const supabaseClient = createClient() as any
    const { data } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single()

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
    setSaving(true)

    const supabaseClient = createClient() as any
    await supabaseClient
      .from('profiles')
      .update({ language_preference: lang, updated_at: new Date().toISOString() })
      .eq('id', user?.id)

    setSaving(false)
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="py-6 space-y-6">
      <h1 className="text-xl font-bold">Profile</h1>

      {/* User Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
            <User size={24} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{profile?.full_name || 'User'}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          {profile?.phone && (
            <p className="text-sm text-gray-600">Phone: {profile.phone}</p>
          )}
          {profile?.city && (
            <p className="text-sm text-gray-600">City: {profile.city}</p>
          )}
          <p className="text-sm text-gray-600">
            Loyalty: <span className="font-medium">{profile?.loyalty_status === 'returning' ? 'Returning User' : 'New User'}</span>
          </p>
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Globe size={18} className="text-gray-600" />
          <h3 className="font-medium">Language</h3>
        </div>
        <div className="space-y-1">
          {[
            { value: 'en', label: 'English' },
            { value: 'ur-rom', label: 'Roman Urdu' },
            { value: 'ur', label: 'Urdu (اردو)' },
          ].map((lang) => (
            <button
              key={lang.value}
              onClick={() => updateLanguage(lang.value as Language)}
              disabled={saving}
              className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${
                language === lang.value
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 font-medium"
      >
        <LogOut size={16} />
        Logout
      </button>

      {/* Developer Credits */}
      <div className="pt-6 text-center border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Wrench size={16} className="text-emerald-600" />
          <span className="text-sm font-medium text-gray-700">Karigar.ai</span>
        </div>
        <p className="text-xs text-gray-400">
          Developed by <span className="text-emerald-600 font-medium">Shunaid Ahmed</span>
        </p>
        <p className="text-xs text-gray-300 mt-1">Har Karigar, Ek Click Dur</p>
      </div>
    </div>
  )
}
