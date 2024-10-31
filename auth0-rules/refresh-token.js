function (user, context, callback) {
  const namespace = 'https://whatever.com';
  
  if (context.protocol === 'oauth2-refresh-token') {
    context.accessToken[namespace + '/roles'] = user.roles;
    context.accessToken[namespace + '/permissions'] = user.permissions;
  }
  
  callback(null, user, context);
}
