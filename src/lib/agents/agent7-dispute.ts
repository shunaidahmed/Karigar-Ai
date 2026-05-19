export interface DisputeResult {
  disputeSeverity: 'low' | 'medium' | 'high'
  likelyFault: 'user' | 'provider' | 'unclear'
  recommendedAction: 'refund' | 'partial_refund' | 'rebook' | 'warning' | 'suspend' | 'escalate'
  compensationPKR: number
  compensationReason: string
  messageToUser: string
  messageToProvider: string
  escalateToHuman: boolean
  escalationReason: string
  providerPenaltyApplied: boolean
  penaltyDetails: string
}

async function callDeepSeek(prompt: string): Promise<any> {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that returns ONLY valid JSON. No markdown, no code fences, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 512,
    }),
  })

  if (!response.ok) throw new Error(`DeepSeek API error: ${response.status}`)

  const data = await response.json()
  const text = data.choices[0].message.content

  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  const match = cleaned.match(/\{[\s\S]*\}/)
  return JSON.parse(match ? match[0] : cleaned)
}

export async function agent7DisputeResolution(
  disputeType: string,
  userDescription: string,
  providerHistory: { rating: number; cancellationRate: number; previousDisputes: number },
  originalQuotedPrice: number,
  amountCharged: number = 0
): Promise<DisputeResult> {
  const prompt = `You are a dispute resolution agent for Karigar.ai in Pakistan.
Dispute type: ${disputeType}
User description: "${userDescription}"
Provider history: Rating ${providerHistory.rating}, Cancellation Rate ${providerHistory.cancellationRate}%, Previous Disputes ${providerHistory.previousDisputes}
Original quoted price: PKR ${originalQuotedPrice}
Amount charged: PKR ${amountCharged}

Assess the dispute fairly. Return ONLY valid JSON:
{
  "disputeSeverity": "low | medium | high",
  "likelyFault": "user | provider | unclear",
  "recommendedAction": "refund | partial_refund | rebook | warning | suspend | escalate",
  "compensationPKR": 0,
  "compensationReason": "",
  "messageToUser": "",
  "messageToProvider": "",
  "escalateToHuman": true | false,
  "escalationReason": "",
  "providerPenaltyApplied": true | false,
  "penaltyDetails": ""
}`

  try {
    const parsed = await callDeepSeek(prompt)

    let escalateToHuman = parsed.escalateToHuman || false
    let escalationReason = parsed.escalationReason || ''

    if (parsed.compensationPKR > 5000) {
      escalateToHuman = true
      escalationReason = 'Refund amount exceeds PKR 5000 threshold'
    }

    if (providerHistory.previousDisputes >= 5) {
      parsed.recommendedAction = 'suspend'
      parsed.providerPenaltyApplied = true
      parsed.penaltyDetails = 'Provider suspended due to 5+ disputes'
    }

    return {
      disputeSeverity: parsed.disputeSeverity || 'medium',
      likelyFault: parsed.likelyFault || 'unclear',
      recommendedAction: parsed.recommendedAction || 'warning',
      compensationPKR: parsed.compensationPKR || 0,
      compensationReason: parsed.compensationReason || '',
      messageToUser: parsed.messageToUser || 'Your dispute has been reviewed.',
      messageToProvider: parsed.messageToProvider || '',
      escalateToHuman,
      escalationReason,
      providerPenaltyApplied: parsed.providerPenaltyApplied || false,
      penaltyDetails: parsed.penaltyDetails || '',
    }
  } catch {
    const isPriceDispute = disputeType.toLowerCase().includes('price')
    const priceDiff = amountCharged - originalQuotedPrice

    return {
      disputeSeverity: priceDiff > 1000 ? 'high' : 'medium',
      likelyFault: isPriceDispute && priceDiff > 0 ? 'provider' : 'unclear',
      recommendedAction: isPriceDispute && priceDiff > 0 ? 'partial_refund' : 'warning',
      compensationPKR: isPriceDispute && priceDiff > 0 ? Math.round(priceDiff * 0.5) : 0,
      compensationReason: isPriceDispute ? 'Partial refund for price discrepancy' : '',
      messageToUser: 'Your dispute has been reviewed. A resolution has been applied.',
      messageToProvider: isPriceDispute ? 'Please adhere to quoted prices.' : '',
      escalateToHuman: false,
      escalationReason: '',
      providerPenaltyApplied: isPriceDispute && priceDiff > 0,
      penaltyDetails: isPriceDispute ? 'Warning issued for price discrepancy' : '',
    }
  }
}
