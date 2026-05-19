import type { Database } from '@/types/database'

type Provider = Database['public']['Tables']['providers']['Row']

export interface QualityResult {
  sentimentScore: number
  sentimentLabel: 'positive' | 'neutral' | 'negative'
  updatedRating: number
  matchingPriorityChange: 'increase' | 'unchanged' | 'decrease'
  changeReason: string
  flagForReview: boolean
  flagReason: string
  thankYouMessageUrdu: string
  thankYouMessageEnglish: string
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

export async function agent6ServiceQuality(
  provider: Provider,
  userRating: number,
  userComment: string
): Promise<QualityResult> {
  const prompt = `You are a service quality analyst for Karigar.ai.
Provider: ${JSON.stringify({ name: provider.name, rating: provider.rating, totalReviews: provider.total_reviews })}
User rating given: ${userRating}
User comment: "${userComment}"

Analyse the feedback. Return ONLY valid JSON:
{
  "sentimentScore": -1 to 1,
  "sentimentLabel": "positive | neutral | negative",
  "updatedRating": 0.0,
  "matchingPriorityChange": "increase | unchanged | decrease",
  "changeReason": "",
  "flagForReview": true | false,
  "flagReason": "",
  "thankYouMessageUrdu": "",
  "thankYouMessageEnglish": ""
}`

  try {
    const parsed = await callDeepSeek(prompt)
    const updatedRating = Math.round((provider.rating * 0.8 + userRating * 0.2) * 10) / 10

    return {
      sentimentScore: parsed.sentimentScore || 0,
      sentimentLabel: parsed.sentimentLabel || 'neutral',
      updatedRating,
      matchingPriorityChange: parsed.matchingPriorityChange || 'unchanged',
      changeReason: parsed.changeReason || '',
      flagForReview: parsed.flagForReview || false,
      flagReason: parsed.flagReason || '',
      thankYouMessageUrdu: parsed.thankYouMessageUrdu || 'آپ کے فیڈبیک کا شکریہ!',
      thankYouMessageEnglish: parsed.thankYouMessageEnglish || 'Thank you for your feedback!',
    }
  } catch {
    const updatedRating = Math.round((provider.rating * 0.8 + userRating * 0.2) * 10) / 10
    const sentimentLabel = userRating >= 4 ? 'positive' : userRating >= 3 ? 'neutral' : 'negative'

    return {
      sentimentScore: userRating >= 4 ? 0.8 : userRating >= 3 ? 0 : -0.8,
      sentimentLabel,
      updatedRating,
      matchingPriorityChange: userRating >= 4 ? 'increase' : userRating <= 2 ? 'decrease' : 'unchanged',
      changeReason: userRating >= 4 ? 'Positive feedback improves matching priority' : userRating <= 2 ? 'Negative feedback reduces matching priority' : 'Neutral feedback, no change',
      flagForReview: userRating <= 2,
      flagReason: userRating <= 2 ? 'Low rating requires review' : '',
      thankYouMessageUrdu: 'آپ کے فیڈبیک کا شکریہ!',
      thankYouMessageEnglish: 'Thank you for your feedback!',
    }
  }
}
