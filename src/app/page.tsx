'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { LoginForm, SignupForm } from '@/components/auth/AuthForms'
import { OnboardingModal } from '@/components/auth/OnboardingModal'
import { createClient } from '@/lib/supabase/client'
import {
  Search,
  Mic,
  Wrench,
  Zap,
  Droplets,
  BookOpen,
  Car,
  Flame,
  Lightbulb,
  Clock,
  Star,
  Sparkles,
  ArrowRight,
  Bell,
  User,
  Settings,
  ChevronRight,
  TrendingUp,
  Shield,
  Award,
} from 'lucide-react'

const services = [
  { name: 'AC Repair', icon: '❄️', color: 'from-blue-400 to-blue-600', bg: 'bg-blue-50' },
  { name: 'Electrician', icon: '⚡', color: 'from-yellow-400 to-orange-500', bg: 'bg-yellow-50' },
  { name: 'Plumber', icon: '🔧', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50' },
  { name: 'Home Tutor', icon: '📚', color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
  { name: 'Mechanic', icon: '🔩', color: 'from-red-400 to-red-600', bg: 'bg-red-50' },
  { name: 'Gas Refill', icon: '🔥', color: 'from-orange-400 to-red-500', bg: 'bg-orange-50' },
]

const quickActions = [
  { name: 'Quick Book', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: 'Track Order', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Support', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
]

const featuredCards = [
  { title: 'Premium Providers', subtitle: 'Verified & Rated', color: 'from-emerald-500 to-teal-600', icon: Award },
  { title: 'Instant Booking', subtitle: 'Book in 30 seconds', color: 'from-blue-500 to-indigo-600', icon: Zap },
  { title: 'Fair Pricing', subtitle: 'No hidden charges', color: 'from-purple-500 to-pink-600', icon: TrendingUp },
]

export default function HomePage() {
  const { user, loading, onboardingCompleted, setOnboardingCompleted } = useAuth()
  const router = useRouter()
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [greeting, setGreeting] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  useEffect(() => {
    if (user && !onboardingCompleted) {
      setShowOnboarding(true)
    }
  }, [user, onboardingCompleted])

  useEffect(() => {
    if (user) fetchRecentBookings()
  }, [user])

  async function fetchRecentBookings() {
    const supabase = createClient() as any
    const { data } = await supabase
      .from('bookings')
      .select('id, service_type, status, created_at')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(2)
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
    if (!user) {
      setShowAuth(true)
      return
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported')
      return
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ur-PK'
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      router.push(`/book?q=${encodeURIComponent(transcript)}`)
    }
    recognition.start()
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setOnboardingCompleted(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center p-6">
          <div className="text-center mb-8 animate-float">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <Wrench size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Karigar.ai</h1>
            <p className="text-gray-500 mt-1">Har Karigar, Ek Click Dur</p>
          </div>
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-6 animate-scale-in">
            {isLogin ? (
              <LoginForm onSwitch={() => setIsLogin(false)} />
            ) : (
              <SignupForm onSwitch={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden animate-gradient">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 animate-float" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          
          <div className="relative">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-emerald-100 text-sm">{greeting} 👋</p>
                <h1 className="text-2xl font-bold mt-1">{user.user_metadata?.full_name || 'User'}</h1>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all"
              >
                <User size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg shadow-black/10">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="What service do you need?"
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
                />
              </div>
              <button
                onClick={handleVoiceSearch}
                className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-200 transition-all"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-4 grid grid-cols-3 gap-4 animate-scale-in">
            {quickActions.map((action, idx) => (
              <button
                key={action.name}
                onClick={() => router.push(action.name === 'Quick Book' ? '/book' : action.name === 'Track Order' ? '/bookings' : '/disputes')}
                className={`flex flex-col items-center gap-2 group animate-slide-up stagger-${idx + 1}`}
              >
                <div className={`w-12 h-12 ${action.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 group-active:scale-95 transition-all shadow-sm`}>
                  <action.icon size={20} className={action.color} />
                </div>
                <span className="text-xs font-medium text-gray-700">{action.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promotional Banner */}
        <div className="px-5 mt-6 animate-slide-up stagger-2">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-5 text-white relative overflow-hidden hover:shadow-lg hover:shadow-orange-200/50 transition-all cursor-pointer group">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-4 translate-x-8 group-hover:scale-110 transition-transform" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-yellow-300 animate-pulse" />
                <span className="font-semibold">You're here! ✨</span>
              </div>
              <p className="text-sm text-white/90 mb-3">Let's make service things happen. Book your first karigar now!</p>
              <button
                onClick={() => router.push('/book')}
                className="bg-white text-orange-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all"
              >
                Book Now →
              </button>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="px-5 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Services</h2>
          <div className="grid grid-cols-3 gap-3">
            {services.map((service, idx) => (
              <button
                key={service.name}
                onClick={() => router.push(`/book?q=${encodeURIComponent(service.name)}`)}
                className={`${service.bg} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 hover:shadow-md active:scale-95 transition-all animate-slide-up`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <span className="text-3xl">{service.icon}</span>
                <span className="text-xs font-medium text-gray-700 text-center">{service.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Cards */}
        <div className="px-5 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Why Karigar.ai?</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide">
            {featuredCards.map((card, idx) => (
              <div
                key={card.title}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 min-w-[160px] text-white flex-shrink-0 hover:scale-105 hover:shadow-lg transition-all cursor-pointer animate-slide-left`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <card.icon size={24} className="mb-3 opacity-80" />
                <h3 className="font-semibold text-sm">{card.title}</h3>
                <p className="text-xs text-white/80 mt-1">{card.subtitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        {recentBookings.length > 0 && (
          <div className="px-5 mt-6 animate-slide-up stagger-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
              <button
                onClick={() => router.push('/bookings')}
                className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {recentBookings.map((booking, idx) => (
                <button
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Wrench size={18} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 text-sm">{booking.service_type}</p>
                      <p className="text-xs text-gray-500 capitalize">{booking.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom spacing for nav */}
        <div className="h-8" />
      </div>
    </>
  )
}
