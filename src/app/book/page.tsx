'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth, ProtectedRoute } from '@/components/auth/AuthProvider'
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
  Search,
  Mic,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle,
  Sparkles,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react'

type Provider = Database['public']['Tables']['providers']['Row']

const steps = [
  { key: 'search', label: 'Search', icon: Search },
  { key: 'providers', label: 'Provider', icon: Star },
  { key: 'schedule', label: 'Schedule', icon: Calendar },
  { key: 'price', label: 'Price', icon: DollarSign },
]

function BookContent({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
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
        setError('Could not understand. Try: "AC theek karo G-13 mein"')
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
      setError('Failed to process request. Please try again.')
    }

    setLoading(false)
  }

  async function findProviders(request: ParsedRequest) {
    setLoading(true)
    const matching = agent2ProviderMatching(request, providers)

    if (matching.rankedProviders.length === 0) {
      setError('No providers available for this service.')
      setLoading(false)
      return
    }

    setRankedProviders(matching.rankedProviders)

    addTrace(
      'agent_2',
      'Provider Matching Agent',
      `Service: ${request.serviceType}`,
      `Found ${matching.rankedProviders.length} providers`
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
      `Provider: ${selectedProvider.name}`,
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
      setError('Failed to create booking.')
      setLoading(false)
      return
    }

    addTrace(
      'agent_5',
      'Booking Agent',
      `Booking created for ${parsedRequest.serviceType}`,
      `Booking ID: ${(data as any).id}`
    )

    router.push(`/bookings/${(data as any).id}`)
  }

  function handleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported')
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
      alert('Voice recognition failed.')
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
    'AC theek karo G-13',
    'Electrician chahiye',
    'Plumber for leak',
    'Math tutor needed',
    'Car mechanic',
  ]

  const timeSlots = ['07:00-08:00', '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00']

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-5 pt-12 pb-6 rounded-b-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-center gap-4">
          <button
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : router.back()}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Book Service</h1>
            <p className="text-emerald-100 text-sm">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 flex gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                idx <= currentStep ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {/* Step 1: Search */}
      {currentStep === 0 && (
        <div className="px-5 mt-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">What do you need?</h2>
            <p className="text-gray-500 text-sm mt-1">Describe your service request</p>
          </div>

          <div className="bg-white rounded-2xl p-1.5 flex items-center shadow-lg shadow-gray-200/50">
            <div className="flex-1 flex items-center gap-3 px-3">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                placeholder="e.g., AC theek karo G-13"
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
              />
            </div>
            <button
              onClick={handleVoiceSearch}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-100 text-red-600 animate-pulse'
                  : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
              }`}
            >
              <Mic size={18} />
            </button>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Quick Examples</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  onClick={() => {
                    setQuery(example)
                    handleSearch(example)
                  }}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
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
        <div className="px-5 mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Top Providers</h2>
            <span className="text-sm text-emerald-600 font-medium">{rankedProviders.length} found</span>
          </div>

          {rankedProviders.map((rp, idx) => (
            <div key={rp.providerId} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${
                  idx === 0 ? 'from-emerald-400 to-emerald-600' : idx === 1 ? 'from-blue-400 to-blue-600' : 'from-purple-400 to-purple-600'
                }`}>
                  {rp.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{rp.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-sm text-gray-600">{rp.provider.rating}</span>
                        <span className="text-xs text-gray-400">({rp.provider.total_reviews})</span>
                      </div>
                    </div>
                    <div className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-sm font-bold">
                      {rp.matchScore}%
                    </div>
                  </div>

                  {rp.riskFlag && (
                    <div className="flex items-center gap-1 text-red-600 text-xs bg-red-50 px-2 py-1 rounded-lg mt-2 w-fit">
                      <AlertTriangle size={12} />
                      {rp.riskReason}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {rp.estimatedArrival}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {rp.provider.city}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowRationale(showRationale === rp.providerId ? null : rp.providerId)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Why this provider?
                </button>
                <button
                  onClick={() => handleSelectProvider(rp)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all"
                >
                  Select
                </button>
              </div>

              {showRationale === rp.providerId && (
                <div className="bg-gray-50 rounded-xl p-3 text-sm mt-3">
                  <p className="text-gray-700">{rp.rankingRationale}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Schedule */}
      {currentStep === 2 && selectedProvider && (
        <div className="px-5 mt-6 space-y-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                {selectedProvider.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{selectedProvider.name}</p>
                <p className="text-sm text-gray-500">{selectedProvider.provider.skill}</p>
              </div>
            </div>

            <p className="text-sm font-medium text-gray-700 mb-3">Select Time Slot</p>
            <div className="grid grid-cols-3 gap-2">
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
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      isBooked
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'bg-gray-50 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>

            {schedulingResult?.status === 'conflict' && schedulingResult.alternativeSlots.length > 0 && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-sm text-amber-800 font-medium">Alternative Slots:</p>
                <div className="flex gap-2 mt-2">
                  {schedulingResult.alternativeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-200"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleConfirmSlot}
              disabled={loading}
              className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Checking...' : 'Continue to Pricing'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Pricing */}
      {currentStep === 3 && pricingResult && (
        <div className="px-5 mt-6 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h2>
            
            <div className="space-y-3">
              {pricingResult.breakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className={item.amountPKR < 0 ? 'text-green-600 font-medium' : 'text-gray-900'}>
                    {item.amountPKR < 0 ? '-' : ''}PKR {Math.abs(item.amountPKR)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-3xl font-bold text-emerald-600">PKR {pricingResult.totalEstimatedPKR}</span>
            </div>
          </div>

          {pricingResult.budgetAlternative.savingPKR > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-amber-600" />
                <p className="font-medium text-sm text-amber-800">Budget Alternative</p>
              </div>
              <p className="text-sm text-amber-700">{pricingResult.budgetAlternative.description}</p>
              <p className="text-xs text-amber-600 mt-1">Save PKR {pricingResult.budgetAlternative.savingPKR}</p>
            </div>
          )}

          <button
            onClick={handleConfirmBooking}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Confirming...' : `Confirm & Book`}
            {!loading && <CheckCircle size={20} />}
          </button>
        </div>
      )}

      {/* Agent Trace Panel */}
      <AgentTracePanel traces={traces} />
    </div>
  )
}

export default function BookPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <ProtectedRoute>
      <BookContent searchParams={searchParams} />
    </ProtectedRoute>
  )
}
