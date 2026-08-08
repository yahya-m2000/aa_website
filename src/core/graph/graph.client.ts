import 'isomorphic-fetch';
import { ClientSecretCredential } from '@azure/identity';
import { Client } from '@microsoft/microsoft-graph-client';
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials';

import { assertGraphConfigured, graphEnv } from './env';

let client: Client | null = null;

export function getGraphClient(): Client {
  if (client) {
    return client;
  }

  assertGraphConfigured();

  const credential = new ClientSecretCredential(
    graphEnv.tenantId!,
    graphEnv.clientId!,
    graphEnv.clientSecret!,
  );

  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  });

  client = Client.initWithMiddleware({ authProvider });
  return client;
}

export class GraphRequestError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'GraphRequestError';
  }
}

export class GraphConflictError extends GraphRequestError {
  constructor(message: string, cause?: unknown) {
    super(message, 412, cause);
    this.name = 'GraphConflictError';
  }
}
