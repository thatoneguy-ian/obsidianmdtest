import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/store/useAppStore'
import { extractBusinessCard, recognizeText, parseOCRToCard } from '@/connectors/aiBuilder'
import { createLead, createActivity, findDuplicateLeads } from '@/connectors/dataverse'
import type { Lead, Activity, BusinessCardData } from '@/types'

/**
 * useBusinessCard — orchestrates the full capture → extract → review → save flow.
 */
export function useBusinessCard() {
  const store = useAppStore()
  const queryClient = useQueryClient()

  // ── Extract from camera image ─────────────────────────────────────────────

  const extractMutation = useMutation({
    mutationFn: async (imageDataUrl: string) => {
      const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')
      const result = await extractBusinessCard(base64)
      if (!result.success || !result.data) throw new Error(result.error ?? 'Extraction failed')
      return result.data
    },
    onMutate: () => {
      store.setSession({ isProcessing: true, error: undefined })
    },
    onSuccess: (data: BusinessCardData) => {
      store.setExtractedData(data)
      store.setSession({
        isProcessing: false,
        mappedFields: cardToLeadFields(data),
      })
      store.setStep('review')
    },
    onError: (err: Error) => {
      store.setSession({ isProcessing: false, error: err.message })
      store.addToast({ title: 'Extraction failed', description: err.message, variant: 'error' })
    },
  })

  // ── Extract from screen capture (OCR) ────────────────────────────────────

  const ocrMutation = useMutation({
    mutationFn: async (imageDataUrl: string) => {
      const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '')
      const result = await recognizeText(base64)
      if (!result.success || !result.data) throw new Error(result.error ?? 'OCR failed')
      return parseOCRToCard(result.data.text)
    },
    onMutate: () => {
      store.setSession({ isProcessing: true, error: undefined })
    },
    onSuccess: (data) => {
      store.setExtractedData(data as BusinessCardData)
      store.setSession({
        isProcessing: false,
        mappedFields: {
          company: data.company,
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          phone: data.phone ?? data.mobilePhone,
          email: data.email,
          website: data.website,
        },
      })
      store.setStep('review')
    },
    onError: (err: Error) => {
      store.setSession({ isProcessing: false, error: err.message })
      store.addToast({ title: 'OCR failed', description: err.message, variant: 'error' })
    },
  })

  // ── Duplicate check ───────────────────────────────────────────────────────

  const checkDuplicates = useCallback(
    async (email: string, phone: string) => {
      const result = await findDuplicateLeads(email, phone)
      return result.data ?? []
    },
    []
  )

  // ── Save Lead ─────────────────────────────────────────────────────────────

  const saveMutation = useMutation({
    mutationFn: async (fields: Partial<Lead>) => {
      const lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
        firstName: fields.firstName ?? '',
        lastName: fields.lastName ?? '',
        company: fields.company ?? '',
        jobTitle: fields.jobTitle ?? '',
        phone: fields.phone ?? '',
        mobilePhone: fields.mobilePhone ?? '',
        email: fields.email ?? '',
        website: fields.website ?? '',
        address1: fields.address1 ?? '',
        city: fields.city ?? '',
        state: fields.state ?? '',
        zip: fields.zip ?? '',
        country: fields.country ?? '',
        source: store.session.mode === 'camera' ? 'business_card' : 'screen_capture',
        status: 'new',
        notes: fields.notes ?? '',
      }

      const result = await createLead(lead)
      if (!result.success || !result.data) throw new Error(result.error ?? 'Save failed')
      return result.data
    },
    onMutate: () => {
      store.setSession({ isProcessing: true })
    },
    onSuccess: (lead: Lead) => {
      store.addRecentLead(lead)
      store.setSession({ isProcessing: false })
      store.setStep('activity')
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      store.addToast({
        title: 'Lead created',
        description: `${lead.firstName} ${lead.lastName} at ${lead.company}`,
        variant: 'success',
      })
    },
    onError: (err: Error) => {
      store.setSession({ isProcessing: false, error: err.message })
      store.addToast({ title: 'Save failed', description: err.message, variant: 'error' })
    },
  })

  // ── Log Activity ──────────────────────────────────────────────────────────

  const activityMutation = useMutation({
    mutationFn: async (activity: Omit<Activity, 'id' | 'createdAt'>) => {
      const result = await createActivity(activity)
      if (!result.success) throw new Error(result.error ?? 'Activity failed')
      return result.data
    },
    onSuccess: () => {
      store.setStep('done')
      store.addToast({ title: 'Activity logged', variant: 'success' })
    },
    onError: (err: Error) => {
      store.addToast({ title: 'Activity failed', description: err.message, variant: 'error' })
    },
  })

  // ── Helpers ───────────────────────────────────────────────────────────────

  const processCapture = useCallback(
    (imageDataUrl: string, mode: 'camera' | 'screen') => {
      store.setSession({ imageDataUrl })
      if (mode === 'camera') {
        extractMutation.mutate(imageDataUrl)
      } else {
        ocrMutation.mutate(imageDataUrl)
      }
    },
    [extractMutation, ocrMutation, store]
  )

  return {
    session: store.session,
    processCapture,
    saveLead: saveMutation.mutate,
    logActivity: activityMutation.mutate,
    checkDuplicates,
    isExtracting: extractMutation.isPending || ocrMutation.isPending,
    isSaving: saveMutation.isPending,
    isLoggingActivity: activityMutation.isPending,
  }
}

// ─── Map BusinessCardData → Lead fields ──────────────────────────────────────

function cardToLeadFields(card: BusinessCardData): Partial<Lead> {
  return {
    firstName: card.firstName,
    lastName: card.lastName,
    company: card.company,
    jobTitle: card.jobTitle,
    phone: card.phone || card.mobilePhone,
    mobilePhone: card.mobilePhone,
    email: card.email,
    website: card.website,
    address1: card.address,
    city: card.city,
    state: card.state,
    zip: card.zip,
    country: card.country,
  }
}
