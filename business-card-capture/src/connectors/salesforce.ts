/**
 * Salesforce Connector
 *
 * Uses the first-party Power Platform Salesforce connector (shared_salesforce).
 * Connector reference: https://learn.microsoft.com/en-us/connectors/salesforce/
 *
 * Setup (one-time, per environment):
 *   1. Create a Salesforce connection in the Power Apps maker portal
 *   2. Run: pac connection list
 *      — copy the connectionId for shared_salesforce
 *   3. Run: pac code add-data-source -a shared_salesforce -c <connectionId>
 *      — generates /generated/services/SalesforceModel.ts + SalesforceService.ts
 *
 * Supported objects (this file uses):
 *   Lead     — maps from our internal Lead type
 *   Contact  — created on SFDC lead conversion (not handled here)
 *
 * Feature flag: set VITE_SYNC_TO_SALESFORCE=true in .env.development /
 * .env.production to enable. Salesforce sync is non-blocking — a Dataverse
 * save will succeed even if the SFDC push fails.
 */

import type { Lead, Activity, ConnectorResult } from '@/types'

export const SFDC_ENABLED =
  import.meta.env.VITE_SYNC_TO_SALESFORCE === 'true' &&
  import.meta.env.VITE_USE_MOCK_CONNECTORS !== 'true'

// ─── In-Memory Mock (dev / SFDC disabled) ────────────────────────────────────

const _mockLeads: Array<{ id: string; fields: Record<string, unknown> }> = []

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Lead Operations ──────────────────────────────────────────────────────────

/**
 * Push a Lead record to Salesforce.
 *
 * Production connector action: Create Record (Lead object)
 * Required SFDC fields: LastName, Company, Status
 *
 * SFDC Lead field reference:
 *   https://developer.salesforce.com/docs/atlas.en-us.object_reference.meta/object_reference/sforce_api_objects_lead.htm
 */
export async function createSalesforceLeadRecord(
  lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ConnectorResult<{ id: string }>> {
  if (!SFDC_ENABLED) {
    // Mock path — simulate success for dev/test
    await sleep(400)
    const id = crypto.randomUUID()
    _mockLeads.push({ id, fields: mapLeadToSfdc(lead) })
    return { success: true, data: { id }, statusCode: 201 }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Salesforce
    if (!connector) throw new Error('Salesforce connector not available')

    // Uses the Power Platform connector "Create Record" action
    const result = await connector.invoke('PostItem', {
      table: 'Lead',
      item: mapLeadToSfdc(lead),
    })

    return { success: true, data: { id: result.Id }, statusCode: 201 }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Salesforce create failed',
    }
  }
}

/**
 * Update an existing Salesforce Lead by SFDC ID.
 *
 * Production connector action: Update Record (Lead object)
 */
export async function updateSalesforceLeadRecord(
  sfdcId: string,
  updates: Partial<Lead>
): Promise<ConnectorResult<void>> {
  if (!SFDC_ENABLED) {
    await sleep(300)
    const idx = _mockLeads.findIndex((l) => l.id === sfdcId)
    if (idx === -1) return { success: false, error: 'Lead not found in mock', statusCode: 404 }
    _mockLeads[idx].fields = { ..._mockLeads[idx].fields, ...mapLeadToSfdc(updates) }
    return { success: true }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Salesforce
    if (!connector) throw new Error('Salesforce connector not available')

    await connector.invoke('PatchItem', {
      table: 'Lead',
      id: sfdcId,
      item: mapLeadToSfdc(updates),
    })

    return { success: true }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Salesforce update failed',
    }
  }
}

/**
 * Log a Salesforce Task against a Lead (mirrors Dataverse activity logging).
 *
 * Production connector action: Create Record (Task object)
 * Required SFDC fields: Subject, WhoId (Lead ID), Status
 */
export async function createSalesforceTask(
  activity: Omit<Activity, 'id' | 'createdAt'>,
  sfdcLeadId: string
): Promise<ConnectorResult<{ id: string }>> {
  if (!SFDC_ENABLED) {
    await sleep(300)
    return { success: true, data: { id: crypto.randomUUID() }, statusCode: 201 }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connector = (window as any).PowerApps?.Connectors?.Salesforce
    if (!connector) throw new Error('Salesforce connector not available')

    const result = await connector.invoke('PostItem', {
      table: 'Task',
      item: {
        Subject: activity.subject,
        Description: activity.notes,
        WhoId: sfdcLeadId,
        Status: 'Completed',
        Type: mapActivityTypeToSfdc(activity.type),
        ActivityDate: activity.scheduledAt
          ? activity.scheduledAt.split('T')[0]
          : new Date().toISOString().split('T')[0],
      },
    })

    return { success: true, data: { id: result.Id }, statusCode: 201 }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Salesforce task creation failed',
    }
  }
}

// ─── Field Mapping ────────────────────────────────────────────────────────────

/**
 * Maps our internal Lead type to Salesforce Lead API fields.
 *
 * Required by SFDC: LastName, Company, Status
 * LeadSource picklist values: 'Web', 'Phone Inquiry', 'Partner Referral',
 *   'Purchased List', 'Other', 'Word of mouth', 'Internal'
 */
export function mapLeadToSfdc(lead: Partial<Lead>): Record<string, unknown> {
  return {
    ...(lead.firstName  !== undefined && { FirstName:   lead.firstName }),
    ...(lead.lastName   !== undefined && { LastName:    lead.lastName }),
    ...(lead.company    !== undefined && { Company:     lead.company }),
    ...(lead.jobTitle   !== undefined && { Title:       lead.jobTitle }),
    ...(lead.phone      !== undefined && { Phone:       lead.phone }),
    ...(lead.mobilePhone !== undefined && { MobilePhone: lead.mobilePhone }),
    ...(lead.email      !== undefined && { Email:       lead.email }),
    ...(lead.website    !== undefined && { Website:     lead.website }),
    ...(lead.address1   !== undefined && { Street:      lead.address1 }),
    ...(lead.city       !== undefined && { City:        lead.city }),
    ...(lead.state      !== undefined && { State:       lead.state }),
    ...(lead.zip        !== undefined && { PostalCode:  lead.zip }),
    ...(lead.country    !== undefined && { Country:     lead.country }),
    ...(lead.notes      !== undefined && { Description: lead.notes }),
    LeadSource: mapLeadSource(lead.source),
    Status: 'Open - Not Contacted',
  }
}

function mapLeadSource(source: string | undefined): string {
  const map: Record<string, string> = {
    business_card: 'Other',          // SFDC has no Business Card picklist value by default
    screen_capture: 'Web',
    manual: 'Other',
    web: 'Web',
    referral: 'Word of mouth',
  }
  return map[source ?? 'manual'] ?? 'Other'
}

function mapActivityTypeToSfdc(type: string): string {
  const map: Record<string, string> = {
    call: 'Call',
    email: 'Email',
    meeting: 'Meeting',
    doorknock: 'Other',
    note: 'Other',
  }
  return map[type] ?? 'Other'
}
