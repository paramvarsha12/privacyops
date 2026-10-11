-- PrivacyOps Database Schema
-- This file defines the complete database structure for PrivacyOps

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (links Supabase Auth users to organizations)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL, -- References Supabase Auth user ID
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER', 'SECURITY_OFFICER', 'EMPLOYEE', 'AUDITOR')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- Systems table
CREATE TABLE systems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
  connector_type TEXT NOT NULL DEFAULT 'DEMO' CHECK (connector_type IN ('DEMO', 'PRODUCTION')),
  last_synced_at TIMESTAMP WITH TIME ZONE,
  simulate_failure BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Assets table
CREATE TABLE data_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  classification TEXT NOT NULL CHECK (classification IN ('PERSONAL', 'SENSITIVE', 'FINANCIAL', 'CREDENTIAL', 'PUBLIC', 'UNKNOWN')),
  sensitivity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (sensitivity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  owner TEXT,
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Flows table (lineage relationships)
CREATE TABLE data_flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  destination_system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  data_asset_id UUID NOT NULL REFERENCES data_assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('SYNC', 'ASYNC', 'PUSH', 'PULL')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Privacy Requests table
CREATE TABLE privacy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subject_identifier TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('ACCESS', 'DELETE', 'CORRECT')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Privacy Request Actions table
CREATE TABLE privacy_request_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  privacy_request_id UUID NOT NULL REFERENCES privacy_requests(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ACCESS', 'DELETE', 'CORRECT')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
  attempt_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(privacy_request_id, system_id, action_type)
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('SUCCESS', 'FAILURE')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'REVIEW')),
  connected_systems TEXT[],
  review_status TEXT DEFAULT 'PENDING' CHECK (review_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Retention Policies table
CREATE TABLE retention_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  data_asset_id UUID REFERENCES data_assets(id) ON DELETE CASCADE,
  retention_period INTEGER NOT NULL, -- in days
  policy TEXT NOT NULL,
  owner TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integrations table
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_systems_organization_id ON systems(organization_id);
CREATE INDEX idx_data_assets_organization_id ON data_assets(organization_id);
CREATE INDEX idx_data_assets_system_id ON data_assets(system_id);
CREATE INDEX idx_data_flows_organization_id ON data_flows(organization_id);
CREATE INDEX idx_data_flows_source_system_id ON data_flows(source_system_id);
CREATE INDEX idx_data_flows_destination_system_id ON data_flows(destination_system_id);
CREATE INDEX idx_data_flows_data_asset_id ON data_flows(data_asset_id);
CREATE INDEX idx_privacy_requests_organization_id ON privacy_requests(organization_id);
CREATE INDEX idx_privacy_requests_status ON privacy_requests(status);
CREATE INDEX idx_privacy_request_actions_privacy_request_id ON privacy_request_actions(privacy_request_id);
CREATE INDEX idx_privacy_request_actions_system_id ON privacy_request_actions(system_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_vendors_organization_id ON vendors(organization_id);
CREATE INDEX idx_retention_policies_organization_id ON retention_policies(organization_id);
CREATE INDEX idx_integrations_organization_id ON integrations(organization_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_request_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Organizations RLS
-- Users can only see organizations they belong to
CREATE POLICY "Users can view organizations they belong to"
  ON organizations
  FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Profiles RLS
-- Users can only view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON profiles
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Systems RLS
-- Users can only view systems in their organization
CREATE POLICY "Users can view systems in their organization"
  ON systems
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Users with appropriate roles can manage systems
CREATE POLICY "Admins and officers can manage systems"
  ON systems
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER', 'SECURITY_OFFICER')
    )
  );

-- Data Assets RLS
CREATE POLICY "Users can view data assets in their organization"
  ON data_assets
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privacy officers can manage data assets"
  ON data_assets
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER')
    )
  );

-- Data Flows RLS
CREATE POLICY "Users can view data flows in their organization"
  ON data_flows
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privacy officers can manage data flows"
  ON data_flows
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER')
    )
  );

-- Privacy Requests RLS
CREATE POLICY "Users can view privacy requests in their organization"
  ON privacy_requests
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privacy officers can manage privacy requests"
  ON privacy_requests
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER')
    )
  );

-- Privacy Request Actions RLS
CREATE POLICY "Users can view actions for requests in their organization"
  ON privacy_request_actions
  FOR SELECT
  USING (
    privacy_request_id IN (
      SELECT id FROM privacy_requests 
      WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Audit Logs RLS
CREATE POLICY "Users can view audit logs in their organization"
  ON audit_logs
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Audit logs are append-only (no update/delete through normal operations)
CREATE POLICY "No one can update audit logs"
  ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "No one can delete audit logs"
  ON audit_logs
  FOR DELETE
  USING (false);

-- Vendors RLS
CREATE POLICY "Users can view vendors in their organization"
  ON vendors
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage vendors"
  ON vendors
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN')
    )
  );

-- Retention Policies RLS
CREATE POLICY "Users can view retention policies in their organization"
  ON retention_policies
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Privacy officers can manage retention policies"
  ON retention_policies
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'PRIVACY_OFFICER')
    )
  );

-- Integrations RLS
CREATE POLICY "Users can view integrations in their organization"
  ON integrations
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Security officers can manage integrations"
  ON integrations
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('OWNER', 'ADMIN', 'SECURITY_OFFICER')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_systems_updated_at BEFORE UPDATE ON systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_assets_updated_at BEFORE UPDATE ON data_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_requests_updated_at BEFORE UPDATE ON privacy_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_request_actions_updated_at BEFORE UPDATE ON privacy_request_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_retention_policies_updated_at BEFORE UPDATE ON retention_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
