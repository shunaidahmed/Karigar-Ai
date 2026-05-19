'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { agent7DisputeResolution, type DisputeResult } from '@/lib/agents/agent7-dispute'
import { ArrowLeft, CheckCircle, AlertTriangle, MessageSquare, Shield, ChevronRight, Sparkles } from 'lucide-react'

const disputeTypes = [
  { value: 'noShow', label: 'Provider No Show', icon: '🚫' },
  { value: 'priceHigher', label: 'Price Higher Than Quoted', icon: '💰' },
  { value: 'poorQuality', label: 'Poor Quality Work', icon: '🔧' },
  { value: 'rudeBehavior', label: 'Provider Rude/Unprofessional', icon: '😤' },
  { value: 'wrongService', label: 'Wrong Service Performed', icon: '❌' },
  { value: 'refundRequest', label: 'Refund Request', icon: '💸' },
  { value: 'lastMinuteCancel', label: 'Booking Cancelled Last Minute', icon: '⏰' },
]

export default function DisputesPage({ searchParams }: { searchParams: Promise<{ booking?: string }> }) {
  const params = use(searchParams)
  const { user } = useAuth()
  const router = useRouter()

  const [disputes, setDisputes] = useState<any[]>([])
  const [showNewForm, setShowNewForm] = useState(!!params.booking)
  const [selectedType, setSelectedType] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DisputeResult | null>(null)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    if (user) {
      fetchDisputes()
      if (params.booking) fetchBooking(params.booking)
    }
  }, [user, params.booking])

  async function fetchDisputes() {
    const supabase = createClient() as any
    const { data } = await supabase
      .from('disputes')
      .select('*, bookings(service_type)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (data) setDisputes(data)
  }

  async function fetchBooking(bookingId: string) {
    const supabase = createClient() as any
    const { data } = await supabase
      .from('bookings')
      .select('*, providers(name, rating, dispute_count, cancellation_rate)')
      .eq('id', bookingId)
      .eq('user_id', user?.id)
      .single()

    if (data) setBookingData(data)
  }

  async function handleSubmitDispute() {
    if (!user || !selectedType || !description || !bookingData) return
    setLoading(true)

    const disputeResult = await agent7DisputeResolution(
      selectedType,
      description,
      {
        rating: bookingData.providers?.rating || 0,
        cancellationRate: bookingData.providers?.cancellation_rate || 0,
        previousDisputes: bookingData.providers?.dispute_count || 0,
      },
      bookingData.total_price_pkr || 0
    )

    setResult(disputeResult)

    const supabase = createClient() as any
    await supabase.from('disputes').insert({
      booking_id: bookingData.id,
      user_id: user.id,
      provider_id: bookingData.provider_id,
      dispute_type: selectedType,
      user_description: description,
      dispute_severity: disputeResult.disputeSeverity,
      likely_fault: disputeResult.likelyFault,
      recommended_action: disputeResult.recommendedAction,
      compensation_pkr: disputeResult.compensationPKR,
      compensation_reason: disputeResult.compensationReason,
      message_to_user: disputeResult.messageToUser,
      message_to_provider: disputeResult.messageToProvider,
      escalate_to_human: disputeResult.escalateToHuman,
      escalation_reason: disputeResult.escalationReason,
      provider_penalty_applied: disputeResult.providerPenaltyApplied,
      penalty_details: disputeResult.penaltyDetails,
      status: disputeResult.escalateToHuman ? 'escalated' : 'resolved',
    })

    await supabase
      .from('bookings')
      .update({ status: 'disputed' })
      .eq('id', bookingData.id)

    setLoading(false)
  }

  if (!showNewForm && disputes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-3">
            <Shield size={24} />
            <div>
              <h1 className="text-xl font-bold">Disputes</h1>
              <p className="text-emerald-100 text-sm mt-1">Fair resolution, every time</p>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No disputes filed</h2>
            <p className="text-sm text-gray-500 mt-2">
              You can report a problem from any completed booking
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-8 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-3">
          <Shield size={24} />
          <div>
            <h1 className="text-xl font-bold">Disputes</h1>
            <p className="text-emerald-100 text-sm mt-1">{disputes.length} dispute{disputes.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Disputes List */}
      {!showNewForm && !result && disputes.length > 0 && (
        <div className="px-5 -mt-4 relative z-10 space-y-3">
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    dispute.status === 'resolved' ? 'bg-emerald-100' :
                    dispute.status === 'escalated' ? 'bg-red-100' : 'bg-yellow-100'
                  }`}>
                    {dispute.status === 'resolved' ? (
                      <CheckCircle size={20} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={20} className={dispute.status === 'escalated' ? 'text-red-600' : 'text-yellow-600'} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{dispute.dispute_type}</h3>
                    <p className="text-sm text-gray-500">{dispute.bookings?.service_type}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-400" />
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                  dispute.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                  dispute.status === 'escalated' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {dispute.status}
                </span>
                {dispute.compensation_pkr > 0 && (
                  <span className="font-bold text-emerald-600">PKR {dispute.compensation_pkr}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Dispute Form */}
      {showNewForm && !result && bookingData && (
        <div className="px-5 -mt-4 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft size={16} />
              <span className="text-sm">Back</span>
            </button>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-red-600" />
              <h2 className="font-bold text-gray-900">Report a Problem</h2>
            </div>
            <p className="text-sm text-gray-500">
              Booking: {bookingData.service_type} — {bookingData.providers?.name}
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dispute Type</label>
              <div className="space-y-2">
                {disputeTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      selectedType === type.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in any language..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                rows={4}
              />
            </div>

            <button
              onClick={handleSubmitDispute}
              disabled={loading || !selectedType || !description.trim()}
              className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium transition-all"
            >
              {loading ? 'Processing...' : 'Submit Dispute'}
            </button>
          </div>
        </div>
      )}

      {/* Resolution Result */}
      {result && (
        <div className="px-5 -mt-4 relative z-10 space-y-4">
          <div className={`rounded-2xl p-5 ${
            result.likelyFault === 'provider'
              ? 'bg-emerald-50 border border-emerald-200'
              : result.likelyFault === 'user'
              ? 'bg-amber-50 border border-amber-200'
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              {result.likelyFault === 'provider' ? (
                <CheckCircle size={20} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={20} className="text-amber-600" />
              )}
              <h3 className="font-bold">Resolution</h3>
            </div>
            <p className="text-sm text-gray-700">{result.messageToUser}</p>
            {result.compensationPKR > 0 && (
              <div className="mt-4 bg-white rounded-xl p-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Compensation</span>
                <span className="text-xl font-bold text-emerald-600">PKR {result.compensationPKR}</span>
              </div>
            )}
            {result.escalateToHuman && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="font-medium text-red-700 text-sm">Escalated to Human Support</p>
                <p className="text-xs text-red-600 mt-1">{result.escalationReason}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/bookings')}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-all"
          >
            View Bookings
          </button>
        </div>
      )}
    </div>
  )
}
