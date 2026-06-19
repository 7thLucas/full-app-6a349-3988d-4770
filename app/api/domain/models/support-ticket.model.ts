import { prop, getModelForClass, modelOptions, Severity } from "@typegoose/typegoose";
import { CommonTypegooseEntity } from "~/api/models/base/common-typegoose.entity";

// Support canned-action / ticket log (Sprint 16 §14.17).
@modelOptions({
  schemaOptions: { collection: "tbl_support_tickets", timestamps: true },
  options: { allowMixed: Severity.ALLOW },
})
export class SupportTicket extends CommonTypegooseEntity {
  @prop({ type: String, required: true, index: true })
  memberId!: string;

  @prop({ type: String, required: true })
  agentId!: string;

  // resend_receipt | retrigger_notification | goodwill_voucher | goodwill_crystals | note
  @prop({ type: String, required: true })
  action!: string;

  @prop({ type: Object, default: {} })
  detail!: Record<string, any>;

  @prop({ type: String, default: "" })
  note!: string;
}

export const SupportTicketModel = getModelForClass(SupportTicket);
