import type { Database } from '@/types/database'

type Provider = Database['public']['Tables']['providers']['Row']

export interface RankedProvider {
  providerId: string
  name: string
  matchScore: number
  rankingRationale: string
  whyNotFirst: string
  estimatedArrival: string
  riskFlag: boolean
  riskReason: string
  provider: Provider
}

export interface MatchingResult {
  jobComplexity: 'basic' | 'intermediate' | 'complex'
  totalProvidersEvaluated: number
  rankedProviders: RankedProvider[]
}

function calculateSkillMatch(provider: Provider, serviceType: string): number {
  const service = serviceType.toLowerCase()
  const skill = provider.skill.toLowerCase()

  if (
    provider.specializations.some((s) => s.toLowerCase().includes(service)) ||
    skill.includes(service)
  ) {
    return 100
  }

  const serviceMap: Record<string, string[]> = {
    ac: ['ac', 'air conditioner', 'hvac'],
    electric: ['electric', 'wiring', 'light'],
    plumbing: ['plumb', 'pipe', 'water', 'leak'],
    tutor: ['tutor', 'teacher', 'tuition'],
    mechanic: ['mechanic', 'car', 'auto', 'vehicle'],
  }

  for (const [key, terms] of Object.entries(serviceMap)) {
    if (terms.some((t) => service.includes(t))) {
      if (terms.some((t) => skill.includes(t))) return 70
    }
  }

  return 0
}

function calculateRatingScore(rating: number): number {
  return (rating / 5) * 100
}

function calculateReviewScore(sentiment: string | null, reviewDate: string | null): number {
  if (!sentiment || !reviewDate) return 50

  const reviewDateObj = new Date(reviewDate)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - reviewDateObj.getTime()) / (1000 * 60 * 60 * 24))

  if (sentiment === 'positive') {
    return daysDiff <= 7 ? 100 : daysDiff <= 30 ? 80 : 60
  }
  if (sentiment === 'negative') return 20
  return 50
}

function calculateCancellationScore(rate: number): number {
  return Math.max(0, 100 - rate * 5)
}

function calculateDistanceScore(): number {
  return 75
}

function calculateRiskScore(riskScore: string): number {
  switch (riskScore) {
    case 'low': return 100
    case 'medium': return 60
    case 'high': return 20
    default: return 50
  }
}

function calculatePriceScore(providers: Provider[]): Map<string, number> {
  const scores = new Map<string, number>()
  if (providers.length === 0) return scores

  const minVisitFee = Math.min(...providers.map((p) => p.visit_fee))

  providers.forEach((p) => {
    if (minVisitFee === 0) {
      scores.set(p.id, 100)
    } else {
      scores.set(p.id, Math.round((minVisitFee / p.visit_fee) * 100))
    }
  })

  return scores
}

function calculateCapacityScore(provider: Provider): number {
  if (provider.max_daily_capacity === 0) return 0
  const remaining = provider.max_daily_capacity - provider.current_day_bookings
  return Math.max(0, Math.round((remaining / provider.max_daily_capacity) * 100))
}

export function agent2ProviderMatching(
  request: any,
  providers: Provider[]
): MatchingResult {
  let jobComplexity: 'basic' | 'intermediate' | 'complex' = 'basic'
  const desc = request.issueDescription?.toLowerCase() || ''
  if (desc.includes('replace') || desc.includes('install') || desc.includes('major')) {
    jobComplexity = 'complex'
  } else if (desc.includes('repair') || desc.includes('fix') || desc.includes('leak')) {
    jobComplexity = 'intermediate'
  }

  // Step 1: Filter by service type only (location is secondary)
  const serviceMatched = providers.filter((p) => calculateSkillMatch(p, request.serviceType) > 0)

  if (serviceMatched.length === 0) {
    return {
      jobComplexity,
      totalProvidersEvaluated: providers.length,
      rankedProviders: [],
    }
  }

  // Step 2: If location is specified, prioritize local providers but keep others
  let candidates = serviceMatched
  if (request.location && request.location.trim() !== '') {
    const localProviders = serviceMatched.filter((p) =>
      p.city.toLowerCase().includes(request.location.toLowerCase()) ||
      p.areas.some((a) => a.toLowerCase().includes(request.location.toLowerCase()))
    )

    // If we found local providers, use them. Otherwise use all service-matched providers.
    if (localProviders.length > 0) {
      candidates = localProviders
    }
    // If no local providers, candidates stays as all service-matched providers
  }

  // Always ensure we have candidates
  if (candidates.length === 0) {
    candidates = serviceMatched
  }

  const priceScores = calculatePriceScore(candidates)

  const scored = candidates.map((p) => {
    const skillMatch = calculateSkillMatch(p, request.serviceType)
    const ratingScore = calculateRatingScore(p.rating)
    const onTimeScore = p.on_time_score
    const reviewScore = calculateReviewScore(p.recent_review_sentiment, p.recent_review_date)
    const cancellationScore = calculateCancellationScore(p.cancellation_rate)
    const riskScore = calculateRiskScore(p.risk_score)
    const priceScore = priceScores.get(p.id) || 50
    const capacityScore = calculateCapacityScore(p)
    const certScore = p.certifications.length > 0 ? 100 : 0

    // Location bonus: providers in the requested city get +10 points
    let locationBonus = 0
    if (request.location && request.location.trim() !== '') {
      if (p.city.toLowerCase().includes(request.location.toLowerCase()) ||
          p.areas.some((a) => a.toLowerCase().includes(request.location.toLowerCase()))) {
        locationBonus = 10
      }
    }

    const matchScore = Math.round(
      skillMatch * 0.2 +
      ratingScore * 0.2 +
      onTimeScore * 0.15 +
      reviewScore * 0.1 +
      cancellationScore * 0.1 +
      75 * 0.1 +
      riskScore * 0.05 +
      priceScore * 0.05 +
      capacityScore * 0.03 +
      certScore * 0.02 +
      locationBonus
    )

    return {
      providerId: p.id,
      name: p.name,
      matchScore: Math.min(100, matchScore),
      rankingRationale: `${p.name} scored ${Math.min(100, matchScore)}/100 based on skill match (${skillMatch}), rating (${p.rating}/5), on-time performance (${p.on_time_score}%), and ${p.certifications.length > 0 ? 'certifications' : 'no certifications'}.`,
      whyNotFirst: '',
      estimatedArrival: `${Math.floor(Math.random() * 30 + 15)} min`,
      riskFlag: p.risk_score === 'high' || p.dispute_count >= 3,
      riskReason: p.risk_score === 'high' ? 'High risk score' : p.dispute_count >= 3 ? `${p.dispute_count} disputes in recent history` : '',
      provider: p,
    }
  })

  scored.sort((a, b) => {
    if (Math.abs(a.matchScore - b.matchScore) <= 3) {
      return b.provider.on_time_score - a.provider.on_time_score
    }
    return b.matchScore - a.matchScore
  })

  if (scored.length > 1) {
    const top = scored[0]
    for (let i = 1; i < scored.length; i++) {
      scored[i].whyNotFirst = `${top.name} ranked higher due to better ${top.provider.rating > scored[i].provider.rating ? 'rating' : 'on-time performance'}.`
    }
  }

  return {
    jobComplexity,
    totalProvidersEvaluated: providers.length,
    rankedProviders: scored.slice(0, 3),
  }
}
