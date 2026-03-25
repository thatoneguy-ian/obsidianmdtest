import { useRef, useState, useCallback } from 'react'

interface CropRegion {
  x: number
  y: number
  width: number
  height: number
}

interface UseScreenCaptureReturn {
  isCapturing: boolean
  previewUrl: string | null
  cropRegion: CropRegion | null
  error: string | null
  startCapture: () => Promise<void>
  cropAndExport: (region: CropRegion) => string | null
  reset: () => void
  screenRef: React.RefObject<HTMLCanvasElement>
  videoRef: React.RefObject<HTMLVideoElement>
}

/**
 * useScreenCapture
 *
 * Uses the Screen Capture API (getDisplayMedia) to:
 * 1. Start a screen share stream
 * 2. Render a frame to a canvas for region selection
 * 3. Export a cropped region as base64 for OCR
 *
 * Desktop-only — gracefully unavailable in Power Apps mobile shell.
 */
export function useScreenCapture(): UseScreenCaptureReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const screenRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [isCapturing, setIsCapturing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [cropRegion, setCropRegion] = useState<CropRegion | null>(null)
  const [error, setError] = useState<string | null>(null)

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }, [])

  const startCapture = useCallback(async () => {
    setError(null)
    setIsCapturing(true)

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: false,
      })
      streamRef.current = stream

      // Capture a single frame
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()

      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(video, 0, 0)

      stopStream()
      video.remove()

      const url = canvas.toDataURL('image/png')
      setPreviewUrl(url)

      // Also render to the shared canvas ref if present
      if (screenRef.current) {
        screenRef.current.width = canvas.width
        screenRef.current.height = canvas.height
        screenRef.current.getContext('2d')?.drawImage(canvas, 0, 0)
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'NotAllowedError') {
        setError(err.message)
      }
    } finally {
      setIsCapturing(false)
    }
  }, [stopStream])

  const cropAndExport = useCallback(
    (region: CropRegion): string | null => {
      if (!previewUrl) return null
      setCropRegion(region)

      const img = new Image()
      img.src = previewUrl

      const canvas = document.createElement('canvas')
      canvas.width = region.width
      canvas.height = region.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return null

      ctx.drawImage(img, region.x, region.y, region.width, region.height, 0, 0, region.width, region.height)
      return canvas.toDataURL('image/jpeg', 0.92)
    },
    [previewUrl]
  )

  const reset = useCallback(() => {
    stopStream()
    setPreviewUrl(null)
    setCropRegion(null)
    setError(null)
    setIsCapturing(false)
  }, [stopStream])

  return {
    isCapturing,
    previewUrl,
    cropRegion,
    error,
    startCapture,
    cropAndExport,
    reset,
    screenRef,
    videoRef,
  }
}
