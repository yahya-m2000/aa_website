export const graphEnv = {
  tenantId: process.env.ADMIN_GRAPH_TENANT_ID,
  clientId: process.env.ADMIN_GRAPH_CLIENT_ID,
  clientSecret: process.env.ADMIN_GRAPH_CLIENT_SECRET,
  siteId: process.env.ADMIN_GRAPH_SITE_ID,
  ordersListId: process.env.ADMIN_GRAPH_ORDERS_LIST_ID,
};

export function assertGraphConfigured(): void {
  const { tenantId, clientId, clientSecret, siteId, ordersListId } = graphEnv;
  if (!tenantId || !clientId || !clientSecret || !siteId || !ordersListId) {
    throw new Error(
      'Microsoft Graph is not configured: ADMIN_GRAPH_TENANT_ID, ADMIN_GRAPH_CLIENT_ID, ADMIN_GRAPH_CLIENT_SECRET, ADMIN_GRAPH_SITE_ID, and ADMIN_GRAPH_ORDERS_LIST_ID must all be set in .env.',
    );
  }
}
