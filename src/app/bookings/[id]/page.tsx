'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { AgentTracePanel } from '@/components/agents/AgentTracePanel'
import { ArrowLeft, Check, Circle, Clock, Star, MessageSquare, Calendar, MapPin } from 'lucide-react'

const bookingSteps = [
  { key: 'created', label: 'Booking Created' },
  { key: 'notified', label: 'Provider Notified' },
  { key: 'accepted', label: 'Provider Accepted' },
  { key: 'calendar', label: 'Calendar Updated' },
  { key: 'confirmation', label: 'Confirmation Sent' },
  { key: 'reminder_scheduled', label: 'Reminder Scheduled' },
  { key: 'reminder_fired', label: 'Reminder Sent' },
  { key: 'en_route', label: 'Provider En Route' },
  { key: 'arrived', label: 'Provider Arrived' },
  { key: 'started', label: 'Job Started' },
  { key: 'completed', label: 'Job Completed' },
  { key: 'invoice', label: 'Invoice Generated' },
  { key: 'feedback', label: 'Feedback Requested' },
]

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [traces, setTraces] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchBooking()
  }, [user, id])

  useEffect(() => {
    if (booking?.status === 'booking_confirmed' || booking?.status === 'in_progress') {
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= bookingSteps.length - 1) {
            clearInterval(interval)
            return prev
          }
          return prev + 1
        })
      }, 1500)
      return () => clearInterval(interval)
    } else if (booking?.status === 'completed' || booking?.status === 'closed') {
      setCurrentStep(bookingSteps.length - 1)
    }
  }, [booking])

  async function fetchBooking() {
    if (!user) return
    const supabase = createClient() as any

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (bookingData) {
      setBooking(bookingData)

      const bd = bookingData as any
      if (bd.provider_id) {
        const { data: providerData } = await supabase
          .from('providers')
          .select('*')
          .eq('id', bd.provider_id)
          .single()
        if (providerData) setProvider(providerData)
      }

      const { data: tracesData } = await supabase
        .from('agent_traces')
        .select('*')
        .eq('booking_id', bd.id)
        .order('created_at', { ascending: true })

      if (tracesData) setTraces(tracesData)
    }

    setLoading(false)
  }

  async function submitFeedback() {
    if (!booking || rating === 0) return

    const supabase = createClient() as any
    await supabase
      .from('bookings')
      .update({
        feedback_rating: rating,
        feedback_comment: comment,
        status: 'closed',
      })
      .eq('id', booking.id)

    setRating(0)
    setComment('')
    fetchBooking()
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading...</div>
  }

  if (!booking) {
    return <div className="py-12 text-center text-gray-500">Booking not found</div>
  }

  return (
    <div className="py-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back</span>
      </button>

      {/* Booking Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{booking.service_type}</h1>
            {provider && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <MapPin size={14} />
                {provider.name} — {provider.city}
              </div>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
            booking.status === 'completed' || booking.status === 'resolved'
              ? 'bg-emerald-100 text-emerald-700'
              : booking.status === 'disputed'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {booking.status.replace('_', ' ')}
          </span>
        </div>

        {booking.total_price_pkr && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
            <span className="text-gray-500 text-sm">Total:</span>
            <span className="text-2xl font-bold text-emerald-600">PKR {booking.total_price_pkr}</span>
          </div>
        )}

        {booking.preferred_time_window && (
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={14} />
            Time: {booking.preferred_time_window}
          </div>
        )}
      </div>

      {/* Timeline Tracker */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Booking Progress</h2>
        <div className="space-y-0">
          {bookingSteps.map((step, idx) => {
            const isCompletedStatus = ['completed', 'closed', 'resolved'].includes(booking.status)
            const actuallyCompleted = isCompletedStatus ? idx <= currentStep : idx < currentStep
            const isCurrent = idx === currentStep && !isCompletedStatus

            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      actuallyCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {actuallyCompleted ? <Check size={14} /> : <Circle size={14} />}
                  </div>
                  {idx < bookingSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        actuallyCompleted ? 'bg-emerald-600' : 'bg-gray-100'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6 pt-1.5">
                  <p
                    className={`text-sm ${
                      actuallyCompleted ? 'text-gray-900 font-medium' : isCurrent ? 'text-emerald-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Feedback Section */}
      {(booking.status === 'completed' || booking.status === 'closed') && !booking.feedback_rating && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold">Rate Your Experience</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment (optional)..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            rows={3}
          />
          <button
            onClick={submitFeedback}
            disabled={rating === 0}
            className="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
          >
            Submit Feedback
          </button>
        </div>
      )}

      {/* Existing Feedback */}
      {booking.feedback_rating && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="font-medium text-emerald-800 text-sm">Your Feedback</p>
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={16}
                className={
                  star <= booking.feedback_rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            ))}
          </div>
          {booking.feedback_comment && (
            <p className="text-sm text-gray-700 mt-2">{booking.feedback_comment}</p>
          )}
        </div>
      )}

      {/* Report Problem */}
      {['completed', 'closed'].includes(booking.status) && (
        <button
          onClick={() => router.push(`/disputes/new?booking=${booking.id}`)}
          className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 font-medium"
        >
          <MessageSquare size={16} />
          Report a Problem
        </button>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}
