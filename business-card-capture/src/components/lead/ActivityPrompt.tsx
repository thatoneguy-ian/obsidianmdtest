import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Phone, DoorOpen, Mail, CalendarDays, FileText,
  CheckCircle2, ArrowRight,
} from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { cn } from '@/components/ui/utils'
import type { ActivityType, Activity, Lead } from '@/types'

interface ActivityPromptProps {
  lead: Partial<Lead>
  onLog: (activity: Omit<Activity, 'id' | 'createdAt'>) => void
  onSkip: () => void
  isLogging?: boolean
}

interface ActivityOption {
  type: ActivityType
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

const options: ActivityOption[] = [
  {
    type: 'call',
    label: 'Log a Call',
    description: 'Record a phone conversation',
    icon: <Phone size={22} />,
    color: 'from-brand-500 to-brand-700',
  },
  {
    type: 'doorknock',
    label: 'Door Knock',
    description: 'Log an in-person visit',
    icon: <DoorOpen size={22} />,
    color: 'from-brand-700 to-brand-900',
  },
  {
    type: 'email',
    label: 'Send Email',
    description: 'Follow up via email',
    icon: <Mail size={22} />,
    color: 'from-surface-600 to-surface-800',
  },
  {
    type: 'meeting',
    label: 'Meeting Note',
    description: 'Record meeting details',
    icon: <CalendarDays size={22} />,
    color: 'from-surface-500 to-surface-700',
  },
  {
    type: 'note',
    label: 'Add Note',
    description: 'Add a general note',
    icon: <FileText size={22} />,
    color: 'from-surface-700 to-surface-900',
  },
]

export function ActivityPrompt({ lead, onLog, onSkip, isLogging }: ActivityPromptProps) {
  const [selected, setSelected] = useState<ActivityType | null>(null)
  const [notes, setNotes] = useState('')
  const [subject, setSubject] = useState('')

  const selectedOption = options.find((o) => o.type === selected)

  function handleLog() {
    if (!selected || !lead.id) return
    onLog({
      leadId: lead.id,
      type: selected,
      subject: subject || `${selectedOption?.label} — ${lead.company}`,
      notes,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Success header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Lead Saved!</h2>
            <p className="text-xs text-surface-400">
              {lead.firstName} {lead.lastName} · {lead.company}
            </p>
          </div>
        </div>
        <p className="text-sm text-surface-300 mt-4 font-medium">What would you like to do next?</p>
      </div>

      {/* Activity grid */}
      <div className="px-5 grid grid-cols-2 gap-3 flex-1 overflow-y-auto pb-4">
        {options.map((opt) => (
          <ActivityCard
            key={opt.type}
            option={opt}
            selected={selected === opt.type}
            onSelect={() => setSelected(opt.type)}
          />
        ))}
      </div>

      {/* Notes input when type selected */}
      {selected && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="px-5 space-y-3 border-t border-surface-800 pt-4"
        >
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={`${selectedOption?.label} — ${lead.company ?? ''}`}
          />
          <div>
            <label className="text-xs font-medium text-surface-400 uppercase tracking-wide block mb-1.5">
              Notes
            </label>
            <textarea
              className={cn(
                'w-full rounded-xl bg-surface-900 border border-surface-700 px-3 py-2.5 text-sm text-white placeholder:text-surface-500',
                'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
                'hover:border-surface-500 transition-all duration-150 resize-none'
              )}
              rows={3}
              placeholder="Add details about this interaction…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="px-5 pb-6 pt-3 grid grid-cols-2 gap-3 safe-bottom">
        <Button variant="ghost" onClick={onSkip} disabled={isLogging}>
          Skip for now
        </Button>
        <Button
          onClick={handleLog}
          isLoading={isLogging}
          disabled={!selected}
          className="gap-2"
        >
          Log Activity
          <ArrowRight size={16} />
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Activity Card ────────────────────────────────────────────────────────────

function ActivityCard({
  option,
  selected,
  onSelect,
}: {
  option: ActivityOption
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative p-4 rounded-2xl border text-left transition-all duration-200',
        'flex flex-col gap-2',
        selected
          ? 'border-brand-500 bg-brand-600/15 ring-1 ring-brand-500/40'
          : 'border-surface-700 bg-surface-900 hover:border-surface-600 hover:bg-surface-800',
      )}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
          option.color
        )}
      >
        {option.icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-white leading-tight">{option.label}</p>
        <p className="text-xs text-surface-400 mt-0.5 leading-snug">{option.description}</p>
      </div>
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-500 flex items-center justify-center"
        >
          <CheckCircle2 size={12} className="text-white" />
        </motion.div>
      )}
    </motion.button>
  )
}
