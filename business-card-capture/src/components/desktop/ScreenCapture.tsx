import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Crosshair, RotateCcw, Zap } from 'lucide-react'
import { useScreenCapture } from '@/hooks/useScreenCapture'
import { Button, Spinner } from '@/components/ui'
import { cn } from '@/components/ui/utils'

interface ScreenCaptureProps {
  onCapture: (croppedDataUrl: string) => void
  isProcessing?: boolean
}

interface DragState {
  active: boolean
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function ScreenCapture({ onCapture, isProcessing = false }: ScreenCaptureProps) {
  const { isCapturing, previewUrl, startCapture, cropAndExport, reset } = useScreenCapture()

  const imgRef = useRef<HTMLImageElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  const [drag, setDrag] = useState<DragState>({
    active: false, startX: 0, startY: 0, currentX: 0, currentY: 0,
  })
  const [selection, setSelection] = useState<{ x: number; y: number; w: number; h: number } | null>(null)

  // Convert screen coords to image-relative coords
  function toImageCoords(screenX: number, screenY: number) {
    const img = imgRef.current
    if (!img) return { x: 0, y: 0 }
    const rect = img.getBoundingClientRect()
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height
    return {
      x: (screenX - rect.left) * scaleX,
      y: (screenY - rect.top) * scaleY,
    }
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!previewUrl) return
    setDrag({ active: true, startX: e.clientX, startY: e.clientY, currentX: e.clientX, currentY: e.clientY })
    setSelection(null)
  }, [previewUrl])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!drag.active) return
    setDrag((d) => ({ ...d, currentX: e.clientX, currentY: e.clientY }))
  }, [drag.active])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (!drag.active) return
    const { startX, startY } = drag
    const endX = e.clientX
    const endY = e.clientY

    const minW = 20, minH = 20
    if (Math.abs(endX - startX) < minW || Math.abs(endY - startY) < minH) {
      setDrag((d) => ({ ...d, active: false }))
      return
    }

    const x = Math.min(startX, endX)
    const y = Math.min(startY, endY)
    const w = Math.abs(endX - startX)
    const h = Math.abs(endY - startY)
    setSelection({ x, y, w, h })
    setDrag((d) => ({ ...d, active: false }))
  }, [drag])

  function handleExtract() {
    if (!selection) return
    const img = imgRef.current
    if (!img) return

    const rect = img.getBoundingClientRect()
    const scaleX = img.naturalWidth / rect.width
    const scaleY = img.naturalHeight / rect.height

    const region = {
      x: (selection.x - rect.left) * scaleX,
      y: (selection.y - rect.top) * scaleY,
      width: selection.w * scaleX,
      height: selection.h * scaleY,
    }

    const cropped = cropAndExport(region)
    if (cropped) onCapture(cropped)
  }

  // Selection rect in screen space
  const selRect = drag.active
    ? {
        left: Math.min(drag.startX, drag.currentX),
        top: Math.min(drag.startY, drag.currentY),
        width: Math.abs(drag.currentX - drag.startX),
        height: Math.abs(drag.currentY - drag.startY),
      }
    : selection
    ? { left: selection.x, top: selection.y, width: selection.w, height: selection.h }
    : null

  return (
    <div className="flex flex-col h-full bg-surface-950">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Screen Capture</h2>
          <p className="text-xs text-surface-400 mt-0.5">
            {!previewUrl ? 'Capture your screen, then draw a selection' : 'Draw a box around the business info'}
          </p>
        </div>
        {previewUrl && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </Button>
        )}
      </div>

      {/* Main area */}
      <div className="flex-1 relative overflow-hidden">
        {!previewUrl ? (
          // Empty state — launch capture
          <div className="flex flex-col items-center justify-center h-full gap-6 px-8">
            <div className="h-24 w-24 rounded-3xl bg-surface-800 border border-surface-700 flex items-center justify-center">
              <Monitor size={36} className="text-surface-400" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold text-white">Capture your screen</h3>
              <p className="text-sm text-surface-400 mt-2 leading-relaxed max-w-xs">
                Select a window or tab containing a Google search result or business listing.
                Then draw a box around the info you want to import.
              </p>
            </div>
            <Button
              size="lg"
              onClick={startCapture}
              isLoading={isCapturing}
              className="gap-2"
            >
              <Crosshair size={18} />
              Start Capture
            </Button>
          </div>
        ) : (
          // Preview with selection overlay
          <div
            ref={overlayRef}
            className={cn(
              'relative w-full h-full select-none overflow-auto',
              !isProcessing && 'cursor-crosshair'
            )}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          >
            <img
              ref={imgRef}
              src={previewUrl}
              alt="Screen capture"
              className="w-full h-full object-contain"
              draggable={false}
            />

            {/* Dim overlay */}
            {!selection && !drag.active && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
                  <Crosshair size={14} />
                  Draw a selection box
                </div>
              </div>
            )}

            {/* Selection rectangle */}
            {selRect && (
              <div
                className="fixed border-2 border-brand-500 bg-brand-500/10 pointer-events-none"
                style={{
                  left: selRect.left,
                  top: selRect.top,
                  width: selRect.width,
                  height: selRect.height,
                }}
              >
                {/* Corner handles */}
                {['tl','tr','bl','br'].map((c) => (
                  <div
                    key={c}
                    className={cn(
                      'absolute h-3 w-3 bg-brand-500 rounded-sm',
                      c === 'tl' && '-top-1.5 -left-1.5',
                      c === 'tr' && '-top-1.5 -right-1.5',
                      c === 'bl' && '-bottom-1.5 -left-1.5',
                      c === 'br' && '-bottom-1.5 -right-1.5',
                    )}
                  />
                ))}
              </div>
            )}

            {/* Processing overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-surface-950/60 backdrop-blur-xs flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Spinner size="lg" />
                  <p className="text-sm font-medium text-brand-300">Running OCR…</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer action */}
      {selection && !isProcessing && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 border-t border-surface-800 safe-bottom"
        >
          <Button size="lg" className="w-full gap-2" onClick={handleExtract}>
            <Zap size={18} />
            Extract Business Info
          </Button>
        </motion.div>
      )}
    </div>
  )
}
