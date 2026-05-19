'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

const statusIcons: Record<string, any> = {
  requested: Clock,
  understood: Clock,
  provider_selected: Clock,
  slot_confirmed: Clock,
  price_approved: Clock,
  booking_confirmed: CheckCircle,
  in_progress: Clock,
  completed: CheckCircle,
  closed: CheckCircle,
  disputed: AlertCircle,
  resolved: CheckCircle,
  cancelled: AlertCircle,
}

const statusColors: Record<string, string> = {
  booking_confirmed: 'text-emerald-600',
  in_progress: 'text-blue-600',
  completed: 'text-emerald-600',
  closed: 'text-gray-600',
  disputed: 'text-red-600',
  resolved: 'text-emerald-600',
  cancelled: 'text-gray-400',
}

export default function BookingsPage() {
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
    return <div className="py-8 text-center text-gray-500">Loading bookings...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">No bookings yet</p>
        <button
          onClick={() => router.push('/book')}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
        >
          Book a Service
        </button>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-4">
      <h1 className="text-xl font-bold">Your Bookings</h1>
      {bookings.map((booking) => {
        const Icon = statusIcons[booking.status] || Clock
        const color = statusColors[booking.status] || 'text-gray-600'

        return (
          <button
            key={booking.id}
            onClick={() => router.push(`/bookings/${booking.id}`)}
            className="w-full bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-emerald-500"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{booking.service_type}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {booking.providers?.name || 'Provider'}
                </p>
              </div>
              <div className={`flex items-center gap-1 ${color}`}>
                <Icon size={16} />
                <span className="text-sm capitalize">{booking.status.replace('_', ' ')}</span>
              </div>
            </div>
            {booking.total_price_pkr && (
              <p className="text-sm font-medium text-gray-700 mt-2">
                PKR {booking.total_price_pkr}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(booking.created_at).toLocaleDateString()}
            </p>
          </button>
        )
      })}
    </div>
  )
}
