'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { AgentTracePanel } from '@/components/agents/AgentTracePanel'
import { ArrowLeft, Check, Circle, Clock, Star, MessageSquare } from 'lucide-react'

const bookingSteps = [
  { key: 'created', label: 'Booking Created', icon: 'check' },
  { key: 'notified', label: 'Provider Notified', icon: 'check' },
  { key: 'accepted', label: 'Provider Accepted', icon: 'check' },
  { key: 'calendar', label: 'Calendar Updated', icon: 'check' },
  { key: 'confirmation', label: 'Confirmation Sent', icon: 'check' },
  { key: 'reminder_scheduled', label: 'Reminder Scheduled', icon: 'check' },
  { key: 'reminder_fired', label: 'Reminder Sent', icon: 'check' },
  { key: 'en_route', label: 'Provider En Route', icon: 'clock' },
  { key: 'arrived', label: 'Provider Arrived', icon: 'clock' },
  { key: 'started', label: 'Job Started', icon: 'clock' },
  { key: 'completed', label: 'Job Completed', icon: 'clock' },
  { key: 'invoice', label: 'Invoice Generated', icon: 'clock' },
  { key: 'feedback', label: 'Feedback Requested', icon: 'clock' },
]

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFeedback, setShowFeedback] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [traces, setTraces] = useState<any[]>([])

  useEffect(() => {
    if (user) fetchBooking()
  }, [user, id])

  // Animate steps
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
    const supabase = createClient()

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

      // Fetch traces for this booking
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

    const supabase = createClient()
    const supabaseClient = supabase as any
    await supabaseClient
      .from('bookings')
      .update({
        feedback_rating: rating,
        feedback_comment: comment,
        status: 'closed',
      })
      .eq('id', booking.id)

    setShowFeedback(false)
    fetchBooking()
  }

  if (loading) {
    return <div className="py-8 text-center text-gray-500">Loading...</div>
  }

  if (!booking) {
    return <div className="py-8 text-center text-gray-500">Booking not found</div>
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
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h1 className="text-xl font-bold">{booking.service_type}</h1>
        {provider && (
          <p className="text-gray-600 mt-1">{provider.name}</p>
        )}
        <p className="text-sm text-gray-500 mt-2 capitalize">
          Status: {booking.status.replace('_', ' ')}
        </p>
        {booking.total_price_pkr && (
          <p className="text-lg font-semibold text-emerald-600 mt-2">
            PKR {booking.total_price_pkr}
          </p>
        )}
      </div>

      {/* Timeline Tracker */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-4">Booking Progress</h2>
        <div className="space-y-0">
          {bookingSteps.map((step, idx) => {
            const isCompleted = idx <= currentStep
            const isCurrent = idx === currentStep
            const isCompletedStatus = ['completed', 'closed', 'resolved'].includes(booking.status)
            const actuallyCompleted = isCompletedStatus ? true : isCompleted

            return (
              <div key={step.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      actuallyCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-emerald-100 text-emerald-600 animate-pulse-ring'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {actuallyCompleted ? (
                      <Check size={14} />
                    ) : step.icon === 'clock' ? (
                      <Clock size={14} />
                    ) : (
                      <Circle size={14} />
                    )}
                  </div>
                  {idx < bookingSteps.length - 1 && (
                    <div
                      className={`w-0.5 h-8 ${
                        actuallyCompleted ? 'bg-emerald-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-medium ${
                      actuallyCompleted ? 'text-gray-900' : 'text-gray-400'
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
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Rate Your Experience</h2>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="text-2xl"
              >
                <Star
                  size={28}
                  className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment (optional)..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            rows={3}
          />
          <button
            onClick={submitFeedback}
            disabled={rating === 0}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Submit Feedback
          </button>
        </div>
      )}

      {/* Show feedback if already submitted */}
      {booking.feedback_rating && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-1">
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

      {/* Report Problem Button */}
      {['completed', 'closed'].includes(booking.status) && (
        <button
          onClick={() => router.push(`/disputes/new?booking=${booking.id}`)}
          className="w-full py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2"
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
