export type PortalRole = 'admin' | 'warehouse';

export const WAREHOUSE_HOME = '/admin/warehouse';
export const CHANGE_PASSWORD_PATH = '/admin/warehouse/change-password';
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/unauthorized'];

function within(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => within(pathname, path));
}

export interface PortalIdentity {
  role?: PortalRole;
  mustChangePassword?: boolean;
}

// Page-level routing for /admin/**. Deny by default: anything not explicitly opened to warehouse
// staff sends them back to the warehouse section. API routes enforce the same rules themselves.
export function resolveAdminPath(identity: PortalIdentity | null, pathname: string): { redirect?: string } {
  if (isPublicAdminPath(pathname)) return {};
  if (!identity?.role) return { redirect: '/admin/login' };
  if (identity.role === 'admin') return {};
  if (identity.mustChangePassword) return within(pathname, CHANGE_PASSWORD_PATH) ? {} : { redirect: CHANGE_PASSWORD_PATH };
  return within(pathname, WAREHOUSE_HOME) ? {} : { redirect: WAREHOUSE_HOME };
}

export function homeFor(role: PortalRole | undefined): string {
  return role === 'warehouse' ? WAREHOUSE_HOME : '/admin';
}
