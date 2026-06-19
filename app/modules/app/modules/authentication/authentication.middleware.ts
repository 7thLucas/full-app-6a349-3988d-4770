import type { Request, Response, NextFunction } from "express";
import { parseJwtFromCookieHeader, verifyJwt } from "./authentication.server";
import { AuthService } from "./authentication.service";
import { UserRole } from "./authentication.types";

declare global {
  namespace Express {
    interface Request {
      user?: import("~/modules/authentication/authentication.types").PublicUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = parseJwtFromCookieHeader(req.headers.cookie);
    if (!token) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const payload = verifyJwt(token);
    const user = await AuthService.getUserById(payload.sub);

    if (!user || !user.is_active) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    req.user = user as import("~/modules/authentication/authentication.types").PublicUser;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Authentication required" });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    if (req.user?.role !== UserRole.Admin) {
      res.status(403).json({ success: false, message: "Admin access required" });
      return;
    }
    next();
  });
}

export function requireRole(...roles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role as UserRole)) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }
      next();
    });
  };
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = parseJwtFromCookieHeader(req.headers.cookie);
    if (token) {
      const payload = verifyJwt(token);
      const user = await AuthService.getUserById(payload.sub);
      if (user && user.is_active) req.user = user as import("~/modules/authentication/authentication.types").PublicUser;
    }
  } catch {
    // ignore — auth is optional
  }
  next();
}
