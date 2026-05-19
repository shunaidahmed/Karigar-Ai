'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { AgentTracePanel } from '@/components/agents/AgentTracePanel'
import {
  ArrowLeft,
  Check,
  Clock,
  Star,
  MessageSquare,
  Calendar,
  MapPin,
  Bell,
  Phone,
  Truck,
  Play,
  FileText,
  MessageCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface BookingStep {
  key: string
  label: string
  description: string
  icon: any
  estimatedTime: string
  status: 'pending' | 'active' | 'completed'
  detail?: string
}

const initialSteps: BookingStep[] = [
  {
    key: 'created',
    label: 'Booking Created',
    description: 'Your booking request has been submitted successfully',
    icon: Check,
    estimatedTime: 'Instant',
    status: 'completed',
    detail: 'Booking ID generated and saved to system',
  },
  {
    key: 'notified',
    label: 'Provider Notified',
    description: 'Provider has been notified about your booking request',
    icon: Bell,
    estimatedTime: '~30 seconds',
    status: 'pending',
    detail: 'WhatsApp message sent to provider',
  },
  {
    key: 'accepted',
    label: 'Provider Accepted',
    description: 'Provider has accepted your booking request',
    icon: Phone,
    estimatedTime: '~2 minutes',
    status: 'pending',
    detail: 'Provider confirmed availability',
  },
  {
    key: 'calendar',
    label: 'Calendar Updated',
    description: 'Time slot has been locked in the system',
    icon: Calendar,
    estimatedTime: '~5 seconds',
    status: 'pending',
    detail: 'Slot reserved, no double-booking possible',
  },
  {
    key: 'confirmation',
    label: 'Confirmation Sent',
    description: 'Booking confirmation sent to your phone',
    icon: MessageSquare,
    estimatedTime: '~10 seconds',
    status: 'pending',
    detail: 'SMS with booking details sent',
  },
  {
    key: 'reminder_scheduled',
    label: 'Reminder Scheduled',
    description: 'Reminder set for 1 hour before appointment',
    icon: Bell,
    estimatedTime: 'Scheduled',
    status: 'pending',
    detail: 'Reminder queued for T-60 minutes',
  },
  {
    key: 'reminder_fired',
    label: 'Reminder Sent',
    description: 'Reminder notification delivered',
    icon: Bell,
    estimatedTime: '1 hour before',
    status: 'pending',
    detail: 'Push notification and SMS sent',
  },
  {
    key: 'en_route',
    label: 'Provider En Route',
    description: 'Provider is on the way to your location',
    icon: Truck,
    estimatedTime: '~15-30 min',
    status: 'pending',
    detail: 'Live tracking available',
  },
  {
    key: 'arrived',
    label: 'Provider Arrived',
    description: 'Provider has reached your location',
    icon: MapPin,
    estimatedTime: 'At location',
    status: 'pending',
    detail: 'Provider checked in at your address',
  },
  {
    key: 'started',
    label: 'Job Started',
    description: 'Service work has begun',
    icon: Play,
    estimatedTime: 'In progress',
    status: 'pending',
    detail: 'Timer started for service duration',
  },
  {
    key: 'completed',
    label: 'Job Completed',
    description: 'Service work has been finished',
    icon: Check,
    estimatedTime: 'Done',
    status: 'pending',
    detail: 'Completion checklist verified',
  },
  {
    key: 'invoice',
    label: 'Invoice Generated',
    description: 'Final receipt has been generated',
    icon: FileText,
    estimatedTime: 'Instant',
    status: 'pending',
    detail: 'Itemized bill available for download',
  },
  {
    key: 'feedback',
    label: 'Feedback Requested',
    description: 'Please rate your experience',
    icon: MessageCircle,
    estimatedTime: 'Your turn',
    status: 'pending',
    detail: 'Your feedback helps improve the platform',
  },
]

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [booking, setBooking] = useState<any>(null)
  const [provider, setProvider] = useState<any>(null)
  const [steps, setSteps] = useState<BookingStep[]>(initialSteps)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [traces, setTraces] = useState<any[]>([])
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [showNotification, setShowNotification] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchBooking()
  }, [user, id])

  useEffect(() => {
    if (booking?.status === 'booking_confirmed') {
      startBookingSimulation()
    } else if (booking?.status === 'completed' || booking?.status === 'closed') {
      completeAllSteps()
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

  function startBookingSimulation() {
    setCurrentStepIndex(0)
    setSteps(initialSteps.map((s, i) => ({
      ...s,
      status: i === 0 ? 'completed' : 'pending',
    })))

    const delays = [1500, 2000, 2500, 1000, 1500, 1000, 1500, 3000, 2000, 1500, 2000, 1000, 0]

    delays.forEach((delay, index) => {
      if (index === 0) return

      setTimeout(() => {
        setCurrentStepIndex(index)
        setSteps((prev) =>
          prev.map((s, i) => ({
            ...s,
            status: i < index ? 'completed' : i === index ? 'active' : 'pending',
          }))
        )

        const step = initialSteps[index]
        setShowNotification(step.label)
        setTimeout(() => setShowNotification(null), 3000)
      }, delays.slice(0, index + 1).reduce((a, b) => a + b, 0))
    })
  }

  function completeAllSteps() {
    setCurrentStepIndex(12)
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status: 'completed',
      }))
    )
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

  function toggleStep(key: string) {
    setExpandedStep(expandedStep === key ? null : key)
  }

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading booking details...</div>
  }

  if (!booking) {
    return <div className="py-12 text-center text-gray-500">Booking not found</div>
  }

  return (
    <div className="py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back to Bookings</span>
      </button>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in flex items-center gap-2">
          <Check size={16} />
          <span className="text-sm font-medium">{showNotification}</span>
        </div>
      )}

      {/* Booking Header Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{booking.service_type}</h1>
            {provider && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  {provider.name} — {provider.city}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar size={14} />
                  {booking.preferred_time_window || 'Scheduled'}
                </div>
              </div>
            )}
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
              booking.status === 'completed' || booking.status === 'closed'
                ? 'bg-emerald-100 text-emerald-700'
                : booking.status === 'disputed'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {booking.status.replace('_', ' ')}
          </span>
        </div>

        {booking.total_price_pkr && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-500 text-sm">Total Amount</span>
            <span className="text-2xl font-bold text-emerald-600">PKR {booking.total_price_pkr}</span>
          </div>
        )}
      </div>

      {/* Booking Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Booking Progress</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isCompleted = step.status === 'completed'
            const isActive = step.status === 'active'
            const isExpanded = expandedStep === step.key

            return (
              <div key={step.key} className={`transition-all ${isActive ? 'bg-emerald-50/50' : ''}`}>
                <button
                  onClick={() => toggleStep(step.key)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {/* Status Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600 ring-offset-2'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-medium text-sm ${
                          isCompleted ? 'text-gray-900' : isActive ? 'text-emerald-700' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      <span className="text-xs text-gray-400 ml-2">{step.estimatedTime}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{step.description}</p>
                  </div>

                  {/* Expand Arrow */}
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pl-14">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-2">
                      <p className="text-gray-700">{step.detail}</p>
                      {isActive && (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Clock size={14} />
                          <span className="text-xs">Processing...</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Check size={14} />
                          <span className="text-xs">Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mock Notification Preview */}
      {currentStepIndex >= 1 && currentStepIndex < 3 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Provider Notification</h3>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <MessageSquare size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-green-700">WhatsApp</span>
            </div>
            <p className="text-sm text-green-800">
              New booking request: {booking.service_type} at {booking.preferred_time_window || 'scheduled time'}. 
              Please confirm your availability.
            </p>
          </div>
        </div>
      )}

      {/* Mock SMS Preview */}
      {currentStepIndex >= 4 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Confirmation SMS</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageSquare size={12} className="text-white" />
              </div>
              <span className="text-xs font-medium text-blue-700">SMS</span>
            </div>
            <p className="text-sm text-blue-800">
              Karigar.ai: Your booking #{booking.id.slice(0, 8)} for {booking.service_type} with {provider?.name || 'provider'} is confirmed. 
              Time: {booking.preferred_time_window || 'Scheduled'}. Total: PKR {booking.total_price_pkr}.
            </p>
          </div>
        </div>
      )}

      {/* Mock Tracking Preview */}
      {currentStepIndex >= 7 && currentStepIndex < 9 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Provider Location</h3>
          <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
            <div className="text-center">
              <Truck size={24} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">
                {currentStepIndex === 7 ? 'Provider is on the way...' : 'Provider has arrived!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      {currentStepIndex >= 11 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Invoice</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Service</span>
              <span className="font-medium">{booking.service_type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Provider</span>
              <span className="font-medium">{provider?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">{booking.preferred_time_window || 'N/A'}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-emerald-600">PKR {booking.total_price_pkr}</span>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {currentStepIndex >= 12 && !booking.feedback_rating && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-emerald-600" />
            <h2 className="font-semibold">Rate Your Experience</h2>
          </div>
          <p className="text-sm text-gray-500">Your feedback helps improve the platform</p>
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
      {currentStepIndex >= 10 && !booking.feedback_rating && (
        <button
          onClick={() => router.push(`/disputes/new?booking=${booking.id}`)}
          className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 font-medium"
        >
          <AlertTriangle size={16} />
          Report a Problem
        </button>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}
