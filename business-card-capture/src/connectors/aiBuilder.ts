/**
 * AI Builder Connector
 *
 * Production: These functions call Power Platform AI Builder via the
 * connector SDK (window.PowerApps.Connector.invoke).
 *
 * Development: Returns realistic mock data so the full UI can be developed
 * and tested without a live Power Platform environment.
 *
 * Swap VITE_USE_MOCK_CONNECTORS=false in .env to hit real endpoints.
 */

import type { BusinessCardData, AIBuilderOCRResult, ConnectorResult } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CONNECTORS !== 'false'
const MOCK_DELAY_MS = 1800 // Simulate AI processing time

// ─── Types ────────────────────────────────────────────────────────────────────

interface BusinessCardReaderResponse {
  firstName: string
  lastName: string
  jobTitle: string
  department: string
  company: string
  phoneNumber: string
  mobilePhoneNumber: string
  email: string
  website: string
  addressStreet: string
  addressCity: string
  addressState: string
  addressPostalCode: string
  addressCountry: string
  confidence: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockCards: Partial<BusinessCardReaderResponse>[] = [
  {
    firstName: 'Ian',
    lastName: 'Mitchell',
    jobTitle: 'Owner',
    company: "Ian's Plumbing",
    phoneNumber: '(555) 847-2291',
    mobilePhoneNumber: '(555) 391-0044',
    email: 'ian@iansplumbing.com',
    website: 'iansplumbing.com',
    addressStreet: '4820 Ridgeline Dr',
    addressCity: 'Austin',
    addressState: 'TX',
    addressPostalCode: '78701',
    addressCountry: 'USA',
    confidence: 0.94,
  },
  {
    firstName: 'Sarah',
    lastName: 'Chen',
    jobTitle: 'Director of Operations',
    company: 'PressurePro Washing',
    phoneNumber: '(512) 220-4411',
    email: 'schen@pressurepro.com',
    website: 'pressurepro.com',
    addressStreet: '1150 Commerce Pkwy',
    addressCity: 'Round Rock',
    addressState: 'TX',
    addressPostalCode: '78664',
    addressCountry: 'USA',
    confidence: 0.88,
  },
]

let mockCardIndex = 0

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function mapToBusinessCard(r: Partial<BusinessCardReaderResponse>): BusinessCardData {
  const first = r.firstName ?? ''
  const last = r.lastName ?? ''
  return {
    firstName: first,
    lastName: last,
    fullName: [first, last].filter(Boolean).join(' '),
    jobTitle: r.jobTitle ?? '',
    company: r.company ?? '',
    phone: r.phoneNumber ?? '',
    mobilePhone: r.mobilePhoneNumber ?? '',
    email: r.email ?? '',
    website: r.website ?? '',
    address: r.addressStreet ?? '',
    city: r.addressCity ?? '',
    state: r.addressState ?? '',
    zip: r.addressPostalCode ?? '',
    country: r.addressCountry ?? '',
    confidence: r.confidence ?? 0,
  }
}

// ─── AI Builder: Business Card Reader ─────────────────────────────────────────

/**
 * Extracts structured contact data from a business card image.
 *
 * Production connector:
 *   AI Builder > Prebuilt models > Business card reader
 *   Action: "Extract information from business cards"
 */
export async function extractBusinessCard(
  imageBase64: string
): Promise<ConnectorResult<BusinessCardData>> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY_MS)
    // Rotate through mock cards so devs can test different data
    const card = mockCards[mockCardIndex % mockCards.length]
    mockCardIndex++
    return { success: true, data: mapToBusinessCard(card) }
  }

  try {
    // Production: call via Power Apps connector bridge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.AIBuilder
    if (!connector) throw new Error('AI Builder connector not available')

    const result = await connector.invoke('extractBusinessCard', {
      image: imageBase64,
      imageFormat: 'jpeg',
    })

    return { success: true, data: mapToBusinessCard(result as BusinessCardReaderResponse) }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'AI Builder call failed',
    }
  }
}

// ─── AI Builder: OCR (for desktop screen captures) ────────────────────────────

/**
 * Runs OCR on an arbitrary image region and returns structured text blocks.
 *
 * Production connector:
 *   AI Builder > Prebuilt models > Text recognition
 *   Action: "Recognize text in an image"
 */
export async function recognizeText(
  imageBase64: string
): Promise<ConnectorResult<AIBuilderOCRResult>> {
  if (USE_MOCK) {
    await sleep(MOCK_DELAY_MS - 400)
    return {
      success: true,
      data: {
        text: "PressurePro Washing\nSarah Chen - Director of Operations\n(512) 220-4411\nschen@pressurepro.com\n1150 Commerce Pkwy, Round Rock TX 78664",
        boundingBoxes: [
          {
            text: 'PressurePro Washing',
            confidence: 0.98,
            boundingBox: { x: 12, y: 10, width: 220, height: 28 },
          },
          {
            text: 'Sarah Chen - Director of Operations',
            confidence: 0.96,
            boundingBox: { x: 12, y: 44, width: 280, height: 22 },
          },
          {
            text: '(512) 220-4411',
            confidence: 0.99,
            boundingBox: { x: 12, y: 72, width: 160, height: 20 },
          },
        ],
        confidence: 0.97,
      },
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.AIBuilder
    if (!connector) throw new Error('AI Builder connector not available')

    const result = await connector.invoke('recognizeText', {
      image: imageBase64,
    })

    return { success: true, data: result as AIBuilderOCRResult }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'OCR call failed',
    }
  }
}

/**
 * Parses raw OCR text into structured BusinessCardData fields.
 * Uses simple heuristics — in production, consider a second AI Builder
 * custom model trained on your specific data format.
 */
export function parseOCRToCard(ocrText: string): Partial<BusinessCardData> {
  const lines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean)
  const result: Partial<BusinessCardData> = {}

  const emailRe = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i
  const phoneRe = /(\+?1?\s?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/
  const urlRe = /(?:https?:\/\/)?(?:www\.)?[\w-]+\.[a-z]{2,}(?:\/\S*)?/i

  for (const line of lines) {
    if (!result.email && emailRe.test(line)) {
      result.email = line.match(emailRe)![0]
      continue
    }
    if (!result.phone && phoneRe.test(line)) {
      result.phone = line.match(phoneRe)![0]
      continue
    }
    if (!result.website && urlRe.test(line) && !line.includes('@')) {
      result.website = line.match(urlRe)![0]
      continue
    }
    // First substantial line → company name
    if (!result.company && line.length > 3) {
      result.company = line
      continue
    }
    // Second substantial line → name + title
    if (result.company && !result.fullName && line.includes('-')) {
      const [name, title] = line.split('-').map((s) => s.trim())
      result.fullName = name
      result.jobTitle = title
      const parts = name.split(' ')
      result.firstName = parts[0]
      result.lastName = parts.slice(1).join(' ')
      continue
    }
  }

  return result
}
