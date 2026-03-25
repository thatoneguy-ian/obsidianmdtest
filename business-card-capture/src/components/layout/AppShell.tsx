import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from './Navigation'
import { ToastRegion } from '../ui/ToastRegion'
import { useAppStore } from '@/store/useAppStore'

export function AppShell() {
  const setIsMobile = useAppStore((s) => s.setIsMobile)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [setIsMobile])

  return (
    <div className="flex flex-col h-full bg-surface-950 overflow-hidden">
      {/* Safe area top padding for notch devices */}
      <div className="safe-top" />

      {/* Page content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <Navigation />

      {/* Toast notifications */}
      <ToastRegion />
    </div>
  )
}
