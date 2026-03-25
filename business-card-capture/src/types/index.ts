// ─── Business Card ────────────────────────────────────────────────────────────

export interface BusinessCardData {
  firstName: string
  lastName: string
  fullName: string
  jobTitle: string
  company: string
  phone: string
  mobilePhone: string
  email: string
  website: string
  address: string
  city: string
  state: string
  zip: string
  country: string
  confidence: number // 0–1 from AI Builder
}

export type CardField = keyof Omit<BusinessCardData, 'confidence'>

// ─── Lead / Contact ───────────────────────────────────────────────────────────

export type RecordType = 'lead' | 'contact'

export interface Lead {
  id?: string
  firstName: string
  lastName: string
  company: string
  jobTitle: string
  phone: string
  mobilePhone: string
  email: string
  website: string
  address1: string
  city: string
  state: string
  zip: string
  country: string
  source: LeadSource
  status: LeadStatus
  notes: string
  createdAt?: string
  updatedAt?: string
}

export type LeadSource =
  | 'business_card'
  | 'screen_capture'
  | 'manual'
  | 'web'
  | 'referral'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'unqualified'
  | 'converted'

// ─── Activity ─────────────────────────────────────────────────────────────────

export type ActivityType = 'call' | 'doorknock' | 'email' | 'meeting' | 'note'

export interface Activity {
  id?: string
  leadId: string
  type: ActivityType
  subject: string
  notes: string
  scheduledAt?: string
  completedAt?: string
  createdAt?: string
}

// ─── Capture Session ──────────────────────────────────────────────────────────

export type CaptureMode = 'camera' | 'screen'
export type CaptureStep = 'capture' | 'review' | 'save' | 'activity' | 'done'

export interface CaptureSession {
  mode: CaptureMode
  step: CaptureStep
  imageDataUrl?: string
  extractedData?: Partial<BusinessCardData>
  mappedFields?: Partial<Lead>
  isProcessing: boolean
  error?: string
}

// ─── Connector Responses ─────────────────────────────────────────────────────

export interface ConnectorResult<T> {
  success: boolean
  data?: T
  error?: string
  statusCode?: number
}

export interface AIBuilderOCRResult {
  text: string
  boundingBoxes: BoundingBox[]
  confidence: number
}

export interface BoundingBox {
  text: string
  confidence: number
  boundingBox: { x: number; y: number; width: number; height: number }
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

export interface DraggedField {
  field: CardField
  value: string
  sourceLabel: string
}
