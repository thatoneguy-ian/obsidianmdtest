import { motion } from 'framer-motion'
import { User, Database, Cpu, ExternalLink, ChevronRight, Shield } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { Badge } from '@/components/ui'

const ENV = import.meta.env.VITE_USE_MOCK_CONNECTORS !== 'false' ? 'Development (Mock)' : 'Production'

export function Profile() {
  const recentLeads = useAppStore((s) => s.recentLeads)

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-10 safe-top">
      <div>
        <h1 className="font-semibold text-white text-lg">Settings</h1>
        <p className="text-xs text-surface-500 mt-0.5">App configuration and environment</p>
      </div>

      {/* Environment card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-surface-900 border border-surface-800 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-surface-800">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Environment</p>
        </div>

        <SettingRow
          icon={<Cpu size={16} className="text-brand-400" />}
          label="Runtime"
          value={ENV}
          badge={ENV.includes('Mock') ? 'dev' : 'prod'}
        />
        <SettingRow
          icon={<Database size={16} className="text-emerald-400" />}
          label="Dataverse"
          value={ENV.includes('Mock') ? 'In-memory store' : 'Connected'}
        />
        <SettingRow
          icon={<Cpu size={16} className="text-violet-400" />}
          label="AI Builder"
          value={ENV.includes('Mock') ? 'Mock responses' : 'Live connector'}
        />
        <SettingRow
          icon={<Shield size={16} className="text-sky-400" />}
          label="Auth"
          value="Power Platform SSO"
        />
      </motion.div>

      {/* Session stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="rounded-2xl bg-surface-900 border border-surface-800 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-surface-800">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Session</p>
        </div>
        <SettingRow
          icon={<User size={16} className="text-surface-400" />}
          label="Leads captured"
          value={String(recentLeads.length)}
        />
        <SettingRow
          icon={<Database size={16} className="text-surface-400" />}
          label="Source"
          value="Business Card Capture v1.0"
        />
      </motion.div>

      {/* Links */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl bg-surface-900 border border-surface-800 overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-surface-800">
          <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Resources</p>
        </div>
        {[
          { label: 'Power Apps Code Apps Docs', href: 'https://learn.microsoft.com/en-us/power-apps/developer/code-apps/' },
          { label: 'AI Builder Business Card Reader', href: 'https://learn.microsoft.com/en-us/ai-builder/prebuilt-business-card' },
          { label: 'Dataverse Lead Entity', href: 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/reference/entities/lead' },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-800 last:border-0 hover:bg-surface-800 transition-colors"
          >
            <ExternalLink size={15} className="text-surface-500" />
            <span className="text-sm text-surface-300 flex-1">{label}</span>
            <ChevronRight size={14} className="text-surface-600" />
          </a>
        ))}
      </motion.div>
    </div>
  )
}

function SettingRow({
  icon, label, value, badge,
}: {
  icon: React.ReactNode
  label: string
  value: string
  badge?: 'dev' | 'prod'
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-800 last:border-0">
      {icon}
      <span className="text-sm text-surface-300 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <Badge variant={badge === 'prod' ? 'success' : 'warning'}>
            {badge === 'prod' ? 'Live' : 'Mock'}
          </Badge>
        )}
        <span className="text-sm text-surface-500">{value}</span>
      </div>
    </div>
  )
}
