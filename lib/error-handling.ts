export const handleRoleError = (error: any, role: string) => {
  console.error(`Role verification failed for ${role}:`, error);
  return {
    error: `Unauthorized - ${role} access only`,
    status: 403
  };
};

export const handleOnboardingError = (error: any, role: string) => {
  console.error(`Onboarding error for ${role}:`, error);
  return {
    error: 'Error updating onboarding data',
    details: error.message,
    status: 500
  };
}; 