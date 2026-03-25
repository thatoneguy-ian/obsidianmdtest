import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Camera, Monitor, Clock, ArrowRight, Zap } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui'
import { cn } from '@/components/ui/utils'

export function Home() {
  const navigate = useNavigate()
  const recentLeads = useAppStore((s) => s.recentLeads)

  return (
    <div className="flex flex-col min-h-full px-5 pt-12 pb-6 gap-8 animate-fade-up">
      {/* Hero */}
      <div>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mb-4 shadow-glow">
          <Zap size={22} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Business Card<br />Capture</h1>
        <p className="text-surface-400 mt-2 text-sm leading-relaxed">
          Scan a card or screenshot a listing to instantly create a lead in Dataverse.
        </p>
      </div>

      {/* Primary actions */}
      <div className="grid grid-cols-1 gap-3">
        <PrimaryAction
          icon={<Camera size={24} />}
          title="Scan Business Card"
          description="Point your camera at a card — AI extracts the contact details"
          gradient="from-brand-600/20 to-brand-900/10"
          border="border-brand-600/30"
          iconBg="bg-brand-600"
          delay={0}
          onClick={() => navigate('/scan/camera')}
        />
        <PrimaryAction
          icon={<Monitor size={24} />}
          title="Smart Screen Scan"
          description="Screenshot business info from Google, Yelp, or any webpage"
          gradient="from-violet-600/20 to-violet-900/10"
          border="border-violet-600/30"
          iconBg="bg-violet-600"
          delay={0.06}
          onClick={() => navigate('/scan/desktop')}
        />
      </div>

      {/* Recent leads */}
      {recentLeads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-surface-400">
              <Clock size={14} />
              <span className="text-xs font-semibold uppercase tracking-wider">Recent</span>
            </div>
            <button
              onClick={() => navigate('/recent')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentLeads.slice(0, 3).map((lead, i) => (
              <motion.div
                key={lead.id ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-900 border border-surface-800"
              >
                <div className="h-9 w-9 rounded-full bg-brand-600/20 border border-brand-600/30 flex items-center justify-center text-brand-400 font-semibold text-sm flex-shrink-0">
                  {lead.firstName?.[0]}{lead.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {lead.firstName} {lead.lastName}
                  </p>
                  <p className="text-xs text-surface-400 truncate">{lead.company}</p>
                </div>
                <ArrowRight size={14} className="text-surface-600 flex-shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mt-auto">
        {[
          { label: 'Captured', value: recentLeads.length },
          { label: 'This Week', value: recentLeads.filter(l => {
            const d = new Date(l.createdAt ?? 0)
            const week = Date.now() - 7 * 24 * 60 * 60 * 1000
            return d.getTime() > week
          }).length },
          { label: 'Converted', value: recentLeads.filter(l => l.status === 'converted').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-surface-900 border border-surface-800 p-3 text-center">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Primary Action Card ──────────────────────────────────────────────────────

function PrimaryAction({
  icon, title, description, gradient, border, iconBg, delay, onClick,
}: {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  border: string
  iconBg: string
  delay: number
  onClick: () => void
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full text-left p-5 rounded-2xl border overflow-hidden',
        `bg-gradient-to-br ${gradient}`,
        border
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('h-12 w-12 rounded-xl flex items-center justify-center text-white flex-shrink-0', iconBg)}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-white">{title}</p>
          <p className="text-sm text-surface-400 mt-1 leading-snug">{description}</p>
        </div>
        <ArrowRight size={18} className="text-surface-500 mt-1 flex-shrink-0" />
      </div>
    </motion.button>
  )
}
