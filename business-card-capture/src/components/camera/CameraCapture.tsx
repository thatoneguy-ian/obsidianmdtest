import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FlipHorizontal, Zap, ZapOff } from 'lucide-react'
import { useCamera } from '@/hooks/useCamera'
import { Button } from '@/components/ui'
import { cn } from '@/components/ui/utils'

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void
  isProcessing?: boolean
}

export function CameraCapture({ onCapture, isProcessing = false }: CameraCaptureProps) {
  const { videoRef, isReady, isStreaming, error, startCamera, stopCamera, capture, flipCamera, hasMultipleCameras } =
    useCamera({ facingMode: 'environment', width: 1920, height: 1080 })

  const hasStarted = useRef(false)

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true
      startCamera()
    }
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCapture() {
    const dataUrl = capture()
    if (dataUrl) onCapture(dataUrl)
  }

  return (
    <div className="relative flex flex-col h-full bg-black overflow-hidden">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          isReady ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Loading state */}
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-surface-500">
          <div className="h-10 w-10 rounded-full border-2 border-surface-700 border-t-brand-500 animate-spin" />
          <p className="text-sm">Starting camera…</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
          <ZapOff size={40} className="text-surface-600" />
          <div className="text-center">
            <p className="font-semibold text-white">Camera unavailable</p>
            <p className="text-sm text-surface-400 mt-1">{error}</p>
          </div>
          <Button onClick={startCamera} variant="secondary">
            Try again
          </Button>
        </div>
      )}

      {/* Card guide overlay */}
      {isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <CardGuideOverlay />
        </div>
      )}

      {/* Scanning animation when processing */}
      {isProcessing && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
            animate={{ top: ['20%', '80%', '20%'] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          />
          <div className="absolute inset-0 bg-brand-950/40 backdrop-blur-xs flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-brand-300">Extracting details…</p>
            </div>
          </div>
        </div>
      )}

      {/* Top controls */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-end safe-top pointer-events-auto">
        {hasMultipleCameras && (
          <Button
            variant="glass"
            size="icon"
            onClick={flipCamera}
            aria-label="Flip camera"
          >
            <FlipHorizontal size={18} />
          </Button>
        )}
      </div>

      {/* Bottom shutter bar */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-4 flex items-center justify-center safe-bottom">
        <ShutterButton onPress={handleCapture} disabled={!isReady || isProcessing} />
      </div>

      {/* Flash hint */}
      {isStreaming && !isProcessing && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none">
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
            <Zap size={12} className="text-brand-500" />
            <span className="text-xs text-white/80 font-medium">Align card within frame</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Card Guide Overlay ───────────────────────────────────────────────────────

function CardGuideOverlay() {
  return (
    <div className="relative w-[85vw] max-w-md" style={{ aspectRatio: '1.586 / 1' }}>
      {/* Dimmed outside area */}
      <div className="absolute inset-0 rounded-2xl ring-[999px] ring-black/50" />

      {/* Guide border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-white/40" />

      {/* Corner marks */}
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <div
          key={corner}
          className={cn(
            'absolute h-5 w-5 border-white',
            corner === 'tl' && 'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
            corner === 'tr' && 'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
            corner === 'bl' && 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
            corner === 'br' && 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
          )}
        />
      ))}
    </div>
  )
}

// ─── Shutter Button ───────────────────────────────────────────────────────────

function ShutterButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  return (
    <motion.button
      onClick={onPress}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      className={cn(
        'relative h-18 w-18 rounded-full flex items-center justify-center',
        'transition-opacity duration-200',
        disabled ? 'opacity-40 cursor-not-allowed' : 'opacity-100'
      )}
      style={{ height: 72, width: 72 }}
      aria-label="Capture business card"
    >
      {/* T-Mobile magenta outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-brand-500" />
      {/* Inner — white fill */}
      <div className="h-14 w-14 rounded-full bg-white shadow-lg" />
    </motion.button>
  )
}
