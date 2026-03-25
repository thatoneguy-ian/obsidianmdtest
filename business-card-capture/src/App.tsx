import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { MobileScan } from '@/pages/MobileScan'
import { DesktopScan } from '@/pages/DesktopScan'
import { RecentLeads } from '@/pages/RecentLeads'
import { Profile } from '@/pages/Profile'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      retry: 2,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<Home />} />
            <Route path="/scan/camera" element={<MobileScan />} />
            <Route path="/scan/desktop" element={<DesktopScan />} />
            <Route path="/recent" element={<RecentLeads />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
