function assignRoles(user, context, callback) {
  // Check if this is the first login
  if (context.stats.loginsCount === 1) {
    // You can set default roles or handle based on email domain
    const defaultRole = 'client';
    
    // Add the role to the user metadata
    const namespace = 'https://whatever.com';
    context.idToken[namespace + '/roles'] = [defaultRole];
    context.accessToken[namespace + '/roles'] = [defaultRole];
    
    // Store the role in user metadata for persistence
    user.user_metadata = user.user_metadata || {};
    user.user_metadata.roles = [defaultRole];
    
    auth0.users.updateUserMetadata(user.user_id, user.user_metadata)
      .then(() => {
        callback(null, user, context);
      })
      .catch((err) => {
        callback(err);
      });
  } else {
    // For subsequent logins, get roles from metadata
    const namespace = 'https://whatever.com';
    const roles = user.user_metadata.roles || ['client'];
    
    context.idToken[namespace + '/roles'] = roles;
    context.accessToken[namespace + '/roles'] = roles;
    
    callback(null, user, context);
  }
}
