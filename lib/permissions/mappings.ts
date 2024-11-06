import { Permission } from '../types/permissions';
import type { UserRole } from '../auth';

export const rolePermissions: Record<UserRole, Permission[]> = {
  client: [
    'client:post_jobs',
    'client:view_proposals',
    'client:message_service_providers',
    'client:manage_contracts',
    'client:provide_feedback',
    'client:manage_profile',
    'client:manage_notifications',
    'client:manage_account',
    'user:access_help_center',
    'user:use_chatbot_support',
    'user:participate_platform_engagement',
    'user:manage_security',
    'user:manage_preferences',
    'user:manage_account_options'
  ],
  service_provider: [
    'provider:view_jobs',
    'provider:submit_proposals',
    'provider:message_clients',
    'provider:manage_contracts',
    'provider:receive_payments',
    'provider:receive_feedback',
    'provider:manage_profile',
    'provider:manage_notifications',
    'provider:manage_account',
    'user:access_help_center',
    'user:use_chatbot_support',
    'user:participate_platform_engagement',
    'user:manage_security',
    'user:manage_preferences',
    'user:manage_account_options'
  ]
}; 