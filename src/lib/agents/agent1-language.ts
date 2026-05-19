import type { Database } from '@/types/database'

type Provider = Database['public']['Tables']['providers']['Row']

export interface ParsedRequest {
  serviceType: string
  issueDescription: string
  severity: 'low' | 'medium' | 'high'
  location: string
  preferredDate: string
  preferredTimeWindow: string
  isoTimeFrom: string
  isoTimeTo: string
  priceSensitivity: 'low' | 'medium' | 'high'
  detectedLanguage: string
  confidenceScore: number
  clarificationNeeded: boolean
  clarificationQuestion: string
}

// Direct keyword-based fallback parser for when DeepSeek fails
function directParse(input: string): ParsedRequest {
  const lower = input.toLowerCase()

  // Service type detection
  const serviceMap: Record<string, string[]> = {
    'AC Repair': ['ac', 'air conditioner', 'air cooler', 'hvac', 'cooling', 'split ac', 'window ac', 'gas refill', 'ac theek', 'ac fix', 'ac repair', 'ac technician'],
    'Electrician': ['electric', 'bijli', 'wiring', 'light', 'fan', 'switch', 'board', 'power', 'current', 'inverter', 'ups', 'solar', 'electrician'],
    'Plumber': ['plumb', 'pipe', 'water', 'leak', 'tap', 'faucet', 'tank', 'bathroom', 'toilet', 'drain', 'sewer', 'plumber', 'pani', 'nal'],
    'Home Tutor': ['tutor', 'teacher', 'tuition', 'padhai', 'parh', 'study', 'class', 'lesson', 'math', 'physics', 'chemistry', 'english', 'urdu', 'quran', 'tutor'],
    'Mechanic': ['mechanic', 'car', 'bike', 'vehicle', 'engine', 'oil change', 'brake', 'tire', 'tyre', 'auto', 'driver', 'mechanic', 'gari'],
  }

  let serviceType = ''
  for (const [service, keywords] of Object.entries(serviceMap)) {
    if (keywords.some((k) => lower.includes(k))) {
      serviceType = service
      break
    }
  }

  // Location detection
  const locationMap = ['islamabad', 'karachi', 'lahore', 'peshawar', 'multan', 'rawalpindi', 'faisalabad', 'g-13', 'g-11', 'g-10', 'f-10', 'f-8', 'f-7', 'f-6', 'i-8', 'i-10', 'defence', 'clifton', 'gulshan', 'gulberg', 'dha', 'johar town', 'model town', 'hayatabad', 'university town', 'saddar', 'koral', 'bahria']
  let location = ''
  for (const loc of locationMap) {
    if (lower.includes(loc.toLowerCase())) {
      location = loc
      break
    }
  }

  // Time detection
  const timeKeywords: Record<string, string> = {
    'kal': 'tomorrow',
    'parso': 'day after tomorrow',
    'aaj': 'today',
    'subah': 'morning',
    'shaam': 'evening',
    'dopahar': 'afternoon',
    'raat': 'night',
    'morning': 'morning',
    'evening': 'evening',
    'afternoon': 'afternoon',
    'tomorrow': 'tomorrow',
    'today': 'today',
  }
  let preferredTimeWindow = ''
  for (const [keyword, time] of Object.entries(timeKeywords)) {
    if (lower.includes(keyword)) {
      preferredTimeWindow = time
      break
    }
  }

  // Severity detection
  let severity: 'low' | 'medium' | 'high' = 'medium'
  if (lower.includes('urgent') || lower.includes('jaldi') || lower.includes('emergency') || lower.includes('turant')) {
    severity = 'high'
  } else if (lower.includes('normal') || lower.includes('theek') || lower.includes('general')) {
    severity = 'low'
  }

  // Price sensitivity
  let priceSensitivity: 'low' | 'medium' | 'high' = 'medium'
  if (lower.includes('budget') || lower.includes('sasta') || lower.includes('cheap') || lower.includes('kam paise')) {
    priceSensitivity = 'high'
  } else if (lower.includes('expensive') || lower.includes('mehnga') || lower.includes('quality') || lower.includes('best')) {
    priceSensitivity = 'low'
  }

  return {
    serviceType,
    issueDescription: input,
    severity,
    location,
    preferredDate: preferredTimeWindow.includes('tomorrow') ? 'tomorrow' : preferredTimeWindow.includes('today') ? 'today' : '',
    preferredTimeWindow,
    isoTimeFrom: '',
    isoTimeTo: '',
    priceSensitivity,
    detectedLanguage: /[\u0600-\u06FF]/.test(input) ? 'ur' : 'en',
    confidenceScore: serviceType ? 85 : 65,
    clarificationNeeded: !serviceType,
    clarificationQuestion: !serviceType ? 'What service do you need? (AC Repair, Electrician, Plumber, Home Tutor, Mechanic)' : '',
  }
}

export async function agent1LanguageUnderstanding(
  userInput: string,
  language: string = 'en'
): Promise<ParsedRequest> {
  const startTime = Date.now()

  // Quick validation
  if (!userInput || userInput.trim().length < 2) {
    return {
      serviceType: '',
      issueDescription: '',
      severity: 'medium',
      location: '',
      preferredDate: '',
      preferredTimeWindow: '',
      isoTimeFrom: '',
      isoTimeTo: '',
      priceSensitivity: 'medium',
      detectedLanguage: language,
      confidenceScore: 30,
      clarificationNeeded: true,
      clarificationQuestion: 'Please describe what service you need. For example: "AC theek karo G-13 mein kal subah"',
    }
  }

  const prompt = `You are a multilingual service request parser for Pakistan's informal service economy.
Parse this user input: "${userInput}"

Handle Urdu script, Roman Urdu, English, misspellings, slang, and code-switching.
Common services: AC Repair, Electrician, Plumber, Home Tutor, Mechanic
Common cities: Islamabad, Karachi, Lahore, Peshawar, Multan
Common areas: G-13, G-11, F-10, Defence, Gulshan, Johar Town, etc.

Return ONLY valid JSON with no markdown, no code fences, no explanation:
{
  "serviceType": "one of: AC Repair, Electrician, Plumber, Home Tutor, Mechanic, or other",
  "issueDescription": "brief description of the issue",
  "severity": "low or medium or high",
  "location": "city or area name if mentioned, empty string if not",
  "preferredDate": "today, tomorrow, or specific date if mentioned, empty string if not",
  "preferredTimeWindow": "morning, afternoon, evening, or specific time if mentioned, empty string if not",
  "isoTimeFrom": "",
  "isoTimeTo": "",
  "priceSensitivity": "low or medium or high",
  "detectedLanguage": "en or ur-rom or ur",
  "confidenceScore": 85,
  "clarificationNeeded": false,
  "clarificationQuestion": ""
}

Rules:
- If service type is unclear, set confidenceScore to 60 and clarificationNeeded to true
- If location is missing, set confidenceScore to 70
- If you can identify the service, set confidenceScore to 85 or higher
- Always return valid JSON only`

  try {
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

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.choices[0].message.content
    const processingTime = Date.now() - startTime

    // Parse JSON response
    let parsed: any
    try {
      let cleaned = text.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      const match = cleaned.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(match ? match[0] : cleaned)
    } catch {
      // JSON parse failed, use direct parse
      const direct = directParse(userInput)
      return { ...direct, confidenceScore: Math.max(direct.confidenceScore, 65) }
    }

    // Validate the parsed result
    if (!parsed.serviceType || parsed.serviceType.trim() === '') {
      const direct = directParse(userInput)
      return { ...direct, confidenceScore: Math.max(direct.confidenceScore, 65) }
    }

    return {
      serviceType: parsed.serviceType || '',
      issueDescription: parsed.issueDescription || userInput,
      severity: ['low', 'medium', 'high'].includes(parsed.severity) ? parsed.severity : 'medium',
      location: parsed.location || '',
      preferredDate: parsed.preferredDate || '',
      preferredTimeWindow: parsed.preferredTimeWindow || '',
      isoTimeFrom: parsed.isoTimeFrom || '',
      isoTimeTo: parsed.isoTimeTo || '',
      priceSensitivity: ['low', 'medium', 'high'].includes(parsed.priceSensitivity) ? parsed.priceSensitivity : 'medium',
      detectedLanguage: parsed.detectedLanguage || language,
      confidenceScore: parsed.confidenceScore || 75,
      clarificationNeeded: parsed.clarificationNeeded || false,
      clarificationQuestion: parsed.clarificationQuestion || '',
    }
  } catch (err) {
    // DeepSeek API failed — use direct keyword parsing as fallback
    console.log('DeepSeek API failed, using direct parse fallback:', err)
    const direct = directParse(userInput)
    return {
      ...direct,
      confidenceScore: Math.max(direct.confidenceScore, 70),
    }
  }
}
