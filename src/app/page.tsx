'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm, SignupForm } from '@/components/auth/AuthForms'
import { Mic, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const trendingServices = [
  'AC Repair',
  'Electrician',
  'Plumber',
  'Home Tutor',
  'Mechanic',
  'Gas Refill',
  'Wiring',
  'Pipe Leak',
]

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentBookings, setRecentBookings] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchRecentBookings()
    }
  }, [user])

  async function fetchRecentBookings() {
    const supabase = createClient() as any
    const { data } = await supabase
      .from('bookings')
      .select('id, service_type, status, created_at, provider_id')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(3)

    if (data) setRecentBookings(data)
  }

  const handleSearch = () => {
    if (!user) {
      setShowAuth(true)
      return
    }
    if (searchQuery.trim()) {
      router.push(`/book?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ur-PK'
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      router.push(`/book?q=${encodeURIComponent(transcript)}`)
    }

    recognition.onerror = () => {
      alert('Voice recognition failed. Please try again.')
    }

    recognition.start()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (showAuth || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-600">Karigar.ai</h1>
          <p className="text-gray-600 mt-1">Har Karigar, Ek Click Dur</p>
        </div>
        {isLogin ? (
          <LoginForm onSwitch={() => setIsLogin(false)} />
        ) : (
          <SignupForm onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-emerald-600">Karigar.ai</h1>
        <p className="text-sm text-gray-500 mt-1">Har Karigar, Ek Click Dur</p>
      </div>

      {/* Search Bar */}
      <div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Describe what you need..."
            className="w-full rounded-xl border border-gray-300 pl-4 pr-24 py-3 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              onClick={handleVoiceSearch}
              className="p-2 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
              aria-label="Voice search"
            >
              <Mic size={20} />
            </button>
            <button
              onClick={handleSearch}
              className="p-2 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Quick examples */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            'AC theek karo G-13',
            'Electrician chahiye',
            'Plumber for leak',
            'Math tutor needed',
            'Car mechanic',
          ].map((example) => (
            <button
              key={example}
              onClick={() => {
                setSearchQuery(example)
                router.push(`/book?q=${encodeURIComponent(example)}`)
              }}
              className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 hover:bg-emerald-100"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Trending Services */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-2">Trending Services</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {trendingServices.map((service) => (
            <button
              key={service}
              onClick={() => {
                setSearchQuery(service)
                router.push(`/book?q=${encodeURIComponent(service)}`)
              }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600"
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Recent Bookings</h2>
          <div className="space-y-2">
            {recentBookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-left hover:border-emerald-500"
              >
                <p className="font-medium text-gray-900">{booking.service_type}</p>
                <p className="text-sm text-gray-500 capitalize">{booking.status.replace('_', ' ')}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
