import { callGemini, parseJsonResponse } from '@/lib/gemini'
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

export async function agent1LanguageUnderstanding(
  userInput: string,
  language: string = 'en'
): Promise<ParsedRequest> {
  const startTime = Date.now()
  const prompt = `You are a multilingual service request parser for Pakistan.
Parse this user input: "${userInput}"
Handle Urdu, Roman Urdu, English, misspellings, slang, and code-switching.
Return ONLY valid JSON:
{
  "serviceType": "",
  "issueDescription": "",
  "severity": "low | medium | high",
  "location": "",
  "preferredDate": "",
  "preferredTimeWindow": "",
  "isoTimeFrom": "",
  "isoTimeTo": "",
  "priceSensitivity": "low | medium | high",
  "detectedLanguage": "",
  "confidenceScore": 0-100,
  "clarificationNeeded": true | false,
  "clarificationQuestion": ""
}`

  try {
    const response = await callGemini(prompt)
    const parsed = parseJsonResponse(response)
    const processingTime = Date.now() - startTime

    return {
      serviceType: parsed.serviceType || '',
      issueDescription: parsed.issueDescription || '',
      severity: parsed.severity || 'medium',
      location: parsed.location || '',
      preferredDate: parsed.preferredDate || '',
      preferredTimeWindow: parsed.preferredTimeWindow || '',
      isoTimeFrom: parsed.isoTimeFrom || '',
      isoTimeTo: parsed.isoTimeTo || '',
      priceSensitivity: parsed.priceSensitivity || 'medium',
      detectedLanguage: parsed.detectedLanguage || language,
      confidenceScore: parsed.confidenceScore || 50,
      clarificationNeeded: parsed.clarificationNeeded || false,
      clarificationQuestion: parsed.clarificationQuestion || '',
    }
  } catch {
    // Fallback: return minimal parsed data
    return {
      serviceType: userInput,
      issueDescription: userInput,
      severity: 'medium',
      location: '',
      preferredDate: '',
      preferredTimeWindow: '',
      isoTimeFrom: '',
      isoTimeTo: '',
      priceSensitivity: 'medium',
      detectedLanguage: language,
      confidenceScore: 50,
      clarificationNeeded: true,
      clarificationQuestion: 'Please provide more details about the service you need.',
    }
  }
}
