-- Add permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id VARCHAR(36),
  permission_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Insert default permissions
INSERT INTO permissions (id, name, description) VALUES
-- Client permissions
('perm_client_post_jobs', 'client:post_jobs', 'Create and manage job postings'),
('perm_client_view_proposals', 'client:view_proposals', 'Receive and review proposals from service providers'),
('perm_client_message_providers', 'client:message_service_providers', 'Communicate with service providers'),
('perm_client_manage_contracts', 'client:manage_contracts', 'Enter into contracts, approve milestones, release payments'),
('perm_client_provide_feedback', 'client:provide_feedback', 'Leave reviews and ratings for service providers'),
('perm_client_manage_profile', 'client:manage_profile', 'Edit profile information and settings'),
('perm_client_manage_notifications', 'client:manage_notifications', 'Control notification preferences'),
('perm_client_manage_account', 'client:manage_account', 'Update account settings, security options'),

-- Service Provider permissions
('perm_provider_view_jobs', 'provider:view_jobs', 'Browse and search job postings'),
('perm_provider_submit_proposals', 'provider:submit_proposals', 'Apply to job postings'),
('perm_provider_message_clients', 'provider:message_clients', 'Communicate with clients'),
('perm_provider_manage_contracts', 'provider:manage_contracts', 'Accept contracts, update milestones, request payments'),
('perm_provider_receive_payments', 'provider:receive_payments', 'Get paid for completed work'),
('perm_provider_receive_feedback', 'provider:receive_feedback', 'View reviews and ratings from clients'),
('perm_provider_manage_profile', 'provider:manage_profile', 'Edit profile information, upload portfolio'),
('perm_provider_manage_notifications', 'provider:manage_notifications', 'Control notification preferences'),
('perm_provider_manage_account', 'provider:manage_account', 'Update account settings, security options'),

-- General permissions
('perm_user_access_help', 'user:access_help_center', 'View support articles and FAQs'),
('perm_user_use_chatbot', 'user:use_chatbot_support', 'Access AI assistance for common questions'),
('perm_user_participate', 'user:participate_platform_engagement', 'Engage in surveys, submit feature requests'),
('perm_user_manage_security', 'user:manage_security', 'Update security settings'),
('perm_user_manage_preferences', 'user:manage_preferences', 'Set preferences for notifications'),
('perm_user_manage_account', 'user:manage_account_options', 'Manage account options'); 