import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CameraCapture } from '@/components/camera/CameraCapture'
import { LeadForm } from '@/components/lead/LeadForm'
import { ActivityPrompt } from '@/components/lead/ActivityPrompt'
import { useBusinessCard } from '@/hooks/useBusinessCard'
import { useAppStore } from '@/store/useAppStore'
import { Spinner } from '@/components/ui'
import type { Lead, Activity } from '@/types'

const steps = ['capture', 'review', 'save', 'activity', 'done'] as const

export function MobileScan() {
  const navigate = useNavigate()
  const store = useAppStore()
  const { session, processCapture, saveLead, logActivity, isSaving, isLoggingActivity } = useBusinessCard()
  const { step } = session

  function handleCapture(dataUrl: string) {
    store.setSession({ imageDataUrl: dataUrl, mode: 'camera' })
    processCapture(dataUrl, 'camera')
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
      {/* Close button — only shown outside camera */}
      {step !== 'capture' && (
        <div className="absolute top-4 right-4 z-20 safe-top">
          <button
            onClick={handleSkip}
            className="h-9 w-9 rounded-full bg-surface-800/80 backdrop-blur border border-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Step progress */}
      {step !== 'capture' && step !== 'done' && (
        <StepProgress current={steps.indexOf(step)} total={steps.length - 1} />
      )}

      <AnimatePresence mode="wait">
        {/* CAPTURE */}
        {step === 'capture' && (
          <motion.div key="capture" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CameraCapture onCapture={handleCapture} isProcessing={session.isProcessing} />
          </motion.div>
        )}

        {/* PROCESSING (AI extraction in progress) */}
        {step === 'capture' && session.isProcessing && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface-950/60">
            <Spinner size="lg" />
          </div>
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

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 px-5 pt-4 pb-2 safe-top">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex-1 h-1 rounded-full overflow-hidden bg-surface-800"
        >
          <motion.div
            className="h-full bg-brand-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: i < current ? '100%' : i === current ? '60%' : '0%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      ))}
    </div>
  )
}
