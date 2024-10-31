function (user, context, callback) {
  user.app_metadata = user.app_metadata || {};
  user.app_metadata.onboarding_status = user.app_metadata.onboarding_status || {
    completedSteps: [],
    lastUpdated: new Date().toISOString()
  };
  
  context.idToken['https://whatever.com/onboarding_status'] = user.app_metadata.onboarding_status;
  
  callback(null, user, context);
}
