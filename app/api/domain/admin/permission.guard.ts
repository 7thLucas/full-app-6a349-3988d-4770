import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "~/modules/authentication/authentication.middleware";
import { adminIdentity, can, type Permission, type AdminIdentity } from "./rbac";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminIdentity;
    }
  }
}

/**
 * Gate an admin route behind a permission. Composes with requireAuth, resolves
 * the admin sub-role from the user profile, and attaches `req.admin`
 * (role + outletScope) for downstream scope checks. (CLAUDE.md: authGuard +
 * permissionGuard on every admin route.)
 */
export function permissionGuard(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, () => {
      const identity = adminIdentity(req.user);
      if (!identity) {
        res.status(403).json({ success: false, message: "Admin access required" });
        return;
      }
      if (!can(identity, permission)) {
        res.status(403).json({ success: false, message: "You don't have permission for this action" });
        return;
      }
      req.admin = identity;
      next();
    });
  };
}
