import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type {
  CaptureSession,
  CaptureStep,
  CaptureMode,
  BusinessCardData,
  Lead,
  Activity,
  Toast,
} from '@/types'

// ─── State Shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Capture session
  session: CaptureSession
  setSession: (updates: Partial<CaptureSession>) => void
  resetSession: () => void
  setStep: (step: CaptureStep) => void
  setMode: (mode: CaptureMode) => void
  setExtractedData: (data: Partial<BusinessCardData>) => void
  setMappedFields: (fields: Partial<Lead>) => void

  // Recent leads cache
  recentLeads: Lead[]
  addRecentLead: (lead: Lead) => void
  clearRecentLeads: () => void

  // Pending activities
  pendingActivities: Omit<Activity, 'id' | 'createdAt'>[]
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void
  clearActivities: () => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void

  // Global UI
  isDarkMode: boolean
  toggleDarkMode: () => void
  isMobile: boolean
  setIsMobile: (val: boolean) => void
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultSession: CaptureSession = {
  mode: 'camera',
  step: 'capture',
  isProcessing: false,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector((set) => ({
      // ── Session ──
      session: defaultSession,

      setSession: (updates) =>
        set((s) => ({ session: { ...s.session, ...updates } })),

      resetSession: () =>
        set({ session: defaultSession }),

      setStep: (step) =>
        set((s) => ({ session: { ...s.session, step } })),

      setMode: (mode) =>
        set((s) => ({ session: { ...s.session, mode } })),

      setExtractedData: (data) =>
        set((s) => ({
          session: { ...s.session, extractedData: { ...s.session.extractedData, ...data } },
        })),

      setMappedFields: (fields) =>
        set((s) => ({
          session: { ...s.session, mappedFields: { ...s.session.mappedFields, ...fields } },
        })),

      // ── Recent Leads ──
      recentLeads: [],

      addRecentLead: (lead) =>
        set((s) => ({
          recentLeads: [lead, ...s.recentLeads].slice(0, 20),
        })),

      clearRecentLeads: () => set({ recentLeads: [] }),

      // ── Activities ──
      pendingActivities: [],

      addActivity: (activity) =>
        set((s) => ({
          pendingActivities: [...s.pendingActivities, activity],
        })),

      clearActivities: () => set({ pendingActivities: [] }),

      // ── Toasts ──
      toasts: [],

      addToast: (toast) =>
        set((s) => ({
          toasts: [...s.toasts, { ...toast, id: crypto.randomUUID() }],
        })),

      removeToast: (id) =>
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        })),

      // ── UI ──
      isDarkMode: true,
      toggleDarkMode: () => set((s) => ({ isDarkMode: !s.isDarkMode })),

      isMobile: window.innerWidth < 768,
      setIsMobile: (val) => set({ isMobile: val }),
    })),
    { name: 'business-card-capture' }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectSession = (s: AppState) => s.session
export const selectStep = (s: AppState) => s.session.step
export const selectMode = (s: AppState) => s.session.mode
export const selectExtractedData = (s: AppState) => s.session.extractedData
export const selectIsProcessing = (s: AppState) => s.session.isProcessing
