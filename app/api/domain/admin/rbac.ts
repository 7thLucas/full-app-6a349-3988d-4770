// Admin RBAC (Sprint 12 §14.2). The base template has only 3 coarse roles
// (unauthenticated/authenticated/admin); the console needs finer admin roles
// with a permission matrix and per-outlet scoping for regional managers.
// An admin's sub-role lives in `user.profile.adminRole` (+ `outletScope` ids).

export type Permission =
  | "dashboard.view"
  | "orders.view"
  | "orders.manage"
  | "catalog.manage"
  | "outlets.manage"
  | "loyalty.manage"
  | "rewards.manage"
  | "vouchers.manage"
  | "referral.manage"
  | "banners.manage"
  | "campaigns.manage"
  | "finance.view"
  | "finance.manage"
  | "reports.view"
  | "reports.manage"
  | "compliance.manage"
  | "settings.manage"
  | "audit.view"
  | "rbac.manage";

export type AdminRole =
  | "super_admin"
  | "ops_manager"
  | "store_manager"
  | "auditor"
  | "loyalty_manager"
  | "marketing"
  | "finance";

const ALL: Permission[] = [
  "dashboard.view", "orders.view", "orders.manage", "catalog.manage", "outlets.manage",
  "loyalty.manage", "rewards.manage", "vouchers.manage", "referral.manage", "banners.manage",
  "campaigns.manage", "finance.view", "finance.manage", "reports.view", "reports.manage",
  "compliance.manage", "settings.manage", "audit.view", "rbac.manage",
];

// Role → granted permissions.
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: ALL,
  ops_manager: ["dashboard.view", "orders.view", "orders.manage", "catalog.manage", "outlets.manage", "audit.view"],
  // Store managers: read their board, override states, toggle availability/hours
  // for their own outlet(s) only (scope enforced separately).
  store_manager: ["dashboard.view", "orders.view", "orders.manage", "outlets.manage", "catalog.manage"],
  auditor: ["dashboard.view", "orders.view", "finance.view", "reports.view", "audit.view"], // read-only
  loyalty_manager: ["dashboard.view", "loyalty.manage", "rewards.manage", "audit.view"],
  marketing: ["dashboard.view", "vouchers.manage", "referral.manage", "banners.manage", "campaigns.manage", "reports.view", "audit.view"],
  finance: ["dashboard.view", "finance.view", "finance.manage", "reports.view", "reports.manage", "audit.view"],
};

// Auditor is strictly read-only — no mutating permission ever applies.
const READ_ONLY_ROLES: AdminRole[] = ["auditor"];
const MUTATION_PERMISSIONS = new Set<Permission>(
  ALL.filter((p) => p.endsWith(".manage") && p !== "audit.view"),
);

export interface AdminIdentity {
  role: AdminRole;
  outletScope: string[]; // empty = all outlets
}

/** Resolve the admin identity from a user's profile. role===Admin → super_admin default. */
export function adminIdentity(user: any): AdminIdentity | null {
  const isPlatformAdmin = user?.role === "admin";
  const sub = (user?.profile?.adminRole as AdminRole) ?? (isPlatformAdmin ? "super_admin" : null);
  if (!sub) return null;
  return { role: sub, outletScope: (user?.profile?.outletScope as string[]) ?? [] };
}

export function can(identity: AdminIdentity | null, permission: Permission): boolean {
  if (!identity) return false;
  if (READ_ONLY_ROLES.includes(identity.role) && MUTATION_PERMISSIONS.has(permission)) return false;
  return ROLE_PERMISSIONS[identity.role]?.includes(permission) ?? false;
}

/** Whether this identity may act on the given outlet (scope check). */
export function inScope(identity: AdminIdentity | null, outletId?: string | null): boolean {
  if (!identity) return false;
  if (identity.outletScope.length === 0) return true; // unscoped = all outlets
  if (!outletId) return false;
  return identity.outletScope.includes(outletId);
}
