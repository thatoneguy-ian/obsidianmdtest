/**
 * Dataverse Connector
 *
 * Production: Uses the Power Platform Dataverse connector SDK.
 * Development: In-memory store that mirrors Dataverse table structure.
 *
 * Tables targeted:
 *   leads         → crm_lead (standard Lead entity)
 *   contacts      → crm_contact (standard Contact entity)
 *   activities    → activitypointer (standard Activity entity)
 *   accounts      → account (standard Account entity)
 */

import type { Lead, Activity, ConnectorResult } from '@/types'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_CONNECTORS !== 'false'

// ─── In-Memory Store (dev only) ───────────────────────────────────────────────

const _leads: Lead[] = []
const _activities: Activity[] = []

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function generateId(): string {
  return crypto.randomUUID()
}

// ─── Lead Operations ──────────────────────────────────────────────────────────

/**
 * Create a new Lead record.
 * Production: POST /api/data/v9.2/leads
 */
export async function createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConnectorResult<Lead>> {
  if (USE_MOCK) {
    await sleep(600)
    const now = new Date().toISOString()
    const created: Lead = {
      ...lead,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    }
    _leads.push(created)
    return { success: true, data: created, statusCode: 201 }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Dataverse
    if (!connector) throw new Error('Dataverse connector not available')

    const result = await connector.invoke('createRecord', {
      entityName: 'lead',
      record: mapLeadToDataverse(lead),
    })

    return { success: true, data: mapDataverseToLead(result), statusCode: 201 }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to create lead',
    }
  }
}

/**
 * Update an existing Lead record.
 * Production: PATCH /api/data/v9.2/leads({id})
 */
export async function updateLead(id: string, updates: Partial<Lead>): Promise<ConnectorResult<Lead>> {
  if (USE_MOCK) {
    await sleep(400)
    const idx = _leads.findIndex((l) => l.id === id)
    if (idx === -1) return { success: false, error: 'Lead not found', statusCode: 404 }
    _leads[idx] = { ..._leads[idx], ...updates, updatedAt: new Date().toISOString() }
    return { success: true, data: _leads[idx] }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Dataverse
    const result = await connector.invoke('updateRecord', {
      entityName: 'lead',
      recordId: id,
      record: mapLeadToDataverse(updates),
    })
    return { success: true, data: mapDataverseToLead(result) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Update failed' }
  }
}

/**
 * Search for duplicate Leads by email or phone.
 * Production: GET /api/data/v9.2/leads?$filter=emailaddress1 eq '{email}'
 */
export async function findDuplicateLeads(email: string, phone: string): Promise<ConnectorResult<Lead[]>> {
  if (USE_MOCK) {
    await sleep(300)
    const dupes = _leads.filter(
      (l) =>
        (email && l.email.toLowerCase() === email.toLowerCase()) ||
        (phone && l.phone === phone)
    )
    return { success: true, data: dupes }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Dataverse
    const result = await connector.invoke('queryRecords', {
      entityName: 'lead',
      filter: `emailaddress1 eq '${email}' or telephone1 eq '${phone}'`,
    })
    return { success: true, data: result.value.map(mapDataverseToLead) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Duplicate check failed' }
  }
}

/**
 * List recent Leads.
 * Production: GET /api/data/v9.2/leads?$top=20&$orderby=createdon desc
 */
export async function listRecentLeads(top = 20): Promise<ConnectorResult<Lead[]>> {
  if (USE_MOCK) {
    await sleep(300)
    return { success: true, data: [..._leads].reverse().slice(0, top) }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Dataverse
    const result = await connector.invoke('queryRecords', {
      entityName: 'lead',
      top,
      orderBy: 'createdon desc',
    })
    return { success: true, data: result.value.map(mapDataverseToLead) }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'List failed' }
  }
}

// ─── Activity Operations ──────────────────────────────────────────────────────

/**
 * Log an activity (call, email, meeting, etc.) against a Lead.
 * Production: POST /api/data/v9.2/phonecalls  (or tasks, emails, etc.)
 */
export async function createActivity(
  activity: Omit<Activity, 'id' | 'createdAt'>
): Promise<ConnectorResult<Activity>> {
  if (USE_MOCK) {
    await sleep(500)
    const created: Activity = {
      ...activity,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    _activities.push(created)
    return { success: true, data: created, statusCode: 201 }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Dataverse
    const entityName = mapActivityTypeToEntity(activity.type)
    const result = await connector.invoke('createRecord', {
      entityName,
      record: {
        subject: activity.subject,
        description: activity.notes,
        scheduledstart: activity.scheduledAt,
        'regardingobjectid_lead@odata.bind': `/leads(${activity.leadId})`,
      },
    })
    return { success: true, data: { ...activity, id: result.activityid } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Activity creation failed' }
  }
}

// ─── Field Mapping ────────────────────────────────────────────────────────────

function mapLeadToDataverse(lead: Partial<Lead>): Record<string, unknown> {
  return {
    firstname: lead.firstName,
    lastname: lead.lastName,
    companyname: lead.company,
    jobtitle: lead.jobTitle,
    telephone1: lead.phone,
    mobilephone: lead.mobilePhone,
    emailaddress1: lead.email,
    websiteurl: lead.website,
    address1_line1: lead.address1,
    address1_city: lead.city,
    address1_stateorprovince: lead.state,
    address1_postalcode: lead.zip,
    address1_country: lead.country,
    leadsourcecode: mapSourceCode(lead.source),
    description: lead.notes,
  }
}

function mapDataverseToLead(r: Record<string, unknown>): Lead {
  return {
    id: r.leadid as string,
    firstName: r.firstname as string ?? '',
    lastName: r.lastname as string ?? '',
    company: r.companyname as string ?? '',
    jobTitle: r.jobtitle as string ?? '',
    phone: r.telephone1 as string ?? '',
    mobilePhone: r.mobilephone as string ?? '',
    email: r.emailaddress1 as string ?? '',
    website: r.websiteurl as string ?? '',
    address1: r.address1_line1 as string ?? '',
    city: r.address1_city as string ?? '',
    state: r.address1_stateorprovince as string ?? '',
    zip: r.address1_postalcode as string ?? '',
    country: r.address1_country as string ?? '',
    source: 'business_card',
    status: 'new',
    notes: r.description as string ?? '',
    createdAt: r.createdon as string,
    updatedAt: r.modifiedon as string,
  }
}

function mapSourceCode(source: string | undefined): number {
  const codes: Record<string, number> = {
    business_card: 8,
    screen_capture: 10,
    manual: 1,
    web: 10,
    referral: 3,
  }
  return codes[source ?? 'manual'] ?? 1
}

function mapActivityTypeToEntity(type: string): string {
  const map: Record<string, string> = {
    call: 'phonecall',
    email: 'email',
    meeting: 'appointment',
    doorknock: 'task',
    note: 'annotation',
  }
  return map[type] ?? 'task'
}
