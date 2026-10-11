// Core types for PrivacyOps

export type Role = 'OWNER' | 'ADMIN' | 'PRIVACY_OFFICER' | 'SECURITY_OFFICER' | 'EMPLOYEE' | 'AUDITOR';

export type Classification = 'PERSONAL' | 'SENSITIVE' | 'FINANCIAL' | 'CREDENTIAL' | 'PUBLIC' | 'UNKNOWN';

export type RequestType = 'ACCESS' | 'DELETE' | 'CORRECT';

export type RequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type ActionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export type SystemStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';

export type ConnectorType = 'DEMO' | 'PRODUCTION';

export type RelationshipType = 'SYNC' | 'ASYNC' | 'PUSH' | 'PULL';

export type EventType = 
  | 'USER_LOGIN'
  | 'SYSTEM_CREATED'
  | 'DATA_ASSET_DISCOVERED'
  | 'PRIVACY_REQUEST_CREATED'
  | 'PRIVACY_REQUEST_STARTED'
  | 'SYSTEM_ACTION_STARTED'
  | 'SYSTEM_ACTION_COMPLETED'
  | 'SYSTEM_ACTION_FAILED'
  | 'SYSTEM_ACTION_RETRIED'
  | 'PRIVACY_REQUEST_COMPLETED'
  | 'PRIVACY_REQUEST_FAILED'
  | 'VERIFICATION_COMPLETED';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface System {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  description: string;
  status: SystemStatus;
  connector_type: ConnectorType;
  last_synced_at: string | null;
  simulate_failure: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataAsset {
  id: string;
  organization_id: string;
  system_id: string;
  name: string;
  display_name: string;
  description: string;
  classification: Classification;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  owner: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  updated_at: string;
}

export interface DataFlow {
  id: string;
  organization_id: string;
  source_system_id: string;
  destination_system_id: string;
  data_asset_id: string;
  relationship_type: RelationshipType;
  description: string;
  created_at: string;
}

export interface PrivacyRequest {
  id: string;
  organization_id: string;
  subject_identifier: string;
  request_type: RequestType;
  status: RequestStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface PrivacyRequestAction {
  id: string;
  privacy_request_id: string;
  system_id: string;
  action_type: RequestType;
  status: ActionStatus;
  attempt_count: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id: string;
  event_type: EventType;
  resource_type: string;
  resource_id: string;
  status: 'SUCCESS' | 'FAILURE';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface BlastRadiusResult {
  affected_systems: System[];
  direct_dependencies: System[];
  indirect_dependencies: System[];
  depth: number;
  affected_assets: DataAsset[];
}

export interface ConnectorResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

export interface PrivacyConnector {
  getSubjectData(identifier: string): Promise<ConnectorResult>;
  deleteSubjectData(identifier: string): Promise<ConnectorResult>;
  correctSubjectData(identifier: string, corrections: Record<string, unknown>): Promise<ConnectorResult>;
  verifySubjectData(identifier: string): Promise<ConnectorResult>;
}

export type ConsentStatus = 'GRANTED' | 'WITHDRAWN';
export type ConsentPurpose = 'Marketing' | 'Analytics' | 'Personalization' | 'Telemetry';

export interface ConsentRecord {
  id: string;
  organization_id: string;
  subject_identifier: string;
  purpose: ConsentPurpose;
  status: ConsentStatus;
  source: string;
  granted_at: string;
  updated_at: string;
  withdrawn_at: string | null;
}

export interface DataSourceSummary {
  id: string;
  name: string;
  type: string;
  description: string;
  status: SystemStatus;
  connector_type: ConnectorType;
  tables_count: number;
  records_count: number;
  last_scanned_at: string | null;
  simulate_failure: boolean;
  classification_counts: {
    personal: number;
    sensitive: number;
    financial: number;
    credential: number;
    public: number;
  };
}

export interface TimelineStep {
  id: string;
  timestamp: string;
  label: string;
  system_name?: string;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED';
  detail?: string;
}

export interface SubjectBlastRadius {
  subject_identifier: string;
  systems_affected: System[];
  pii_records_count: number;
  deletion_actions_count: number;
  verification_checks_count: number;
  lineage_path: string[];
  affected_assets: DataAsset[];
  depth: number;
}

export interface DashboardMetrics {
  data_sources_count: number;
  pii_records_count: number;
  privacy_requests_count: number;
  pending_requests_count: number;
  systems_mapped_count: number;
  audit_events_count: number;
  completion_rate: number;
}

