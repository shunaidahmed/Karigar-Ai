'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
import { AgentTracePanel } from '@/components/agents/AgentTracePanel'
import { agent1LanguageUnderstanding, type ParsedRequest } from '@/lib/agents/agent1-language'
import { agent2ProviderMatching, type RankedProvider } from '@/lib/agents/agent2-matching'
import { agent3Scheduling, type SchedulingResult } from '@/lib/agents/agent3-scheduling'
import { agent4DynamicPricing, type PricingResult } from '@/lib/agents/agent4-pricing'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database'
import { ArrowLeft, Star, AlertTriangle, Check, Clock, Info } from 'lucide-react'

type Provider = Database['public']['Tables']['providers']['Row']

type BookingStep =
  | 'request'
  | 'clarification'
  | 'providers'
  | 'scheduling'
  | 'pricing'
  | 'confirming'

export default function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams)
  const { user } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<BookingStep>('request')
  const [query, setQuery] = useState(params.q || '')
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null)
  const [clarificationAnswer, setClarificationAnswer] = useState('')
  const [providers, setProviders] = useState<Provider[]>([])
  const [rankedProviders, setRankedProviders] = useState<RankedProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<RankedProvider | null>(null)
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [traces, setTraces] = useState<any[]>([])
  const [showRationale, setShowRationale] = useState<string | null>(null)

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (params.q && !parsedRequest) {
      handleSearch(params.q)
    }
  }, [params.q])

  async function fetchProviders() {
    const supabase = createClient() as any
    const { data } = await supabase.from('providers').select('*')
    if (data) setProviders(data)
  }

  async function handleSearch(input: string) {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setQuery(input)

    try {
      const result = await agent1LanguageUnderstanding(input)
      setParsedRequest(result)

      // Add trace
      addTrace('agent_1', 'Language Understanding Agent', input, JSON.stringify(result))

      if (result.confidenceScore < 50) {
        setError('Could not understand your request. Try examples like: "AC theek karo G-13 mein kal subah" or "Electrician chahiye Defence mein"')
        setLoading(false)
        return
      }

      if (result.clarificationNeeded && result.confidenceScore < 70) {
        setStep('clarification')
      } else {
        await findProviders(result)
      }
    } catch {
      setError('Failed to process your request. Please try again.')
    }

    setLoading(false)
  }

  async function handleClarification() {
    if (!parsedRequest || !clarificationAnswer.trim()) return
    setLoading(true)

    const combinedInput = `${query} ${clarificationAnswer}`
    const result = await agent1LanguageUnderstanding(combinedInput)
    setParsedRequest(result)

    addTrace('agent_1', 'Language Understanding Agent (Clarification)', combinedInput, JSON.stringify(result))

    if (result.confidenceScore >= 80) {
      await findProviders(result)
    } else {
      setError('Still need more details. Please try again.')
    }

    setLoading(false)
  }

  async function findProviders(request: ParsedRequest) {
    setLoading(true)
    const matching = agent2ProviderMatching(request, providers)

    if (matching.rankedProviders.length === 0) {
      setError('No providers available for this service in your area.')
      setLoading(false)
      return
    }

    setRankedProviders(matching.rankedProviders)

    addTrace(
      'agent_2',
      'Provider Matching Agent',
      `Service: ${request.serviceType}, Location: ${request.location}`,
      `Found ${matching.rankedProviders.length} providers. Top: ${matching.rankedProviders[0]?.name} (${matching.rankedProviders[0]?.matchScore}%)`
    )

    setStep('providers')
    setLoading(false)
  }

  function handleSelectProvider(rp: RankedProvider) {
    setSelectedProvider(rp)
    setStep('scheduling')

    // Generate default time slots for today
    const now = new Date()
    const from = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const to = `${String(now.getHours() + 1).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setSelectedSlot(`${from}-${to}`)
  }

  function handleConfirmSlot() {
    if (!selectedProvider) return

    const [from, to] = selectedSlot.split('-')
    const result = agent3Scheduling(
      selectedProvider.provider.booked_slots || [],
      from,
      to
    )

    setSchedulingResult(result)

    addTrace(
      'agent_3',
      'Scheduling Agent',
      `Requested: ${selectedSlot}`,
      result.status === 'confirmed' ? 'Slot confirmed' : `Conflict: ${result.conflictReason}`
    )

    if (result.status === 'confirmed') {
      calculatePricing()
    } else {
      // Show alternatives, user can select one
      if (result.alternativeSlots.length > 0) {
        setSelectedSlot(result.alternativeSlots[0])
      }
    }
  }

  async function calculatePricing() {
    if (!selectedProvider || !parsedRequest) return
    setLoading(true)

    const pricing = agent4DynamicPricing(
      selectedProvider.provider,
      parsedRequest.severity === 'high' ? 'complex' : parsedRequest.severity === 'medium' ? 'intermediate' : 'basic',
      parsedRequest.priceSensitivity,
      selectedSlot.split('-')[0],
      'new',
      'low'
    )

    setPricingResult(pricing)

    addTrace(
      'agent_4',
      'Dynamic Pricing Agent',
      `Provider: ${selectedProvider.name}, Complexity: ${pricing.breakdown.length} items`,
      `Total: PKR ${pricing.totalEstimatedPKR}`
    )

    setStep('pricing')
    setLoading(false)
  }

  async function handleConfirmBooking() {
    if (!user || !selectedProvider || !parsedRequest || !pricingResult) return
    setLoading(true)

    const supabase = createClient() as any
    const [from] = selectedSlot.split('-')

    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        provider_id: selectedProvider.providerId,
        service_type: parsedRequest.serviceType,
        issue_description: parsedRequest.issueDescription,
        severity: parsedRequest.severity,
        location: parsedRequest.location,
        price_sensitivity: parsedRequest.priceSensitivity,
        job_complexity: parsedRequest.severity === 'high' ? 'complex' : parsedRequest.severity === 'medium' ? 'intermediate' : 'basic',
        status: 'booking_confirmed',
        total_price_pkr: pricingResult.totalEstimatedPKR,
        price_breakdown: pricingResult.breakdown as any,
        provider_earning_pkr: pricingResult.providerEarningPKR,
        platform_fee_pkr: pricingResult.platformFeePKR,
        surge_applied: pricingResult.surgeApplied,
        preferred_time_window: from,
      })
      .select()
      .single()

    if (error) {
      setError('Failed to create booking. Please try again.')
      setLoading(false)
      return
    }

    addTrace(
      'agent_5',
      'Booking Agent',
      `Booking created for ${parsedRequest.serviceType}`,
      `Booking ID: ${(data as any).id}, Status: booking_confirmed`
    )

    router.push(`/bookings/${(data as any).id}`)
  }

  function addTrace(agentId: string, agentName: string, input: string, output: string) {
    const trace = {
      id: `trace_${Date.now()}_${agentId}`,
      agentId,
      agentName,
      timestamp: new Date().toISOString(),
      inputSummary: input,
      decision: output,
      rationale: '',
      outputSummary: output,
      confidenceScore: 90,
      processingTimeMs: Math.floor(Math.random() * 1000 + 500),
    }
    setTraces((prev) => [...prev, trace])
  }

  return (
    <div className="py-6 space-y-6">
      {/* Back button */}
      {step !== 'request' && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step: Request */}
      {step === 'request' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">What do you need?</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="e.g., AC theek karo G-13 mein kal subah"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {/* Example prompts */}
          <div>
            <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'AC theek karo G-13 mein kal subah',
                'Electrician chahiye Defence mein',
                'Plumber for pipe leak in Lahore',
                'Home tutor for math in Islamabad',
                'Car mechanic engine problem Karachi',
                'Bijli ka kaam F-10 mein aaj shaam',
                'Pani ki pipe leak ho rahi hai',
                'AC gas refill chahiye kal',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example)
                    handleSearch(example)
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-emerald-500 hover:text-emerald-600"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step: Clarification */}
      {step === 'clarification' && parsedRequest && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-yellow-600" />
              <span className="font-medium text-yellow-800">Clarification Needed</span>
            </div>
            <p className="text-sm text-yellow-700">{parsedRequest.clarificationQuestion}</p>
            <p className="text-xs text-yellow-600 mt-1">Confidence: {parsedRequest.confidenceScore}%</p>
          </div>
          <input
            type="text"
            value={clarificationAnswer}
            onChange={(e) => setClarificationAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleClarification()}
            placeholder="Your answer..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            onClick={handleClarification}
            disabled={loading || !clarificationAnswer.trim()}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
      )}

      {/* Step: Provider Selection */}
      {step === 'providers' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Top Providers</h2>
          {rankedProviders.map((rp, idx) => (
            <div key={rp.providerId} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{rp.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm text-gray-600">{rp.provider.rating}</span>
                    <span className="text-xs text-gray-400">({rp.provider.total_reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                    {rp.matchScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Match</p>
                </div>
              </div>

              {rp.riskFlag && (
                <div className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-1 rounded">
                  <AlertTriangle size={12} />
                  {rp.riskReason}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {rp.estimatedArrival}
                </span>
                <span>PKR {rp.provider.visit_fee} visit</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRationale(showRationale === rp.providerId ? null : rp.providerId)}
                  className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Why This Provider?
                </button>
                <button
                  onClick={() => handleSelectProvider(rp)}
                  className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                >
                  Select
                </button>
              </div>

              {showRationale === rp.providerId && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                  <p>{rp.rankingRationale}</p>
                  {rp.whyNotFirst && <p className="text-gray-500">{rp.whyNotFirst}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step: Scheduling */}
      {step === 'scheduling' && selectedProvider && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Select Time Slot</h2>
          <p className="text-sm text-gray-600">Provider: {selectedProvider.name}</p>

          <div className="grid grid-cols-3 gap-2">
            {['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'].map(
              (slot) => {
                const isBooked = selectedProvider.provider.booked_slots?.some((bs) =>
                  bs.includes(slot.split('-')[0])
                )
                const isSelected = selectedSlot === slot

                return (
                  <button
                    key={slot}
                    onClick={() => !isBooked && setSelectedSlot(slot)}
                    disabled={!!isBooked}
                    className={`py-2 px-3 rounded-lg text-sm border ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500'
                    }`}
                  >
                    {slot}
                  </button>
                )
              }
            )}
          </div>

          {schedulingResult?.status === 'conflict' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">{schedulingResult.conflictReason}</p>
              {schedulingResult.alternativeSlots.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-yellow-800">Alternative Slots:</p>
                  <div className="flex gap-2 mt-1">
                    {schedulingResult.alternativeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs hover:bg-yellow-200"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleConfirmSlot}
            disabled={!selectedSlot}
            className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            Confirm Slot
          </button>
        </div>
      )}

      {/* Step: Pricing */}
      {step === 'pricing' && pricingResult && selectedProvider && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Price Breakdown</h2>

          {/* Receipt */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            {pricingResult.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className={item.amountPKR < 0 ? 'text-green-600' : 'text-gray-900'}>
                  {item.amountPKR < 0 ? '-' : ''}PKR {Math.abs(item.amountPKR)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-emerald-600">PKR {pricingResult.totalEstimatedPKR}</span>
            </div>
          </div>

          {/* Fairness */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
            <p>{pricingResult.fairnessSummaryUser}</p>
          </div>

          {/* Budget Alternative */}
          {pricingResult.budgetAlternative.savingPKR > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="font-medium text-sm text-yellow-800">Budget Alternative</p>
              <p className="text-sm text-yellow-700 mt-1">{pricingResult.budgetAlternative.description}</p>
              <p className="text-xs text-yellow-600 mt-1">Save PKR {pricingResult.budgetAlternative.savingPKR} — Tradeoff: {pricingResult.budgetAlternative.tradeoff}</p>
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Confirming...' : `Confirm & Book — PKR ${pricingResult.totalEstimatedPKR}`}
          </button>
        </div>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}
