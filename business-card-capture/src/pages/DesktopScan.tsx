import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ScreenCapture } from '@/components/desktop/ScreenCapture'
import { LeadForm } from '@/components/lead/LeadForm'
import { ActivityPrompt } from '@/components/lead/ActivityPrompt'
import { useBusinessCard } from '@/hooks/useBusinessCard'
import { useAppStore } from '@/store/useAppStore'
import type { Lead, Activity } from '@/types'

export function DesktopScan() {
  const navigate = useNavigate()
  const store = useAppStore()
  const { session, processCapture, saveLead, logActivity, isSaving, isLoggingActivity } = useBusinessCard()
  const { step } = session

  function handleCapture(dataUrl: string) {
    store.setSession({ imageDataUrl: dataUrl, mode: 'screen' })
    processCapture(dataUrl, 'screen')
  }

  function handleSave(values: Partial<Lead>) {
    store.setMappedFields(values)
    saveLead(values)
  }

  function handleActivity(activity: Omit<Activity, 'id' | 'createdAt'>) {
    logActivity(activity)
    setTimeout(() => {
      store.resetSession()
      navigate('/')
    }, 1200)
  }

  function handleSkip() {
    store.resetSession()
    navigate('/')
  }

  return (
    <div className="flex flex-col h-screen bg-surface-950">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-0 safe-top">
        <div className="w-8" />
        {step !== 'capture' && step !== 'done' && (
          <StepDots current={['capture', 'review', 'activity'].indexOf(step)} />
        )}
        <button
          onClick={handleSkip}
          className="h-8 w-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* CAPTURE */}
        {step === 'capture' && (
          <motion.div
            key="capture"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ScreenCapture onCapture={handleCapture} isProcessing={session.isProcessing} />
          </motion.div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <motion.div
            key="review"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <LeadForm
              extractedData={session.extractedData}
              initialValues={session.mappedFields}
              capturedImage={session.imageDataUrl}
              onSave={handleSave}
              onBack={() => store.setStep('capture')}
              isSaving={isSaving}
            />
          </motion.div>
        )}

        {/* ACTIVITY */}
        {(step === 'activity' || step === 'done') && (
          <motion.div
            key="activity"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            <ActivityPrompt
              lead={session.mappedFields ?? {}}
              onLog={handleActivity}
              onSkip={handleSkip}
              isLogging={isLoggingActivity}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 items-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? 'h-2 w-5 bg-brand-500'
              : i < current
              ? 'h-1.5 w-1.5 bg-brand-700'
              : 'h-1.5 w-1.5 bg-surface-700'
          }`}
        />
      ))}
    </div>
  )
}
