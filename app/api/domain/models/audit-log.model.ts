import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Immutable audit trail for every admin mutation (Sprint 12 §14):
// actor, action, entity, before/after, reason, timestamp.
@modelOptions({
  schemaOptions: { collection: "tbl_audit_logs", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class AuditLog extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  actorId!: string;

  @prop({ type: String, default: "" })
  actorRole!: string;

  @prop({ type: String, required: true, index: true })
  action!: string; // e.g. "order.override", "catalog.item.update"

  @prop({ type: String, required: true, index: true })
  entity!: string; // collection/entity type

  @prop({ type: String, default: null })
  entityId!: string | null;

  @prop({ type: Object, default: null })
  before!: any;

  @prop({ type: Object, default: null })
  after!: any;

  @prop({ type: String, default: null })
  reason!: string | null;
}

export const AuditLogModel = getModelForClass(AuditLog);
