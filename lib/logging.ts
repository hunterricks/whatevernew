export const logRoleVerification = (userId: string, role: string, success: boolean) => {
  console.log({
    timestamp: new Date().toISOString(),
    event: 'role_verification',
    userId,
    role,
    success,
    environment: process.env.NODE_ENV
  });
};

export const logOnboardingProgress = (userId: string, role: string, step: string) => {
  console.log({
    timestamp: new Date().toISOString(),
    event: 'onboarding_progress',
    userId,
    role,
    step,
    environment: process.env.NODE_ENV
  });
}; 