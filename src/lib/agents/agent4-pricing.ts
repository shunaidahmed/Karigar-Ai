import type { Database } from '@/types/database'

type Provider = Database['public']['Tables']['providers']['Row']

export interface PriceBreakdown {
  label: string
  amountPKR: number
}

export interface PricingResult {
  totalEstimatedPKR: number
  breakdown: PriceBreakdown[]
  providerEarningPKR: number
  platformFeePKR: number
  budgetAlternative: {
    description: string
    savingPKR: number
    tradeoff: string
  }
  fairnessSummaryUser: string
  fairnessSummaryProvider: string
  surgeApplied: boolean
  surgeReason: string
}

export function agent4DynamicPricing(
  provider: Provider,
  jobComplexity: 'basic' | 'intermediate' | 'complex',
  urgency: 'low' | 'medium' | 'high',
  requestedTime: string,
  loyaltyStatus: 'new' | 'returning',
  demandLevel: 'low' | 'medium' | 'high',
  distanceKM: number = 10
): PricingResult {
  const breakdown: PriceBreakdown[] = []

  // Visit Fee
  const visitFee = provider.visit_fee
  breakdown.push({ label: 'Visit Fee', amountPKR: visitFee })

  // Base labor (1 hour estimated)
  const baseLabor = provider.hourly_rate_pkr
  breakdown.push({ label: 'Labor (1 hour)', amountPKR: baseLabor })

  // Distance adjustment
  const distanceCharge = distanceKM * provider.rate_per_km
  breakdown.push({ label: `Distance (${distanceKM} km)`, amountPKR: distanceCharge })

  let total = visitFee + baseLabor + distanceCharge

  // Complexity multiplier
  const complexityMultiplier = jobComplexity === 'basic' ? 1.0 : jobComplexity === 'intermediate' ? 1.4 : 1.8
  if (complexityMultiplier > 1) {
    const complexityCharge = Math.round((baseLabor) * (complexityMultiplier - 1))
    breakdown.push({ label: `Complexity (${jobComplexity})`, amountPKR: complexityCharge })
    total += complexityCharge
  }

  // Urgency surcharge
  if (urgency === 'high') {
    breakdown.push({ label: 'Urgency (within 2 hours)', amountPKR: 600 })
    total += 600
  } else if (urgency === 'medium') {
    breakdown.push({ label: 'Urgency (same day)', amountPKR: 300 })
    total += 300
  }

  // Time of day adjustment
  const hour = parseHour(requestedTime)
  if (hour >= 18 && hour <= 21) {
    const eveningPremium = Math.round(total * 0.1)
    breakdown.push({ label: 'Evening premium (18:00-21:00)', amountPKR: eveningPremium })
    total += eveningPremium
  }

  // Loyalty discount
  if (loyaltyStatus === 'returning') {
    const discount = Math.round(total * 0.05)
    breakdown.push({ label: 'Loyalty discount (5%)', amountPKR: -discount })
    total -= discount
  }

  // Demand surge
  let surgeApplied = false
  let surgeReason = ''
  if (demandLevel === 'high') {
    const surge = Math.round(total * 0.2)
    breakdown.push({ label: 'Demand surge (20%)', amountPKR: surge })
    total += surge
    surgeApplied = true
    surgeReason = 'High demand in your area'
  } else if (demandLevel === 'medium') {
    const surge = Math.round(total * 0.15)
    breakdown.push({ label: 'Demand surge (15%)', amountPKR: surge })
    total += surge
    surgeApplied = true
    surgeReason = 'Moderate demand in your area'
  }

  // Platform fee (10% of total, shown separately)
  const platformFee = Math.round(total * 0.1)
  const providerEarning = total - platformFee

  breakdown.push({ label: 'Platform Fee (10%)', amountPKR: platformFee })

  // Budget alternative
  let savingPKR = 0
  let budgetDescription = ''
  let tradeoff = ''

  if (urgency !== 'low') {
    savingPKR = urgency === 'high' ? 600 : 300
    budgetDescription = 'Schedule for tomorrow to remove urgency surcharge'
    tradeoff = 'Wait until next day'
  } else if (distanceKM > 5) {
    const nearbySaving = Math.round((distanceKM - 5) * provider.rate_per_km)
    if (nearbySaving > 0) {
      savingPKR = nearbySaving
      budgetDescription = 'Choose a provider closer to your location'
      tradeoff = 'May have lower rating'
    }
  }

  return {
    totalEstimatedPKR: total,
    breakdown,
    providerEarningPKR: providerEarning,
    platformFeePKR: platformFee,
    budgetAlternative: {
      description: budgetDescription || 'No budget alternative available',
      savingPKR,
      tradeoff: tradeoff || 'None',
    },
    fairnessSummaryUser: `You pay PKR ${total} for a ${jobComplexity} ${provider.skill} job. This includes visit, labor, and distance charges with transparent pricing.`,
    fairnessSummaryProvider: `${provider.name} earns PKR ${providerEarning} after platform fee of PKR ${platformFee}.`,
    surgeApplied,
    surgeReason,
  }
}

function parseHour(timeStr: string): number {
  if (timeStr.includes('T')) {
    return new Date(timeStr).getHours()
  }
  const parts = timeStr.split(':')
  return parseInt(parts[0])
}
