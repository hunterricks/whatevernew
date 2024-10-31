import { transaction } from '@/lib/db';

export interface Auth0User {
  id: string;
  email: string;
  name: string;
  app_metadata?: {
    role?: string;
    roles?: string[];
    active_role?: string;
    profile_completion?: {
      status: string;
      score: number;
      current_step: string;
      completed_steps: string[];
    };
  };
}

export async function syncUserMetadata(auth0User: Auth0User) {
  const { id, email, name, app_metadata } = auth0User;
  
  if (!app_metadata) {
    throw new Error('No metadata provided for user');
  }

  const role = app_metadata.role || 'client';
  const roles = app_metadata.roles || [role];
  const active_role = app_metadata.active_role || role;

  try {
    await transaction(async (connection) => {
      // Update or create user
      await connection.execute(
        `INSERT INTO users (
          id, 
          email, 
          name, 
          roles, 
          active_role,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          roles = VALUES(roles),
          active_role = VALUES(active_role),
          updated_at = NOW()`,
        [
          id,
          email,
          name,
          JSON.stringify(roles),
          active_role
        ]
      );

      // Create role-specific profile if needed
      if (role === 'client') {
        await connection.execute(
          `INSERT IGNORE INTO client_profiles (
            user_id,
            profile_completion,
            created_at,
            updated_at
          ) VALUES (?, 0, NOW(), NOW())`,
          [id]
        );
      } else if (role === 'service_provider') {
        await connection.execute(
          `INSERT IGNORE INTO service_provider_profiles (
            user_id,
            profile_completion,
            created_at,
            updated_at
          ) VALUES (?, 0, NOW(), NOW())`,
          [id]
        );
      }

      // Log successful sync
      console.log('Synced metadata for user:', {
        id,
        email,
        role,
        roles
      });
    });
  } catch (error) {
    console.error('Error syncing user metadata:', error);
    throw new Error(
      error instanceof Error 
        ? `Failed to sync user metadata: ${error.message}`
        : 'Failed to sync user metadata'
    );
  }
} 