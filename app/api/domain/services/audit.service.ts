import { AuditLogModel } from "../models/audit-log.model";
import type { AdminIdentity } from "../admin/rbac";

// Cross-cutting audit logging (Sprint 12). Call record() from every admin
// mutation with before/after snapshots + reason.
export class AuditService {
  static async record(args: {
    actor: { id: string; admin?: AdminIdentity | null };
    action: string;
    entity: string;
    entityId?: string | null;
    before?: any;
    after?: any;
    reason?: string | null;
  }) {
    await AuditLogModel.create({
      actorId: args.actor.id,
      actorRole: args.actor.admin?.role ?? "admin",
      action: args.action,
      entity: args.entity,
      entityId: args.entityId ?? null,
      before: args.before ?? null,
      after: args.after ?? null,
      reason: args.reason ?? null,
    });
  }

  static async list(opts: { entity?: string; entityId?: string; actorId?: string; limit?: number } = {}) {
    const q: Record<string, any> = {};
    if (opts.entity) q.entity = opts.entity;
    if (opts.entityId) q.entityId = opts.entityId;
    if (opts.actorId) q.actorId = opts.actorId;
    const logs = await AuditLogModel.find(q).sort({ createdAt: -1 }).limit(opts.limit ?? 100).lean();
    return logs.map((l) => ({
      id: l._id.toString(),
      actorId: l.actorId,
      actorRole: l.actorRole,
      action: l.action,
      entity: l.entity,
      entityId: l.entityId,
      before: l.before,
      after: l.after,
      reason: l.reason,
      at: (l as any).createdAt,
    }));
  }
}
