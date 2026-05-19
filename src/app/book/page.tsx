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
import {
  ArrowLeft,
  ArrowRight,
  Star,
  AlertTriangle,
  Check,
  Clock,
  Info,
  Search,
  Mic,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
} from 'lucide-react'

type Provider = Database['public']['Tables']['providers']['Row']

const steps = [
  { key: 'search', label: 'Search', icon: Search },
  { key: 'providers', label: 'Provider', icon: Star },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'price', label: 'Price', icon: DollarSign },
]

export default function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = use(searchParams)
  const { user } = useAuth()
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(0)
  const [query, setQuery] = useState(params.q || '')
  const [parsedRequest, setParsedRequest] = useState<ParsedRequest | null>(null)
  const [providers, setProviders] = useState<Provider[]>([])
  const [rankedProviders, setRankedProviders] = useState<RankedProvider[]>([])
  const [selectedProvider, setSelectedProvider] = useState<RankedProvider | null>(null)
  const [schedulingResult, setSchedulingResult] = useState<SchedulingResult | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('09:00-10:00')
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [traces, setTraces] = useState<any[]>([])
  const [showRationale, setShowRationale] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)

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
    const { data } = await supabase.from('providers').select('*').limit(250)
    if (data) setProviders(data.filter((p: any) => p.available !== false))
  }

  async function handleSearch(input: string) {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setQuery(input)

    try {
      const result = await agent1LanguageUnderstanding(input)
      setParsedRequest(result)

      addTrace('agent_1', 'Language Understanding Agent', input, JSON.stringify(result))

      if (result.confidenceScore < 50) {
        setError('Could not understand your request. Try: "AC theek karo G-13 mein kal subah"')
        setLoading(false)
        return
      }

      if (result.clarificationNeeded && result.confidenceScore < 70) {
        setError(result.clarificationQuestion || 'Please provide more details.')
        setLoading(false)
        return
      }

      await findProviders(result)
    } catch {
      setError('Failed to process your request. Please try again.')
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

    setCurrentStep(1)
    setLoading(false)
  }

  function handleSelectProvider(rp: RankedProvider) {
    setSelectedProvider(rp)
    setCurrentStep(2)
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
    } else if (result.alternativeSlots.length > 0) {
      setSelectedSlot(result.alternativeSlots[0])
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

    setCurrentStep(3)
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
        price_breakdown: pricingResult.breakdown,
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

    // Redirect to booking detail page to see the full 13-step flow
    router.push(`/bookings/${(data as any).id}`)
  }

  function handleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'ur-PK'
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      handleSearch(transcript)
    }
    recognition.onerror = () => {
      setIsListening(false)
      alert('Voice recognition failed. Please try again.')
    }

    recognition.start()
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

  const examplePrompts = [
    'AC theek karo G-13 mein kal subah',
    'Electrician chahiye Defence mein',
    'Plumber for pipe leak in Lahore',
    'Home tutor for math in Islamabad',
    'Car mechanic engine problem Karachi',
    'Bijli ka kaam F-10 mein aaj shaam',
  ]

  const timeSlots = ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00']

  return (
    <div className="py-6 space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between px-2">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isCompleted = idx < currentStep
          const isCurrent = idx === currentStep

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${isCurrent ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${idx < currentStep ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Search */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">What do you need?</h1>
            <p className="text-gray-500 mt-1">Describe your service request in any language</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="e.g., AC theek karo G-13 mein kal subah"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              onClick={handleVoiceSearch}
              className={`p-3 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                  : 'border-gray-300 text-gray-500 hover:text-emerald-600 hover:border-emerald-500'
              }`}
              aria-label="Voice search"
            >
              <Mic size={20} />
            </button>
            <button
              onClick={() => handleSearch(query)}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Searching...' : 'Search'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-3">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example)
                    handleSearch(example)
                  }}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Provider Selection */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Top Providers</h2>
            <button
              onClick={() => setCurrentStep(0)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Change search
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {rankedProviders.map((rp) => (
              <div key={rp.providerId} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:border-emerald-300 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                      {rp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{rp.name}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600">{rp.provider.rating}</span>
                        <span className="text-xs text-gray-400">({rp.provider.total_reviews})</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">
                      {rp.matchScore}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">Match</p>
                  </div>
                </div>

                {rp.riskFlag && (
                  <div className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-md">
                    <AlertTriangle size={12} />
                    {rp.riskReason}
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {rp.estimatedArrival}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {rp.provider.city}
                  </span>
                  <span>PKR {rp.provider.visit_fee} visit</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowRationale(showRationale === rp.providerId ? null : rp.providerId)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Why this provider?
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
        </div>
      )}

      {/* Step 3: Schedule */}
      {currentStep === 2 && selectedProvider && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Choose a Time Slot</h2>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Change provider
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                {selectedProvider.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{selectedProvider.name}</p>
                <p className="text-sm text-gray-500">{selectedProvider.provider.skill} — {selectedProvider.provider.city}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {timeSlots.map((slot) => {
                const isBooked = selectedProvider.provider.booked_slots?.some((bs) =>
                  bs.includes(slot.split('-')[0])
                )
                const isSelected = selectedSlot === slot

                return (
                  <button
                    key={slot}
                    onClick={() => !isBooked && setSelectedSlot(slot)}
                    disabled={!!isBooked}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium border transition-all ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>

            {schedulingResult?.status === 'conflict' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
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
              disabled={loading}
              className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : 'Continue to Pricing'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {currentStep === 3 && pricingResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Price Breakdown</h2>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-sm text-emerald-600 hover:underline"
            >
              Change slot
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
            {pricingResult.breakdown.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className={item.amountPKR < 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                  {item.amountPKR < 0 ? '-' : ''}PKR {Math.abs(item.amountPKR)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600">PKR {pricingResult.totalEstimatedPKR}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
            <p>{pricingResult.fairnessSummaryUser}</p>
          </div>

          {pricingResult.budgetAlternative.savingPKR > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="font-medium text-sm text-amber-800">Budget Alternative</p>
              <p className="text-sm text-amber-700 mt-1">{pricingResult.budgetAlternative.description}</p>
              <p className="text-xs text-amber-600 mt-1">Save PKR {pricingResult.budgetAlternative.savingPKR} — Tradeoff: {pricingResult.budgetAlternative.tradeoff}</p>
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? 'Confirming...' : `Confirm & Book — PKR ${pricingResult.totalEstimatedPKR}`}
            {!loading && <CheckCircle size={18} />}
          </button>
        </div>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}
