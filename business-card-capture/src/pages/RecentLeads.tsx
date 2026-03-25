import { motion } from 'framer-motion'
import { Clock, Camera, Monitor, Phone, Mail, Building2, Search } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import type { Lead } from '@/types'

export function RecentLeads() {
  const recentLeads = useAppStore((s) => s.recentLeads)
  const [query, setQuery] = useState('')

  const filtered = recentLeads.filter((l) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      `${l.firstName} ${l.lastName}`.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 safe-top">
        <div className="flex items-center gap-2 mb-1">
          <Clock size={16} className="text-surface-400" />
          <h1 className="font-semibold text-white text-lg">Recent Leads</h1>
        </div>
        <p className="text-xs text-surface-500">{recentLeads.length} leads captured this session</p>

        {/* Search */}
        <div className="relative mt-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className={cn(
              'w-full pl-9 pr-4 py-2.5 rounded-xl bg-surface-800 border border-surface-700',
              'text-sm text-white placeholder:text-surface-500',
              'focus:outline-none focus:border-brand-500 transition-colors'
            )}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-surface-800 border border-surface-700 flex items-center justify-center">
              <Clock size={28} className="text-surface-600" />
            </div>
            <div className="text-center">
              <p className="text-surface-300 font-medium">No leads yet</p>
              <p className="text-sm text-surface-500 mt-1">Scan a business card to get started</p>
            </div>
          </div>
        )}

        {filtered.map((lead, i) => (
          <LeadRow key={lead.id ?? i} lead={lead} index={i} />
        ))}
      </div>
    </div>
  )
}

function LeadRow({ lead, index }: { lead: Lead; index: number }) {
  const sourceIcon = lead.source === 'business_card'
    ? <Camera size={11} />
    : <Monitor size={11} />

  const initials = `${lead.firstName?.[0] ?? ''}${lead.lastName?.[0] ?? ''}` || lead.company[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-4 rounded-2xl bg-surface-900 border border-surface-800 hover:border-surface-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {initials.toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-white text-sm">
              {lead.firstName} {lead.lastName}
            </p>
            <Badge variant="default" className="gap-1">
              {sourceIcon}
              {lead.source === 'business_card' ? 'Card' : 'Screen'}
            </Badge>
          </div>
          <p className="text-xs text-surface-400 mt-0.5 flex items-center gap-1">
            <Building2 size={10} />
            {lead.company}
            {lead.jobTitle && ` · ${lead.jobTitle}`}
          </p>

          <div className="flex gap-4 mt-2">
            {lead.phone && (
              <a
                href={`tel:${lead.phone}`}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Phone size={11} /> {lead.phone}
              </a>
            )}
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Mail size={11} /> {lead.email}
              </a>
            )}
          </div>
        </div>

        {/* Status */}
        <StatusBadge status={lead.status} />
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: Lead['status'] }) {
  const map: Record<Lead['status'], { label: string; variant: 'default' | 'success' | 'warning' | 'info' | 'danger' | 'brand' }> = {
    new:         { label: 'New',         variant: 'brand' },
    contacted:   { label: 'Contacted',   variant: 'info' },
    qualified:   { label: 'Qualified',   variant: 'success' },
    unqualified: { label: 'Unqualified', variant: 'danger' },
    converted:   { label: 'Converted',   variant: 'success' },
  }
  const { label, variant } = map[status]
  return <Badge variant={variant}>{label}</Badge>
}
