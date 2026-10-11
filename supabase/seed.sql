-- PrivacyOps Seed Data
-- This file populates the database with demo data for Acme Corp

-- Note: In production, this would be run with proper authentication
-- For demo purposes, we'll insert directly

-- Create Acme Corp organization
INSERT INTO organizations (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp')
ON CONFLICT (slug) DO NOTHING;

-- Create demo user profile (you'll need to replace user_id with actual Supabase auth user ID)
-- For now, we'll use a placeholder - this should be updated after auth setup
INSERT INTO profiles (id, organization_id, user_id, name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Demo User', 'demo@acme.com', 'OWNER')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Create systems
INSERT INTO systems (id, organization_id, name, type, description, status, connector_type) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Website', 'WEB', 'Main company website', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Customer Database', 'DATABASE', 'Primary customer database', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'CRM', 'CRM', 'Customer relationship management system', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'Marketing Platform', 'MARKETING', 'Email marketing and campaigns', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'Support System', 'SUPPORT', 'Customer support ticketing', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'Email Provider', 'EMAIL', 'Transactional email service', 'ACTIVE', 'DEMO'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'Analytics Platform', 'ANALYTICS', 'User analytics and tracking', 'ACTIVE', 'DEMO')
ON CONFLICT DO NOTHING;

-- Create data assets
INSERT INTO data_assets (id, organization_id, system_id, name, display_name, description, classification, sensitivity, owner, risk_level) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'customer_email', 'Customer Email', 'Customer email address', 'PERSONAL', 'MEDIUM', 'Engineering', 'MEDIUM'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'customer_name', 'Customer Name', 'Customer full name', 'PERSONAL', 'LOW', 'Engineering', 'LOW'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'phone_number', 'Phone Number', 'Customer phone number', 'PERSONAL', 'MEDIUM', 'Engineering', 'MEDIUM'),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'billing_address', 'Billing Address', 'Customer billing address', 'PERSONAL', 'MEDIUM', 'Finance', 'MEDIUM'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'payment_reference', 'Payment Reference', 'Payment method reference', 'FINANCIAL', 'HIGH', 'Finance', 'HIGH'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'marketing_consent', 'Marketing Consent', 'Marketing consent status', 'PERSONAL', 'LOW', 'Marketing', 'LOW'),
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'support_ticket', 'Support Ticket', 'Customer support ticket data', 'PERSONAL', 'MEDIUM', 'Support', 'MEDIUM')
ON CONFLICT DO NOTHING;

-- Create data flows (lineage graph)
-- Website -> Customer Database
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'PUSH', 'Website form submissions sync to customer database'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'PUSH', 'Customer name from website syncs to database'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'PUSH', 'Marketing consent captured on website')
ON CONFLICT DO NOTHING;

-- Customer Database -> CRM
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'SYNC', 'Customer email synced to CRM'),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'SYNC', 'Customer name synced to CRM'),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'SYNC', 'Phone number synced to CRM')
ON CONFLICT DO NOTHING;

-- Customer Database -> Support System
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'SYNC', 'Customer email available in support system'),
  ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'SYNC', 'Customer name available in support system')
ON CONFLICT DO NOTHING;

-- CRM -> Marketing Platform
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'SYNC', 'Customer email synced to marketing platform'),
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'SYNC', 'Marketing consent synced to marketing platform')
ON CONFLICT DO NOTHING;

-- Marketing Platform -> Email Provider
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'PUSH', 'Marketing campaigns use email provider')
ON CONFLICT DO NOTHING;

-- Customer Database -> Analytics Platform
INSERT INTO data_flows (id, organization_id, source_system_id, destination_system_id, data_asset_id, relationship_type, description) VALUES
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'ASYNC', 'Customer email anonymized for analytics'),
  ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'ASYNC', 'Customer behavior tracked in analytics')
ON CONFLICT DO NOTHING;

-- Create some vendors
INSERT INTO vendors (id, organization_id, name, category, risk_level, status, connected_systems, review_status) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Mailchimp', 'Marketing', 'MEDIUM', 'ACTIVE', ARRAY['Marketing Platform'], 'APPROVED'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'SendGrid', 'Email', 'MEDIUM', 'ACTIVE', ARRAY['Email Provider'], 'APPROVED'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Mixpanel', 'Analytics', 'HIGH', 'ACTIVE', ARRAY['Analytics Platform'], 'APPROVED')
ON CONFLICT DO NOTHING;

-- Create retention policies
INSERT INTO retention_policies (id, organization_id, data_asset_id, retention_period, policy, owner, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '2555', 'Retain customer email for 7 years after account closure', 'Privacy Officer', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', '3650', 'Retain payment records for 10 years', 'Finance', 'ACTIVE'),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000007', '1825', 'Retain support tickets for 5 years', 'Support', 'ACTIVE')
ON CONFLICT DO NOTHING;
