'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, ProtectedRoute } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Clock, CheckCircle, AlertCircle, CalendarPlus, ChevronRight, Sparkles } from 'lucide-react'

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  booking_confirmed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Confirmed' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100', label: 'In Progress' },
  completed: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Completed' },
  closed: { icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' },
  disputed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Disputed' },
  resolved: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100', label: 'Resolved' },
  cancelled: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Cancelled' },
}

function BookingsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchBookings()
  }, [user])

  async function fetchBookings() {
    if (!user) return
    const supabase = createClient() as any
    const { data } = await supabase
      .from('bookings')
      .select('*, providers(name, skill)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (data) setBookings(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4 animate-float">
          <CalendarPlus size={32} className="text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">No bookings yet</h2>
        <p className="text-gray-500 text-sm mt-1 text-center">Book your first service and track it here</p>
        <button
          onClick={() => router.push('/book')}
          className="mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all"
        >
          Book a Service
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <h1 className="text-2xl font-bold relative">My Bookings</h1>
        <p className="text-emerald-100 text-sm mt-1 relative">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Bookings List */}
      <div className="px-5 -mt-4 relative z-10 space-y-3">
        {bookings.map((booking) => {
          const config = statusConfig[booking.status] || statusConfig.booking_confirmed
          const Icon = config.icon

          return (
            <button
              key={booking.id}
              onClick={() => router.push(`/bookings/${booking.id}`)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Icon size={20} className={config.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{booking.service_type}</h3>
                    <p className="text-sm text-gray-500">{booking.providers?.name || 'Provider'}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
                  {config.label}
                </div>
                {booking.total_price_pkr && (
                  <span className="font-bold text-gray-900">PKR {booking.total_price_pkr}</span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <ProtectedRoute>
      <BookingsContent />
    </ProtectedRoute>
  )
}
