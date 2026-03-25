import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  User, Building2, Phone, Mail, Globe, MapPin,
  Briefcase, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { Button, Input, Badge, Spinner } from '@/components/ui'
import { findDuplicateLeads } from '@/connectors/dataverse'
import { cn } from '@/components/ui/utils'
import type { Lead, BusinessCardData } from '@/types'

interface LeadFormProps {
  extractedData?: Partial<BusinessCardData>
  initialValues?: Partial<Lead>
  onSave: (values: Partial<Lead>) => void
  onBack: () => void
  isSaving?: boolean
  capturedImage?: string
}

export function LeadForm({ extractedData, initialValues, onSave, onBack, isSaving, capturedImage }: LeadFormProps) {
  const [form, setForm] = useState<Partial<Lead>>({
    firstName: '',
    lastName: '',
    company: '',
    jobTitle: '',
    phone: '',
    mobilePhone: '',
    email: '',
    website: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    notes: '',
    ...initialValues,
  })

  const [duplicates, setDuplicates] = useState<Lead[]>([])
  const [checkingDupes, setCheckingDupes] = useState(false)
  const [dupeChecked, setDupeChecked] = useState(false)

  // Pre-fill from extracted data
  useEffect(() => {
    if (extractedData) {
      setForm((prev) => ({
        ...prev,
        firstName: extractedData.firstName || prev.firstName,
        lastName: extractedData.lastName || prev.lastName,
        company: extractedData.company || prev.company,
        jobTitle: extractedData.jobTitle || prev.jobTitle,
        phone: extractedData.phone || extractedData.mobilePhone || prev.phone,
        mobilePhone: extractedData.mobilePhone || prev.mobilePhone,
        email: extractedData.email || prev.email,
        website: extractedData.website || prev.website,
        address1: extractedData.address || prev.address1,
        city: extractedData.city || prev.city,
        state: extractedData.state || prev.state,
        zip: extractedData.zip || prev.zip,
        country: extractedData.country || prev.country,
      }))
    }
  }, [extractedData])

  // Duplicate check on blur of email/phone
  async function checkDuplicates() {
    if (!form.email && !form.phone) return
    setCheckingDupes(true)
    const result = await findDuplicateLeads(form.email ?? '', form.phone ?? '')
    setDuplicates(result.data ?? [])
    setDupeChecked(true)
    setCheckingDupes(false)
  }

  function set(field: keyof Lead) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave(form)
  }

  const confidence = extractedData?.confidence

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-surface-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-lg">Review Contact</h2>
            <p className="text-xs text-surface-400 mt-0.5">Confirm the extracted details</p>
          </div>
          {confidence !== undefined && (
            <ConfidenceBadge confidence={confidence} />
          )}
        </div>

        {/* Captured image thumbnail */}
        {capturedImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-surface-700 aspect-video max-h-28">
            <img src={capturedImage} alt="Captured card" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Duplicate warning */}
      {dupeChecked && duplicates.length > 0 && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-300">Possible duplicate</p>
            <p className="text-xs text-amber-400/80 mt-0.5">
              {duplicates[0].firstName} {duplicates[0].lastName} at {duplicates[0].company} already exists.
            </p>
          </div>
        </div>
      )}

      {dupeChecked && duplicates.length === 0 && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-sm text-emerald-300">No duplicates found</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* Name section */}
        <section>
          <SectionLabel icon={<User size={13} />} label="Name" />
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Input
              label="First name"
              value={form.firstName ?? ''}
              onChange={set('firstName')}
              autoCapitalize="words"
            />
            <Input
              label="Last name"
              value={form.lastName ?? ''}
              onChange={set('lastName')}
              autoCapitalize="words"
            />
          </div>
          <div className="mt-3">
            <Input
              label="Job title"
              icon={<Briefcase size={14} />}
              value={form.jobTitle ?? ''}
              onChange={set('jobTitle')}
            />
          </div>
        </section>

        {/* Company */}
        <section>
          <SectionLabel icon={<Building2 size={13} />} label="Company" />
          <div className="mt-2">
            <Input
              label="Company name"
              value={form.company ?? ''}
              onChange={set('company')}
              autoCapitalize="words"
            />
          </div>
        </section>

        {/* Contact info */}
        <section>
          <SectionLabel icon={<Phone size={13} />} label="Contact" />
          <div className="mt-2 space-y-3">
            <Input
              label="Phone"
              value={form.phone ?? ''}
              onChange={set('phone')}
              onBlur={checkDuplicates}
              type="tel"
              icon={<Phone size={14} />}
            />
            <Input
              label="Mobile"
              value={form.mobilePhone ?? ''}
              onChange={set('mobilePhone')}
              type="tel"
              icon={<Phone size={14} />}
            />
            <div className="relative">
              <Input
                label="Email"
                value={form.email ?? ''}
                onChange={set('email')}
                onBlur={checkDuplicates}
                type="email"
                icon={<Mail size={14} />}
              />
              {checkingDupes && (
                <div className="absolute right-3 top-1/2 translate-y-1 mt-1">
                  <Spinner size="sm" />
                </div>
              )}
            </div>
            <Input
              label="Website"
              value={form.website ?? ''}
              onChange={set('website')}
              type="url"
              icon={<Globe size={14} />}
            />
          </div>
        </section>

        {/* Address */}
        <section>
          <SectionLabel icon={<MapPin size={13} />} label="Address" />
          <div className="mt-2 space-y-3">
            <Input
              label="Street"
              value={form.address1 ?? ''}
              onChange={set('address1')}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city ?? ''} onChange={set('city')} />
              <Input label="State" value={form.state ?? ''} onChange={set('state')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="ZIP" value={form.zip ?? ''} onChange={set('zip')} />
              <Input label="Country" value={form.country ?? ''} onChange={set('country')} />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section>
          <SectionLabel icon={<Mail size={13} />} label="Notes" />
          <textarea
            className={cn(
              'mt-2 w-full rounded-xl bg-surface-900 border border-surface-700 px-3 py-2.5 text-sm text-white placeholder:text-surface-500',
              'focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30',
              'hover:border-surface-500 transition-all duration-150 resize-none'
            )}
            rows={3}
            placeholder="Add meeting notes…"
            value={form.notes ?? ''}
            onChange={set('notes')}
          />
        </section>

        {/* Bottom spacer */}
        <div className="h-4" />
      </form>

      {/* Action bar */}
      <div className="px-5 pb-5 pt-3 border-t border-surface-800 grid grid-cols-2 gap-3 safe-bottom">
        <Button variant="secondary" onClick={onBack} disabled={isSaving}>
          Back
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          isLoading={isSaving}
          disabled={!form.company && !form.lastName}
        >
          Save Lead
        </Button>
      </div>
    </motion.div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-surface-400">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
    </div>
  )
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const variant = pct >= 85 ? 'success' : pct >= 65 ? 'warning' : 'danger'
  return <Badge variant={variant}>{pct}% confidence</Badge>
}
