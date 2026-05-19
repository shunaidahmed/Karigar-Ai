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
  Sparkles,
  Shield,
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
  { key: 'created', label: 'Booking Created', description: 'Your booking request has been submitted', icon: Check, estimatedTime: 'Instant', status: 'completed', detail: 'Booking ID generated' },
  { key: 'notified', label: 'Provider Notified', description: 'Provider has been notified', icon: Bell, estimatedTime: '~30s', status: 'pending', detail: 'WhatsApp message sent' },
  { key: 'accepted', label: 'Provider Accepted', description: 'Provider accepted your request', icon: Phone, estimatedTime: '~2 min', status: 'pending', detail: 'Provider confirmed' },
  { key: 'calendar', label: 'Calendar Updated', description: 'Time slot locked in system', icon: Calendar, estimatedTime: '~5s', status: 'pending', detail: 'Slot reserved' },
  { key: 'confirmation', label: 'Confirmation Sent', description: 'Confirmation sent to your phone', icon: MessageSquare, estimatedTime: '~10s', status: 'pending', detail: 'SMS sent' },
  { key: 'reminder_scheduled', label: 'Reminder Scheduled', description: 'Reminder set for 1 hour before', icon: Bell, estimatedTime: 'Scheduled', status: 'pending', detail: 'Reminder queued' },
  { key: 'reminder_fired', label: 'Reminder Sent', description: 'Reminder notification delivered', icon: Bell, estimatedTime: '1 hour before', status: 'pending', detail: 'Push notification sent' },
  { key: 'en_route', label: 'Provider En Route', description: 'Provider is on the way', icon: Truck, estimatedTime: '~15-30 min', status: 'pending', detail: 'Live tracking' },
  { key: 'arrived', label: 'Provider Arrived', description: 'Provider reached your location', icon: MapPin, estimatedTime: 'At location', status: 'pending', detail: 'Checked in' },
  { key: 'started', label: 'Job Started', description: 'Service work has begun', icon: Play, estimatedTime: 'In progress', status: 'pending', detail: 'Timer started' },
  { key: 'completed', label: 'Job Completed', description: 'Service work finished', icon: Check, estimatedTime: 'Done', status: 'pending', detail: 'Checklist verified' },
  { key: 'invoice', label: 'Invoice Generated', description: 'Final receipt generated', icon: FileText, estimatedTime: 'Instant', status: 'pending', detail: 'Bill available' },
  { key: 'feedback', label: 'Feedback Requested', description: 'Please rate your experience', icon: MessageCircle, estimatedTime: 'Your turn', status: 'pending', detail: 'Your feedback matters' },
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
        const { data: providerData } = await supabase.from('providers').select('*').eq('id', bd.provider_id).single()
        if (providerData) setProvider(providerData)
      }
      const { data: tracesData } = await supabase.from('agent_traces').select('*').eq('booking_id', bd.id).order('created_at', { ascending: true })
      if (tracesData) setTraces(tracesData)
    }
    setLoading(false)
  }

  function startBookingSimulation() {
    setCurrentStepIndex(0)
    setSteps(initialSteps.map((s, i) => ({ ...s, status: i === 0 ? 'completed' : 'pending' })))

    const delays = [1500, 2000, 2500, 1000, 1500, 1000, 1500, 3000, 2000, 1500, 2000, 1000, 0]

    delays.forEach((delay, index) => {
      if (index === 0) return
      setTimeout(() => {
        setCurrentStepIndex(index)
        setSteps((prev) => prev.map((s, i) => ({ ...s, status: i < index ? 'completed' : i === index ? 'active' : 'pending' })))
        const step = initialSteps[index]
        setShowNotification(step.label)
        setTimeout(() => setShowNotification(null), 3000)
      }, delays.slice(0, index + 1).reduce((a, b) => a + b, 0))
    })
  }

  function completeAllSteps() {
    setCurrentStepIndex(12)
    setSteps((prev) => prev.map((s) => ({ ...s, status: 'completed' })))
  }

  async function submitFeedback() {
    if (!booking || rating === 0) return
    const supabase = createClient() as any
    await supabase.from('bookings').update({ feedback_rating: rating, feedback_comment: comment, status: 'closed' }).eq('id', booking.id)
    setRating(0)
    setComment('')
    fetchBooking()
  }

  function toggleStep(key: string) {
    setExpandedStep(expandedStep === key ? null : key)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Booking not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <button onClick={() => router.back()} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 hover:bg-white/30 transition-all">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-bold">{booking.service_type}</h1>
          {provider && <p className="text-emerald-100 text-sm mt-1">{provider.name} • {provider.city}</p>}
          {booking.total_price_pkr && (
            <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <span className="text-emerald-100 text-sm">Total Amount</span>
              <span className="text-2xl font-bold">PKR {booking.total_price_pkr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <Sparkles size={16} />
          <span className="text-sm font-medium">{showNotification}</span>
        </div>
      )}

      {/* Progress Steps */}
      <div className="px-5 mt-6">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Booking Progress</h2>
            <p className="text-sm text-gray-500">Step {currentStepIndex + 1} of {steps.length}</p>
          </div>

          <div className="divide-y divide-gray-50">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = step.status === 'completed'
              const isActive = step.status === 'active'
              const isExpanded = expandedStep === step.key

              return (
                <div key={step.key} className={`transition-all ${isActive ? 'bg-emerald-50/50' : ''}`}>
                  <button
                    onClick={() => toggleStep(step.key)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium text-sm ${isCompleted ? 'text-gray-900' : isActive ? 'text-emerald-700' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        <span className="text-xs text-gray-400">{step.estimatedTime}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pl-14">
                      <div className="bg-gray-50 rounded-xl p-3 text-sm">
                        <p className="text-gray-700">{step.detail}</p>
                        {isActive && <div className="flex items-center gap-2 text-emerald-600 mt-2"><Clock size={14} /><span className="text-xs">Processing...</span></div>}
                        {isCompleted && <div className="flex items-center gap-2 text-emerald-600 mt-2"><Check size={14} /><span className="text-xs">Completed</span></div>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mock Notifications */}
      {currentStepIndex >= 1 && currentStepIndex < 3 && (
        <div className="px-5 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <span className="text-xs font-medium text-green-700">WhatsApp</span>
            </div>
            <p className="text-sm text-green-800">New booking: {booking.service_type} at {booking.preferred_time_window || 'scheduled'}</p>
          </div>
        </div>
      )}

      {currentStepIndex >= 4 && (
        <div className="px-5 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <MessageSquare size={14} className="text-white" />
              </div>
              <span className="text-xs font-medium text-blue-700">SMS</span>
            </div>
            <p className="text-sm text-blue-800">Booking #{booking.id.slice(0, 8)} confirmed. {booking.service_type} with {provider?.name || 'provider'}. Total: PKR {booking.total_price_pkr}</p>
          </div>
        </div>
      )}

      {/* Tracking Preview */}
      {currentStepIndex >= 7 && currentStepIndex < 9 && (
        <div className="px-5 mt-4">
          <div className="bg-gray-100 rounded-2xl h-32 flex items-center justify-center">
            <div className="text-center">
              <Truck size={28} className="text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500">{currentStepIndex === 7 ? 'Provider is on the way...' : 'Provider has arrived!'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview */}
      {currentStepIndex >= 11 && (
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-medium text-sm text-gray-700 mb-3">Invoice</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Service</span><span className="font-medium">{booking.service_type}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Provider</span><span className="font-medium">{provider?.name || 'N/A'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium">{booking.preferred_time_window || 'N/A'}</span></div>
              <div className="border-t border-gray-100 pt-2 flex justify-between"><span className="font-semibold">Total</span><span className="font-bold text-emerald-600">PKR {booking.total_price_pkr}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Section */}
      {currentStepIndex >= 12 && !booking.feedback_rating && (
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={18} className="text-emerald-600" />
              <h2 className="font-bold">Rate Your Experience</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">Your feedback helps improve the platform</p>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                  <Star size={32} className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment (optional)..."
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 mb-3"
              rows={3}
            />
            <button
              onClick={submitFeedback}
              disabled={rating === 0}
              className="w-full py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Existing Feedback */}
      {booking.feedback_rating && (
        <div className="px-5 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="font-medium text-emerald-800 text-sm">Your Feedback</p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} size={16} className={star <= booking.feedback_rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
              ))}
            </div>
            {booking.feedback_comment && <p className="text-sm text-gray-700 mt-2">{booking.feedback_comment}</p>}
          </div>
        </div>
      )}

      {/* Report Problem */}
      {currentStepIndex >= 10 && !booking.feedback_rating && (
        <div className="px-5 mt-4">
          <button
            onClick={() => router.push(`/disputes/new?booking=${booking.id}`)}
            className="w-full py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2 font-medium transition-all"
          >
            <AlertTriangle size={16} />
            Report a Problem
          </button>
        </div>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}
