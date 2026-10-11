import {
  System,
  DataAsset,
  DataFlow,
  PrivacyRequest,
  PrivacyRequestAction,
  AuditLog,
  Profile,
  Organization,
  ConsentRecord,
  DataSourceSummary,
  SubjectBlastRadius,
  DashboardMetrics,
  Role,
  RequestType,
  RequestStatus,
  TimelineStep
} from '@/types'
import { ConnectorFactory } from '../integrations/connector.factory'
import { PrivacyRequestStateMachine } from '../privacy/state-machine'

// Single Source of Truth Privacy Operations In-Memory Store
// Provides reliable, zero-config operational execution with full mock-connector support
// while maintaining identical data models to Supabase schema.

class PrivacyStore {
  private organization: Organization = {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Acme Technologies',
    slug: 'acme-technologies',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  }

  private currentRole: Role = 'OWNER'

  private profiles: Profile[] = [
    {
      id: 'prof-1',
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'usr-owner',
      name: 'Param Sharma',
      email: 'owner@acme.com',
      role: 'OWNER',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'prof-2',
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'usr-admin',
      name: 'Aditi Rao',
      email: 'admin@acme.com',
      role: 'ADMIN',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'prof-3',
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'usr-dpo',
      name: 'Ananya Iyer',
      email: 'privacy@acme.com',
      role: 'PRIVACY_OFFICER',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'prof-4',
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'usr-dev',
      name: 'Vikram Malhotra',
      email: 'developer@acme.com',
      role: 'SECURITY_OFFICER', // Developer / Technical security role
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'prof-5',
      organization_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'usr-viewer',
      name: 'Arjun Verma',
      email: 'viewer@acme.com',
      role: 'EMPLOYEE',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ]

  private systems: System[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Website Gateway',
      type: 'WEB',
      description: 'Customer onboarding portal and consent collection gateway',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Customer Database',
      type: 'DATABASE',
      description: 'Primary PostgreSQL production database for user identities',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'CRM (Salesforce/HubSpot)',
      type: 'CRM',
      description: 'Sales and customer account relationship management',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Marketing Platform',
      type: 'MARKETING',
      description: 'Email newsletter campaigns and promotional audience lists',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Support Desk (Zendesk)',
      type: 'SUPPORT',
      description: 'Customer service tickets, complaints, and interaction logs',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Email Provider (SendGrid)',
      type: 'EMAIL',
      description: 'Transactional email dispatch, suppression and bounce lists',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      organization_id: '00000000-0000-0000-0000-000000000001',
      name: 'Analytics Warehouse (Snowflake)',
      type: 'ANALYTICS',
      description: 'Business intelligence and user activity event tracking',
      status: 'ACTIVE',
      connector_type: 'DEMO',
      last_synced_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      simulate_failure: false,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ]

  private dataAssets: DataAsset[] = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'customer_email',
      display_name: 'Customer Email',
      description: 'Primary electronic mail address used as subject identity token',
      classification: 'PERSONAL',
      sensitivity: 'MEDIUM',
      owner: 'Engineering',
      risk_level: 'MEDIUM',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'customer_name',
      display_name: 'Full Legal Name',
      description: 'First name and surname of the individual',
      classification: 'PERSONAL',
      sensitivity: 'LOW',
      owner: 'Engineering',
      risk_level: 'LOW',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'phone_number',
      display_name: 'Mobile Phone Number',
      description: 'E.164 formatted telephone number for SMS verification',
      classification: 'PERSONAL',
      sensitivity: 'MEDIUM',
      owner: 'Engineering',
      risk_level: 'MEDIUM',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'billing_address',
      display_name: 'Physical Billing Address',
      description: 'Street, city, postal code, and country for tax invoices',
      classification: 'PERSONAL',
      sensitivity: 'MEDIUM',
      owner: 'Finance',
      risk_level: 'MEDIUM',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000005',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'payment_reference',
      display_name: 'UPI / Card Token Reference',
      description: 'Tokenized transaction and payment method identifier',
      classification: 'FINANCIAL',
      sensitivity: 'HIGH',
      owner: 'Finance',
      risk_level: 'HIGH',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'marketing_consent',
      display_name: 'Marketing Consent Flag',
      description: 'Explicit opt-in status and timestamp for DPDP compliance',
      classification: 'PERSONAL',
      sensitivity: 'LOW',
      owner: 'Marketing',
      risk_level: 'LOW',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000005',
      name: 'support_ticket',
      display_name: 'Support Conversation History',
      description: 'Customer inquiries, dispute history, and resolution notes',
      classification: 'PERSONAL',
      sensitivity: 'MEDIUM',
      owner: 'Support',
      risk_level: 'MEDIUM',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: '00000000-0000-0000-0000-000000000008',
      organization_id: '00000000-0000-0000-0000-000000000001',
      system_id: '00000000-0000-0000-0000-000000000002',
      name: 'pan_tax_identifier',
      display_name: 'Permanent Account Number (PAN)',
      description: 'National tax identity number under Indian tax regulations',
      classification: 'SENSITIVE',
      sensitivity: 'CRITICAL',
      owner: 'Finance & Compliance',
      risk_level: 'CRITICAL',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ]

  private dataFlows: DataFlow[] = [
    {
      id: 'flow-1',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000001',
      destination_system_id: '00000000-0000-0000-0000-000000000002',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'PUSH',
      description: 'Website signup form pushes new account profiles into Customer DB',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'flow-2',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000002',
      destination_system_id: '00000000-0000-0000-0000-000000000003',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'SYNC',
      description: 'Customer DB synchronizes account details with CRM for sales alignment',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'flow-3',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000002',
      destination_system_id: '00000000-0000-0000-0000-000000000005',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'SYNC',
      description: 'Customer DB syncs email and phone into Support Desk for caller ID',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'flow-4',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000003',
      destination_system_id: '00000000-0000-0000-0000-000000000004',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'SYNC',
      description: 'CRM synchronizes consented contact lists to Marketing Platform',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'flow-5',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000004',
      destination_system_id: '00000000-0000-0000-0000-000000000006',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'PUSH',
      description: 'Marketing campaigns push email dispatch payloads to SendGrid',
      created_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'flow-6',
      organization_id: '00000000-0000-0000-0000-000000000001',
      source_system_id: '00000000-0000-0000-0000-000000000002',
      destination_system_id: '00000000-0000-0000-0000-000000000007',
      data_asset_id: '00000000-0000-0000-0000-000000000001',
      relationship_type: 'ASYNC',
      description: 'Customer DB streams anonymized telemetry into Snowflake Warehouse',
      created_at: '2024-01-15T00:00:00Z'
    }
  ]

  private privacyRequests: PrivacyRequest[] = [
    {
      id: 'PR-1042',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'customer@example.com',
      request_type: 'DELETE',
      status: 'COMPLETED',
      created_by: 'prof-3',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 115).toISOString()
    },
    {
      id: 'PR-1041',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'rahul@example.com',
      request_type: 'ACCESS',
      status: 'COMPLETED',
      created_by: 'prof-3',
      created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 238).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 238).toISOString()
    },
    {
      id: 'PR-1040',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'priya.nair@example.com',
      request_type: 'DELETE',
      status: 'PENDING',
      created_by: 'prof-1',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completed_at: null
    },
    {
      id: 'PR-1039',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'vikas.singh@example.com',
      request_type: 'CORRECT',
      status: 'COMPLETED',
      created_by: 'prof-3',
      created_at: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 395).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 395).toISOString()
    },
    {
      id: 'PR-1038',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'deepak.gupta@example.com',
      request_type: 'DELETE',
      status: 'FAILED',
      created_by: 'prof-1',
      created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 498).toISOString(),
      completed_at: null
    }
  ]

  private requestActions: PrivacyRequestAction[] = [
    // Pre-populate actions for PR-1042
    {
      id: 'act-1042-1',
      privacy_request_id: 'PR-1042',
      system_id: '00000000-0000-0000-0000-000000000002',
      action_type: 'DELETE',
      status: 'COMPLETED',
      attempt_count: 1,
      error_message: null,
      started_at: new Date(Date.now() - 1000 * 60 * 119).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 118).toISOString()
    },
    {
      id: 'act-1042-2',
      privacy_request_id: 'PR-1042',
      system_id: '00000000-0000-0000-0000-000000000003',
      action_type: 'DELETE',
      status: 'COMPLETED',
      attempt_count: 1,
      error_message: null,
      started_at: new Date(Date.now() - 1000 * 60 * 118).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 117).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 117).toISOString()
    },
    {
      id: 'act-1042-3',
      privacy_request_id: 'PR-1042',
      system_id: '00000000-0000-0000-0000-000000000004',
      action_type: 'DELETE',
      status: 'COMPLETED',
      attempt_count: 1,
      error_message: null,
      started_at: new Date(Date.now() - 1000 * 60 * 117).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 116).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 116).toISOString()
    },
    {
      id: 'act-1042-4',
      privacy_request_id: 'PR-1042',
      system_id: '00000000-0000-0000-0000-000000000007',
      action_type: 'DELETE',
      status: 'COMPLETED',
      attempt_count: 1,
      error_message: null,
      started_at: new Date(Date.now() - 1000 * 60 * 116).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 115).toISOString()
    },
    // Pre-populate failed action for PR-1038
    {
      id: 'act-1038-1',
      privacy_request_id: 'PR-1038',
      system_id: '00000000-0000-0000-0000-000000000003',
      action_type: 'DELETE',
      status: 'FAILED',
      attempt_count: 2,
      error_message: 'CRM API rate limit exceeded during subject deletion (HTTP 429)',
      started_at: new Date(Date.now() - 1000 * 60 * 499).toISOString(),
      completed_at: new Date(Date.now() - 1000 * 60 * 498).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 498).toISOString()
    }
  ]

  private consentRecords: ConsentRecord[] = [
    {
      id: 'c-1',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'customer@example.com',
      purpose: 'Marketing',
      status: 'GRANTED',
      source: 'Website Signup Form (Checkbox #2)',
      granted_at: '2024-02-10T14:30:00Z',
      updated_at: '2024-02-10T14:30:00Z',
      withdrawn_at: null
    },
    {
      id: 'c-2',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'customer@example.com',
      purpose: 'Analytics',
      status: 'GRANTED',
      source: 'Cookie Consent Banner (DPDP Notice #1)',
      granted_at: '2024-02-10T14:30:00Z',
      updated_at: '2024-02-10T14:30:00Z',
      withdrawn_at: null
    },
    {
      id: 'c-3',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'customer@example.com',
      purpose: 'Personalization',
      status: 'WITHDRAWN',
      source: 'User Profile Privacy Settings',
      granted_at: '2024-02-10T14:30:00Z',
      updated_at: '2024-03-01T09:15:00Z',
      withdrawn_at: '2024-03-01T09:15:00Z'
    },
    {
      id: 'c-4',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'rahul@example.com',
      purpose: 'Marketing',
      status: 'GRANTED',
      source: 'Onboarding Flow',
      granted_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-01-20T11:00:00Z',
      withdrawn_at: null
    },
    {
      id: 'c-5',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'rahul@example.com',
      purpose: 'Analytics',
      status: 'GRANTED',
      source: 'Cookie Banner',
      granted_at: '2024-01-20T11:00:00Z',
      updated_at: '2024-01-20T11:00:00Z',
      withdrawn_at: null
    },
    {
      id: 'c-6',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'alex@example.com',
      purpose: 'Marketing',
      status: 'WITHDRAWN',
      source: 'Email Unsubscribe Link',
      granted_at: '2024-01-10T08:00:00Z',
      updated_at: '2024-02-18T16:20:00Z',
      withdrawn_at: '2024-02-18T16:20:00Z'
    },
    {
      id: 'c-7',
      organization_id: '00000000-0000-0000-0000-000000000001',
      subject_identifier: 'priya.nair@example.com',
      purpose: 'Telemetry',
      status: 'GRANTED',
      source: 'Desktop App Agreement',
      granted_at: '2024-03-05T12:00:00Z',
      updated_at: '2024-03-05T12:00:00Z',
      withdrawn_at: null
    }
  ]

  private auditLogs: AuditLog[] = [
    {
      id: 'audit-001',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'VERIFICATION_COMPLETED',
      resource_type: 'privacy_request',
      resource_id: 'PR-1042',
      status: 'SUCCESS',
      metadata: {
        request_id: 'PR-1042',
        subject: 'customer@example.com',
        systems_verified: 4,
        audit_hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
      },
      created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString()
    },
    {
      id: 'audit-002',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'SYSTEM_ACTION_COMPLETED',
      resource_type: 'privacy_request_action',
      resource_id: 'act-1042-4',
      status: 'SUCCESS',
      metadata: { system: 'Analytics Warehouse (Snowflake)', action: 'DELETE', mode: 'anonymization' },
      created_at: new Date(Date.now() - 1000 * 60 * 116).toISOString()
    },
    {
      id: 'audit-003',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'SYSTEM_ACTION_COMPLETED',
      resource_type: 'privacy_request_action',
      resource_id: 'act-1042-3',
      status: 'SUCCESS',
      metadata: { system: 'Marketing Platform', action: 'DELETE' },
      created_at: new Date(Date.now() - 1000 * 60 * 117).toISOString()
    },
    {
      id: 'audit-004',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'SYSTEM_ACTION_COMPLETED',
      resource_type: 'privacy_request_action',
      resource_id: 'act-1042-2',
      status: 'SUCCESS',
      metadata: { system: 'CRM', action: 'DELETE' },
      created_at: new Date(Date.now() - 1000 * 60 * 118).toISOString()
    },
    {
      id: 'audit-005',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'SYSTEM_ACTION_COMPLETED',
      resource_type: 'privacy_request_action',
      resource_id: 'act-1042-1',
      status: 'SUCCESS',
      metadata: { system: 'Customer Database', action: 'DELETE' },
      created_at: new Date(Date.now() - 1000 * 60 * 119).toISOString()
    },
    {
      id: 'audit-006',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-3',
      event_type: 'PRIVACY_REQUEST_CREATED',
      resource_type: 'privacy_request',
      resource_id: 'PR-1042',
      status: 'SUCCESS',
      metadata: { subject: 'customer@example.com', type: 'DELETE', systems_mapped: 4 },
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
      id: 'audit-007',
      organization_id: '00000000-0000-0000-0000-000000000001',
      actor_id: 'prof-1',
      event_type: 'DATA_ASSET_DISCOVERED',
      resource_type: 'data_asset',
      resource_id: '00000000-0000-0000-0000-000000000008',
      status: 'SUCCESS',
      metadata: { asset: 'pan_tax_identifier', classification: 'SENSITIVE', sensitivity: 'CRITICAL' },
      created_at: new Date(Date.now() - 1000 * 60 * 350).toISOString()
    }
  ]

  // GETTERS
  getOrganization(): Organization {
    return this.organization
  }

  getCurrentRole(): Role {
    return this.currentRole
  }

  setCurrentRole(role: Role): void {
    this.currentRole = role
  }

  setOrganization(name: string, slug?: string): Organization {
    this.organization = {
      ...this.organization,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      updated_at: new Date().toISOString()
    }
    this.logAuditEvent(
      'prof-1',
      'SYSTEM_CREATED',
      'organization',
      this.organization.id,
      'SUCCESS',
      { name: this.organization.name, slug: this.organization.slug }
    )
    return this.organization
  }

  getProfiles(): Profile[] {
    return this.profiles
  }

  getSystems(): System[] {
    return this.systems
  }

  getSystem(id: string): System | undefined {
    return this.systems.find(s => s.id === id)
  }

  toggleSystemFailure(id: string): System | null {
    const sys = this.getSystem(id)
    if (!sys) return null
    sys.simulate_failure = !sys.simulate_failure
    sys.updated_at = new Date().toISOString()

    // Sync failure status with connector instance
    const connector = ConnectorFactory.createConnector(sys)
    if (connector && typeof (connector as any).setFailureSimulation === 'function') {
      ;(connector as any).setFailureSimulation(sys.simulate_failure)
    }

    this.logAuditEvent(
      'prof-1',
      'SYSTEM_ACTION_STARTED',
      'system',
      id,
      'SUCCESS',
      { system_name: sys.name, simulate_failure: sys.simulate_failure }
    )
    return sys
  }

  getDataAssets(): DataAsset[] {
    return this.dataAssets
  }

  getDataAsset(id: string): DataAsset | undefined {
    return this.dataAssets.find(a => a.id === id)
  }

  getDataFlows(): DataFlow[] {
    return this.dataFlows
  }

  getDataSourcesSummary(): DataSourceSummary[] {
    const countsMap: Record<string, { tables: number; records: number; personal: number; sensitive: number; financial: number; credential: number; public: number }> = {
      '00000000-0000-0000-0000-000000000001': { tables: 4, records: 850, personal: 2, sensitive: 0, financial: 0, credential: 1, public: 1 },
      '00000000-0000-0000-0000-000000000002': { tables: 12, records: 8420, personal: 5, sensitive: 2, financial: 1, credential: 1, public: 0 },
      '00000000-0000-0000-0000-000000000003': { tables: 6, records: 3201, personal: 3, sensitive: 0, financial: 0, credential: 0, public: 0 },
      '00000000-0000-0000-0000-000000000004': { tables: 4, records: 1892, personal: 2, sensitive: 0, financial: 0, credential: 0, public: 0 },
      '00000000-0000-0000-0000-000000000005': { tables: 5, records: 4120, personal: 3, sensitive: 1, financial: 0, credential: 0, public: 0 },
      '00000000-0000-0000-0000-000000000006': { tables: 2, records: 9500, personal: 1, sensitive: 0, financial: 0, credential: 0, public: 0 },
      '00000000-0000-0000-0000-000000000007': { tables: 9, records: 14203, personal: 2, sensitive: 0, financial: 1, credential: 0, public: 0 }
    }

    return this.systems.map(sys => {
      const metrics = countsMap[sys.id] || { tables: 3, records: 500, personal: 1, sensitive: 0, financial: 0, credential: 0, public: 0 }
      return {
        id: sys.id,
        name: sys.name,
        type: sys.type,
        description: sys.description,
        status: sys.status,
        connector_type: sys.connector_type,
        tables_count: metrics.tables,
        records_count: metrics.records,
        last_scanned_at: sys.last_synced_at,
        simulate_failure: sys.simulate_failure,
        classification_counts: {
          personal: metrics.personal,
          sensitive: metrics.sensitive,
          financial: metrics.financial,
          credential: metrics.credential,
          public: metrics.public
        }
      }
    })
  }

  getPrivacyRequests(): PrivacyRequest[] {
    return [...this.privacyRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  getPrivacyRequest(id: string): PrivacyRequest | undefined {
    return this.privacyRequests.find(r => r.id === id)
  }

  getRequestActions(requestId: string): PrivacyRequestAction[] {
    return this.requestActions.filter(a => a.privacy_request_id === requestId)
  }

  getConsentRecords(): ConsentRecord[] {
    return this.consentRecords
  }

  updateConsent(id: string, status: 'GRANTED' | 'WITHDRAWN'): ConsentRecord | null {
    const record = this.consentRecords.find(c => c.id === id)
    if (!record) return null
    record.status = status
    record.updated_at = new Date().toISOString()
    record.withdrawn_at = status === 'WITHDRAWN' ? new Date().toISOString() : null

    this.logAuditEvent(
      'prof-1',
      'USER_LOGIN',
      'consent_record',
      record.id,
      'SUCCESS',
      { subject: record.subject_identifier, purpose: record.purpose, status }
    )
    return record
  }

  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  logAuditEvent(
    actorId: string,
    eventType: AuditLog['event_type'],
    resourceType: string,
    resourceId: string,
    status: 'SUCCESS' | 'FAILURE',
    metadata: Record<string, unknown> = {}
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organization_id: this.organization.id,
      actor_id: actorId,
      event_type: eventType,
      resource_type: resourceType,
      resource_id: resourceId,
      status,
      metadata,
      created_at: new Date().toISOString()
    }
    this.auditLogs.unshift(log)
    return log
  }

  // BLAST RADIUS COMPUTATION
  calculateSubjectBlastRadius(subjectIdentifier: string): SubjectBlastRadius {
    // Determine systems containing this subject
    // Demo subjects: customer@example.com, rahul@example.com, etc.
    const normalized = (subjectIdentifier || 'customer@example.com').trim().toLowerCase()

    // Downstream flow path from Customer DB -> CRM -> Marketing -> Analytics + Email
    const targetSystemIds = [
      '00000000-0000-0000-0000-000000000002', // Customer DB
      '00000000-0000-0000-0000-000000000003', // CRM
      '00000000-0000-0000-0000-000000000004', // Marketing Platform
      '00000000-0000-0000-0000-000000000007'  // Analytics
    ]

    const affectedSystems = this.systems.filter(s => targetSystemIds.includes(s.id))
    const affectedAssets = this.dataAssets.filter(a => targetSystemIds.includes(a.system_id))

    return {
      subject_identifier: normalized,
      systems_affected: affectedSystems,
      pii_records_count: 7,
      deletion_actions_count: affectedSystems.length,
      verification_checks_count: affectedSystems.length,
      lineage_path: ['Customer DB', 'CRM', 'Marketing Platform', 'Analytics Warehouse'],
      affected_assets: affectedAssets,
      depth: 3
    }
  }

  // WORKFLOW EXECUTION: CREATE → PLAN → EXECUTE → VERIFY → AUDIT
  async createPrivacyRequest(
    subjectIdentifier: string,
    requestType: RequestType,
    autoExecute: boolean = true
  ): Promise<{ request: PrivacyRequest; actions: PrivacyRequestAction[]; executionSummary: string }> {
    const nextNum = 1043 + this.privacyRequests.length - 5
    const requestId = `PR-${nextNum}`

    const newRequest: PrivacyRequest = {
      id: requestId,
      organization_id: this.organization.id,
      subject_identifier: subjectIdentifier,
      request_type: requestType,
      status: 'PENDING',
      created_by: 'prof-3',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null
    }

    this.privacyRequests.unshift(newRequest)

    this.logAuditEvent(
      'prof-3',
      'PRIVACY_REQUEST_CREATED',
      'privacy_request',
      requestId,
      'SUCCESS',
      { subject_identifier: subjectIdentifier, request_type: requestType, auto_execute: autoExecute }
    )

    // Build Execution Plan across affected connectors
    const blast = this.calculateSubjectBlastRadius(subjectIdentifier)
    const createdActions: PrivacyRequestAction[] = []

    for (const sys of blast.systems_affected) {
      const action: PrivacyRequestAction = {
        id: `act-${requestId}-${sys.id.slice(-4)}`,
        privacy_request_id: requestId,
        system_id: sys.id,
        action_type: requestType,
        status: 'PENDING',
        attempt_count: 0,
        error_message: null,
        started_at: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      this.requestActions.push(action)
      createdActions.push(action)
    }

    if (autoExecute) {
      await this.executePrivacyRequest(requestId)
    }

    return {
      request: this.getPrivacyRequest(requestId)!,
      actions: this.getRequestActions(requestId),
      executionSummary: `Plan generated for ${blast.systems_affected.length} connected systems with ${blast.verification_checks_count} verification checks.`
    }
  }

  async executePrivacyRequest(requestId: string): Promise<PrivacyRequest> {
    const request = this.getPrivacyRequest(requestId)
    if (!request) throw new Error('Request not found')

    request.status = 'PROCESSING'
    request.updated_at = new Date().toISOString()

    this.logAuditEvent(
      'prof-3',
      'PRIVACY_REQUEST_STARTED',
      'privacy_request',
      requestId,
      'SUCCESS',
      { subject: request.subject_identifier }
    )

    const actions = this.getRequestActions(requestId)
    let hasFailure = false

    for (const action of actions) {
      action.status = 'PROCESSING'
      action.started_at = new Date().toISOString()
      action.attempt_count += 1
      action.updated_at = new Date().toISOString()

      const system = this.getSystem(action.system_id)
      if (!system) continue

      this.logAuditEvent(
        'prof-3',
        'SYSTEM_ACTION_STARTED',
        'privacy_request_action',
        action.id,
        'SUCCESS',
        { system: system.name, action: action.action_type }
      )

      // Use connector
      const connector = ConnectorFactory.createConnector(system)
      let result: { success: boolean; error?: string } = { success: true }

      try {
        if (action.action_type === 'DELETE') {
          result = await connector.deleteSubjectData(request.subject_identifier)
        } else if (action.action_type === 'ACCESS') {
          result = await connector.getSubjectData(request.subject_identifier)
        } else {
          result = await connector.correctSubjectData(request.subject_identifier, {})
        }
      } catch (err: any) {
        result = { success: false, error: err?.message || 'Connector failure' }
      }

      if (result.success) {
        action.status = 'COMPLETED'
        action.completed_at = new Date().toISOString()
        action.error_message = null
        this.logAuditEvent(
          'prof-3',
          'SYSTEM_ACTION_COMPLETED',
          'privacy_request_action',
          action.id,
          'SUCCESS',
          { system: system.name, action: action.action_type }
        )
      } else {
        action.status = 'FAILED'
        action.completed_at = new Date().toISOString()
        action.error_message = result.error || 'Simulated connector timeout or authorization failure'
        hasFailure = true
        this.logAuditEvent(
          'prof-3',
          'SYSTEM_ACTION_FAILED',
          'privacy_request_action',
          action.id,
          'FAILURE',
          { system: system.name, error: action.error_message }
        )
      }
    }

    if (hasFailure) {
      request.status = 'FAILED'
      request.updated_at = new Date().toISOString()
      this.logAuditEvent(
        'prof-3',
        'PRIVACY_REQUEST_FAILED',
        'privacy_request',
        requestId,
        'FAILURE',
        { reason: 'One or more system actions failed' }
      )
    } else {
      // Proceed to VERIFY step
      await this.verifyPrivacyRequest(requestId)
    }

    return request
  }

  async verifyPrivacyRequest(requestId: string): Promise<boolean> {
    const request = this.getPrivacyRequest(requestId)
    if (!request) return false

    const actions = this.getRequestActions(requestId)
    let allVerified = true

    for (const action of actions) {
      if (action.status !== 'COMPLETED') {
        allVerified = false
        continue
      }
      const system = this.getSystem(action.system_id)
      if (!system) continue

      const connector = ConnectorFactory.createConnector(system)
      const res = await connector.verifySubjectData(request.subject_identifier)
      if (!res.success) {
        allVerified = false
      }
    }

    if (allVerified) {
      request.status = 'COMPLETED'
      request.completed_at = new Date().toISOString()
      request.updated_at = new Date().toISOString()

      this.logAuditEvent(
        'prof-3',
        'VERIFICATION_COMPLETED',
        'privacy_request',
        requestId,
        'SUCCESS',
        {
          request_id: requestId,
          verified_systems_count: actions.length,
          verification_passed: true
        }
      )

      this.logAuditEvent(
        'prof-3',
        'PRIVACY_REQUEST_COMPLETED',
        'privacy_request',
        requestId,
        'SUCCESS',
        { request_id: requestId, duration_seconds: 4 }
      )
    }

    return allVerified
  }

  async retryPrivacyRequest(requestId: string): Promise<PrivacyRequest> {
    const request = this.getPrivacyRequest(requestId)
    if (!request) throw new Error('Request not found')

    const failedActions = this.getRequestActions(requestId).filter(a => a.status === 'FAILED')
    for (const a of failedActions) {
      a.status = 'PENDING'
      a.error_message = null
      this.logAuditEvent(
        'prof-3',
        'SYSTEM_ACTION_RETRIED',
        'privacy_request_action',
        a.id,
        'SUCCESS',
        { attempt: a.attempt_count + 1 }
      )
    }

    return this.executePrivacyRequest(requestId)
  }

  // TRIGGER DISCOVERY SCAN
  runDataDiscoveryScan(): { newlyScanned: number; totalAssets: number } {
    const now = new Date().toISOString()
    this.systems.forEach(s => {
      s.last_synced_at = now
    })

    this.logAuditEvent(
      'prof-1',
      'DATA_ASSET_DISCOVERED',
      'data_discovery',
      this.organization.id,
      'SUCCESS',
      {
        systems_scanned: this.systems.length,
        total_assets_classified: this.dataAssets.length,
        method: 'DETERMINISTIC_RULES_V2'
      }
    )

    return {
      newlyScanned: this.systems.length,
      totalAssets: this.dataAssets.length
    }
  }

  // DASHBOARD AGGREGATE METRICS
  getDashboardMetrics(): DashboardMetrics {
    const totalRequests = this.privacyRequests.length
    const completedRequests = this.privacyRequests.filter(r => r.status === 'COMPLETED').length
    const pendingRequests = this.privacyRequests.filter(r => r.status === 'PENDING' || r.status === 'PROCESSING').length

    return {
      data_sources_count: this.systems.length,
      pii_records_count: 42186,
      privacy_requests_count: totalRequests,
      pending_requests_count: pendingRequests,
      systems_mapped_count: this.systems.length,
      audit_events_count: this.auditLogs.length,
      completion_rate: totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 100
    }
  }

  // EXECUTION TIMELINE BUILDER FOR MODALS
  getRequestTimeline(requestId: string): TimelineStep[] {
    const request = this.getPrivacyRequest(requestId)
    if (!request) return []

    const actions = this.getRequestActions(requestId)
    const steps: TimelineStep[] = [
      {
        id: 'step-1',
        timestamp: new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: 'Request received & validated',
        status: 'COMPLETED',
        detail: `DPDP Request type: ${request.request_type}`
      },
      {
        id: 'step-2',
        timestamp: new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        label: `Data subject identified: ${request.subject_identifier}`,
        status: 'COMPLETED',
        detail: 'Mapped identity tokens to primary data graph'
      }
    ]

    for (const a of actions) {
      const sys = this.getSystem(a.system_id)
      steps.push({
        id: a.id,
        timestamp: a.completed_at ? new Date(a.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In progress',
        label: `${sys?.name || 'System'} ${a.action_type.toLowerCase()} operation`,
        system_name: sys?.name,
        status: a.status,
        detail: a.error_message || (a.status === 'COMPLETED' ? 'Operation successful' : 'Pending connector execution')
      })
    }

    if (request.status === 'COMPLETED') {
      steps.push({
        id: 'step-verify',
        timestamp: request.completed_at ? new Date(request.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        label: 'Multi-system verification passed',
        status: 'COMPLETED',
        detail: 'All affected nodes checked and confirmed'
      })
      steps.push({
        id: 'step-audit',
        timestamp: request.completed_at ? new Date(request.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        label: 'Cryptographic audit log sealed',
        status: 'COMPLETED',
        detail: 'Immutable event written to compliance ledger'
      })
    }

    return steps
  }
}

// Global Singleton Store Instance
export const privacyStore = new PrivacyStore()
