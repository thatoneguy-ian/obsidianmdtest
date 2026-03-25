import { useRef, useState, useCallback, useEffect } from 'react'

export type FacingMode = 'environment' | 'user'

interface UseCameraOptions {
  facingMode?: FacingMode
  width?: number
  height?: number
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  isReady: boolean
  isStreaming: boolean
  error: string | null
  facingMode: FacingMode
  startCamera: () => Promise<void>
  stopCamera: () => void
  capture: () => string | null // returns base64 dataURL
  flipCamera: () => void
  hasMultipleCameras: boolean
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { facingMode: initialFacing = 'environment', width = 1920, height = 1080 } = options

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isReady, setIsReady] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<FacingMode>(initialFacing)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)

  // Check for multiple cameras
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoCams = devices.filter((d) => d.kind === 'videoinput')
      setHasMultipleCameras(videoCams.length > 1)
    })
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsStreaming(false)
    setIsReady(false)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    stopCamera()

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setIsStreaming(true)
          setIsReady(true)
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera access denied'
      setError(msg)
      console.error('[useCamera] Error:', err)
    }
  }, [facingMode, width, height, stopCamera])

  // Restart when facingMode changes
  useEffect(() => {
    if (isStreaming) {
      startCamera()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  const capture = useCallback((): string | null => {
    const video = videoRef.current
    if (!video || !isReady) return null

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas')
    }
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    ctx.drawImage(video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.92)
  }, [isReady])

  const flipCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }, [])

  return {
    videoRef,
    isReady,
    isStreaming,
    error,
    facingMode,
    startCamera,
    stopCamera,
    capture,
    flipCamera,
    hasMultipleCameras,
  }
}
