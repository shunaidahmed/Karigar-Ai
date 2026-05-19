'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { agent7DisputeResolution, type DisputeResult } from '@/lib/agents/agent7-dispute'
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react'

const disputeTypes = [
  { value: 'noShow', label: 'Provider No Show', labelUr: 'پرووائیڈر نہیں آیا' },
  { value: 'priceHigher', label: 'Price Higher Than Quoted', labelUr: 'قیمت کوٹ سے زیادہ' },
  { value: 'poorQuality', label: 'Poor Quality Work', labelUr: 'کام خراب' },
  { value: 'rudeBehavior', label: 'Provider Rude/Unprofessional', labelUr: 'پرووائیڈر بدتمیز' },
  { value: 'wrongService', label: 'Wrong Service Performed', labelUr: 'غلط سروس' },
  { value: 'refundRequest', label: 'Refund Request', labelUr: 'رقم واپس چاہیے' },
  { value: 'lastMinuteCancel', label: 'Booking Cancelled Last Minute', labelUr: 'آخری منٹ منسوخی' },
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

    // Call Agent 7
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

    // Save to Supabase
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

    // Update booking status
    await supabase
      .from('bookings')
      .update({ status: 'disputed' })
      .eq('id', bookingData.id)

    setLoading(false)
  }

  if (!showNewForm && disputes.length === 0) {
    return (
      <div className="py-6 space-y-4">
        <h1 className="text-xl font-bold">Disputes</h1>
        <div className="text-center py-12">
          <p className="text-gray-500">No disputes filed</p>
          <p className="text-sm text-gray-400 mt-2">
            You can report a problem from any completed booking
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {!showNewForm && !result && (
        <>
          <h1 className="text-xl font-bold">Disputes</h1>
          {disputes.map((dispute) => (
            <div key={dispute.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{dispute.dispute_type}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {dispute.bookings?.service_type}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    dispute.status === 'resolved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : dispute.status === 'escalated'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {dispute.status}
                </span>
              </div>
              {dispute.compensation_pkr > 0 && (
                <p className="text-sm font-medium text-emerald-600 mt-2">
                  Compensation: PKR {dispute.compensation_pkr}
                </p>
              )}
            </div>
          ))}
        </>
      )}

      {/* New Dispute Form */}
      {showNewForm && !result && bookingData && (
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>

          <h2 className="text-lg font-semibold">Report a Problem</h2>
          <p className="text-sm text-gray-600">
            Booking: {bookingData.service_type} — {bookingData.providers?.name}
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Dispute Type</label>
            <div className="space-y-1">
              {disputeTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm ${
                    selectedType === type.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in any language..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              rows={4}
            />
          </div>

          <button
            onClick={handleSubmitDispute}
            disabled={loading || !selectedType || !description.trim()}
            className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Submit Dispute'}
          </button>
        </div>
      )}

      {/* Resolution Result */}
      {result && (
        <div className="space-y-4">
          <div
            className={`rounded-lg p-4 ${
              result.likelyFault === 'provider'
                ? 'bg-emerald-50 border border-emerald-200'
                : result.likelyFault === 'user'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {result.likelyFault === 'provider' ? (
                <CheckCircle size={20} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={20} className="text-yellow-600" />
              )}
              <h3 className="font-semibold">Resolution</h3>
            </div>
            <p className="text-sm">{result.messageToUser}</p>
            {result.compensationPKR > 0 && (
              <p className="text-lg font-semibold text-emerald-600 mt-2">
                Compensation: PKR {result.compensationPKR}
              </p>
            )}
            {result.escalateToHuman && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-2 text-sm text-red-700">
                <p className="font-medium">Escalated to Human Support</p>
                <p className="text-xs mt-1">{result.escalationReason}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/bookings')}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            View Bookings
          </button>
        </div>
      )}
    </div>
  )
}
