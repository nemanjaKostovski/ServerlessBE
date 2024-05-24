export async function basicAuthorizer(event, context, callback) {
  const authorizationToken = event.headers.authorization;
  if (!authorizationToken) {
    return callback(
      'Unauthorized',
      generatePolicy('user', 'Deny', event.methodArn, 401)
    );
  }
  const encodedCredentials = authorizationToken.split(' ')[1];
  const [username, password] = Buffer.from(encodedCredentials, 'base64')
    .toString('utf-8')
    .split(':');

  const storedUserPassword = process.env[username];
  if (storedUserPassword && storedUserPassword === password) {
    return callback(null, generatePolicy(username, 'Allow', event.routeArn));
  } else {
    return callback(
      'Unauthorized',
      generatePolicy('user', 'Deny', event.methodArn, 403)
    );
  }
}

function generatePolicy(principalId, effect, resource, statusCode = 200) {
  const authResponse = {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  if (statusCode !== 200) {
    authResponse.context = {
      statusCode,
    };
  }
  return authResponse;
}
