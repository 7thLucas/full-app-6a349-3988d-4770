import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, FileText, Flag, Megaphone, Plus, Send, ShieldCheck } from "lucide-react";
import { htApi } from "~/lib/ht-api";
import type { PlatformOverview } from "~/lib/domain.types";
import { cn } from "~/lib/utils";

type Tab = "cms" | "campaigns" | "compliance" | "settings";

export default function ConsolePlatform() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [tab, setTab] = useState<Tab>("cms");
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const r = await htApi.adminPlatform();
    setData(r.success && r.data ? r.data : {
      banners: [], contentPages: [], templates: [], campaigns: [], compliance: [],
      featureFlags: {}, marketConfig: {}, otpPolicy: {}, incidents: [],
    });
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => ({
    activeBanners: data?.banners.filter((b) => b.enabled).length ?? 0,
    campaigns: data?.campaigns.length ?? 0,
    pendingCompliance: data?.compliance.filter((c) => c.status !== "done").length ?? 0,
    flags: Object.keys(data?.featureFlags ?? {}).length,
  }), [data]);

  return (
    <div>
      <div>
        <h1 className="font-serif-display text-2xl font-bold">Growth & Compliance</h1>
        <p className="text-sm text-[#6F6258]">CMS, notification templates, campaigns, UU PDP queue, feature flags, market config, and incidents.</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <Metric label="Active banners" value={counts.activeBanners} icon={<Megaphone className="h-4 w-4" />} />
        <Metric label="Campaigns" value={counts.campaigns} icon={<Bell className="h-4 w-4" />} />
        <Metric label="Compliance queue" value={counts.pendingCompliance} icon={<ShieldCheck className="h-4 w-4" />} />
        <Metric label="Feature flags" value={counts.flags} icon={<Flag className="h-4 w-4" />} />
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto border-b border-[#EFE6D8]">
        {[
          ["cms", "CMS"],
          ["campaigns", "Campaigns"],
          ["compliance", "Compliance"],
          ["settings", "Settings"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as Tab)} className={cn("border-b-2 px-3 py-2 text-sm font-semibold", tab === key ? "border-[#C62828] text-[#C62828]" : "border-transparent text-[#6F6258]")}>{label}</button>
        ))}
      </div>

      {!data ? <div className="mt-5 h-80 animate-pulse rounded-2xl bg-[#FBF7F0]" /> : (
        <div className="mt-5">
          {tab === "cms" && <CmsPanel data={data} reload={load} busy={busy} setBusy={setBusy} />}
          {tab === "campaigns" && <CampaignPanel data={data} reload={load} busy={busy} setBusy={setBusy} />}
          {tab === "compliance" && <CompliancePanel data={data} reload={load} busy={busy} setBusy={setBusy} />}
          {tab === "settings" && <SettingsPanel data={data} reload={load} busy={busy} setBusy={setBusy} />}
        </div>
      )}
    </div>
  );
}

function CmsPanel({ data, reload, busy, setBusy }: PanelProps) {
  const [content, setContent] = useState(data.contentPages[0] ?? { key: "faq", title: "", body: "" });
  const [template, setTemplate] = useState(data.templates[0] ?? { key: "birthday_perk", category: "marketing", title: "", body: "", transactional: false });
  const [banner, setBanner] = useState({ title: "", imageUrl: "", caption: "", deepLink: "/app/rewards", priority: 10, country: "ID", enabled: true });

  const saveContent = async () => {
    setBusy("content");
    const r = await htApi.adminUpsertContent(content.key, content);
    setBusy(null);
    if (r.success) reload(); else alert(r.message ?? "Content save failed");
  };
  const saveTemplate = async () => {
    setBusy("template");
    const r = await htApi.adminUpsertTemplate(template.key, template);
    setBusy(null);
    if (r.success) reload(); else alert(r.message ?? "Template save failed");
  };
  const createBanner = async () => {
    setBusy("banner");
    const r = await htApi.adminCreateCampaign ? await fetchBanner(banner) : { success: false, message: "Unavailable" };
    setBusy(null);
    if (r.success) {
      setBanner({ title: "", imageUrl: "", caption: "", deepLink: "/app/rewards", priority: 10, country: "ID", enabled: true });
      reload();
    } else alert(r.message ?? "Banner create failed");
  };

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Section title="Hero banners" icon={<Megaphone className="h-4 w-4" />}>
        <div className="space-y-2">
          {data.banners.map((b) => <Row key={b.id} title={b.title} meta={`${b.country || "All"} · priority ${b.priority} · ${b.enabled ? "enabled" : "disabled"}`} />)}
        </div>
        <div className="mt-4 space-y-2">
          <input value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} placeholder="Banner title" className={inputCls} />
          <input value={banner.imageUrl} onChange={(e) => setBanner({ ...banner, imageUrl: e.target.value })} placeholder="16:9 image URL" className={inputCls} />
          <input value={banner.deepLink} onChange={(e) => setBanner({ ...banner, deepLink: e.target.value })} placeholder="/app/rewards" className={inputCls} />
          <button onClick={createBanner} disabled={!banner.title || busy === "banner"} className={primaryCls}><Plus className="h-4 w-4" /> Create banner</button>
        </div>
      </Section>

      <Section title="Content pages" icon={<FileText className="h-4 w-4" />}>
        <select value={content.key} onChange={(e) => setContent(data.contentPages.find((p) => p.key === e.target.value) ?? content)} className={inputCls}>
          {data.contentPages.map((p) => <option key={p.key} value={p.key}>{p.title}</option>)}
        </select>
        <input value={content.title} onChange={(e) => setContent({ ...content, title: e.target.value })} className={inputCls} />
        <textarea value={content.body} onChange={(e) => setContent({ ...content, body: e.target.value })} rows={8} className={inputCls} />
        <button onClick={saveContent} disabled={busy === "content"} className={primaryCls}><CheckCircle2 className="h-4 w-4" /> Save content</button>
      </Section>

      <Section title="Notification templates" icon={<Bell className="h-4 w-4" />}>
        <select value={template.key} onChange={(e) => setTemplate(data.templates.find((t) => t.key === e.target.value) ?? template)} className={inputCls}>
          {data.templates.map((t) => <option key={t.key} value={t.key}>{t.key}</option>)}
        </select>
        <input value={template.title} onChange={(e) => setTemplate({ ...template, title: e.target.value })} className={inputCls} />
        <textarea value={template.body} onChange={(e) => setTemplate({ ...template, body: e.target.value })} rows={8} className={inputCls} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!template.transactional} onChange={(e) => setTemplate({ ...template, transactional: e.target.checked })} className="accent-[#C62828]" /> Transactional</label>
        <button onClick={saveTemplate} disabled={busy === "template"} className={primaryCls}><CheckCircle2 className="h-4 w-4" /> Save template</button>
      </Section>
    </div>
  );
}

async function fetchBanner(data: any) {
  return fetch("/api/admin/banners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).then((r) => r.json());
}

function CampaignPanel({ data, reload, busy, setBusy }: PanelProps) {
  const [draft, setDraft] = useState({ name: "", category: "birthday", title: "", body: "", tier: "", throttlePerHour: 1000 });
  const create = async () => {
    setBusy("campaign");
    const r = await htApi.adminCreateCampaign({ ...draft, segment: draft.tier ? { tier: draft.tier } : {} });
    setBusy(null);
    if (r.success) {
      setDraft({ name: "", category: "birthday", title: "", body: "", tier: "", throttlePerHour: 1000 });
      reload();
    } else alert(r.message ?? "Campaign create failed");
  };
  const send = async (id: string) => {
    setBusy(id);
    const r = await htApi.adminSendCampaign(id);
    setBusy(null);
    if (r.success) reload(); else alert(r.message ?? "Campaign send failed");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Section title="Campaign builder" icon={<Bell className="h-4 w-4" />}>
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Campaign name" className={inputCls} />
        <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Push title" className={inputCls} />
        <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Push body" rows={4} className={inputCls} />
        <select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value })} className={inputCls}>
          <option value="">All opted-in members</option><option value="seeker">Seeker</option><option value="explorer">Explorer</option><option value="pioneer">Pioneer</option><option value="master">Master</option>
        </select>
        <button onClick={create} disabled={!draft.title || busy === "campaign"} className={primaryCls}><Plus className="h-4 w-4" /> Create draft</button>
      </Section>
      <Section title="Delivery analytics" icon={<Send className="h-4 w-4" />}>
        <div className="grid gap-3 md:grid-cols-2">
          {data.campaigns.length === 0 ? <p className="text-sm text-[#6F6258]">No campaigns yet.</p> : data.campaigns.map((c) => (
            <div key={c.id} className="rounded-xl bg-[#FBF7F0] p-3">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-semibold">{c.name}</p><p className="text-xs text-[#6F6258]">{c.status} · {c.category}</p></div>
                {c.status !== "sent" && <button onClick={() => send(c.id)} disabled={busy === c.id} className="rounded-lg bg-[#3E2723] px-2.5 py-1.5 text-xs font-semibold text-white">Send</button>}
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
                {["sent", "delivered", "opened", "converted"].map((k) => <span key={k}>{k}<b className="block tabular-nums">{c.analytics?.[k] ?? 0}</b></span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CompliancePanel({ data, reload, busy, setBusy }: PanelProps) {
  const [manual, setManual] = useState({ userId: "", type: "export" as "export" | "deletion", reason: "" });
  const create = async () => {
    setBusy("manual");
    const r = await htApi.adminCreateComplianceRequest(manual);
    setBusy(null);
    if (r.success) { setManual({ userId: "", type: "export", reason: "" }); reload(); } else alert(r.message ?? "Request failed");
  };
  const process = async (id: string) => {
    setBusy(id);
    const r = await htApi.adminProcessCompliance(id);
    setBusy(null);
    if (r.success) reload(); else alert(r.message ?? "Processing failed");
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <Section title="Manual request" icon={<ShieldCheck className="h-4 w-4" />}>
        <input value={manual.userId} onChange={(e) => setManual({ ...manual, userId: e.target.value })} placeholder="Member user id" className={inputCls} />
        <select value={manual.type} onChange={(e) => setManual({ ...manual, type: e.target.value as any })} className={inputCls}><option value="export">Data export</option><option value="deletion">Deletion</option></select>
        <input value={manual.reason} onChange={(e) => setManual({ ...manual, reason: e.target.value })} placeholder="Reason" className={inputCls} />
        <button onClick={create} disabled={!manual.userId || busy === "manual"} className={primaryCls}><Plus className="h-4 w-4" /> Queue request</button>
      </Section>
      <Section title="UU PDP queue" icon={<ShieldCheck className="h-4 w-4" />}>
        <div className="space-y-2">
          {data.compliance.length === 0 ? <p className="text-sm text-[#6F6258]">No compliance requests.</p> : data.compliance.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#FBF7F0] p-3">
              <div><p className="font-semibold">{r.type} · {r.status}</p><p className="text-xs text-[#6F6258]">{r.userId} · {r.reason || "No reason"}</p></div>
              {r.status !== "done" && <button onClick={() => process(r.id)} disabled={busy === r.id} className="rounded-lg bg-[#C62828] px-2.5 py-1.5 text-xs font-semibold text-white">Process</button>}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SettingsPanel({ data, reload, busy, setBusy }: PanelProps) {
  const [incident, setIncident] = useState({ message: "", severity: "info", enabled: true });
  const [auditFilters, setAuditFilters] = useState({ action: "", entity: "" });
  const [auditRows, setAuditRows] = useState<any[]>([]);
  const toggleFlag = async (key: string, flag: any) => {
    setBusy(key);
    const r = await htApi.adminUpdatePlatformSettings({ featureFlags: { [key]: { ...flag, enabled: !flag.enabled, approvalStatus: "approved" } }, reason: "Console toggle" });
    setBusy(null);
    if (r.success) reload(); else alert(r.message ?? "Flag update failed");
  };
  const saveIncident = async () => {
    setBusy("incident");
    const r = await htApi.adminUpsertIncident(incident);
    setBusy(null);
    if (r.success) { setIncident({ message: "", severity: "info", enabled: true }); reload(); } else alert(r.message ?? "Incident save failed");
  };
  const searchAudit = async () => {
    setBusy("audit");
    const r = await htApi.adminAudit(Object.fromEntries(Object.entries(auditFilters).filter(([, v]) => v)));
    setBusy(null);
    if (r.success && r.data) setAuditRows(r.data);
    else alert(r.message ?? "Audit search failed");
  };
  const auditExport = `/api/admin/audit/export?${new URLSearchParams(Object.fromEntries(Object.entries(auditFilters).filter(([, v]) => v))).toString()}`;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Section title="Feature flags" icon={<Flag className="h-4 w-4" />}>
        <div className="space-y-2">
          {Object.entries(data.featureFlags).map(([key, flag]) => (
            <button key={key} onClick={() => toggleFlag(key, flag)} disabled={busy === key} className="flex w-full items-center justify-between rounded-xl bg-[#FBF7F0] px-3 py-2 text-left">
              <span><span className="block text-sm font-semibold">{flag.label ?? key}</span><span className="text-xs text-[#6F6258]">{flag.market ?? "global"} · {flag.approvalStatus}</span></span>
              <span className={cn("h-5 w-9 rounded-full p-0.5", flag.enabled ? "bg-[#2E7D32]" : "bg-[#D5C8B5]")}><span className={cn("block h-4 w-4 rounded-full bg-white transition", flag.enabled ? "translate-x-4" : "")} /></span>
            </button>
          ))}
        </div>
      </Section>
      <Section title="Market config" icon={<FileText className="h-4 w-4" />}>
        {Object.entries(data.marketConfig).map(([key, cfg]) => <Row key={key} title={`${cfg.country} · ${cfg.currency}`} meta={(cfg.paymentMethods ?? []).join(", ")} />)}
        <Row title="OTP policy" meta={`${data.otpPolicy.maxAttempts ?? 5} attempts · ${data.otpPolicy.lockoutMinutes ?? 15}m lockout`} />
      </Section>
      <Section title="Incident banners" icon={<Megaphone className="h-4 w-4" />}>
        <input value={incident.message} onChange={(e) => setIncident({ ...incident, message: e.target.value })} placeholder="Maintenance message" className={inputCls} />
        <select value={incident.severity} onChange={(e) => setIncident({ ...incident, severity: e.target.value })} className={inputCls}><option>info</option><option>warning</option><option>critical</option></select>
        <button onClick={saveIncident} disabled={!incident.message || busy === "incident"} className={primaryCls}><Plus className="h-4 w-4" /> Publish incident</button>
        <div className="mt-3 space-y-2">{data.incidents.map((i) => <Row key={i.id} title={i.message} meta={`${i.severity} · ${i.enabled ? "enabled" : "disabled"}`} />)}</div>
      </Section>
      <section className="rounded-2xl border border-[#EFE6D8] bg-white p-4 lg:col-span-3">
        <div className="mb-3 flex items-center gap-2 font-semibold"><ShieldCheck className="h-4 w-4" />Global audit log</div>
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto_auto]">
          <input value={auditFilters.action} onChange={(e) => setAuditFilters({ ...auditFilters, action: e.target.value })} placeholder="Action contains" className={inputCls} />
          <input value={auditFilters.entity} onChange={(e) => setAuditFilters({ ...auditFilters, entity: e.target.value })} placeholder="Entity" className={inputCls} />
          <button onClick={searchAudit} disabled={busy === "audit"} className="rounded-xl bg-[#3E2723] px-3.5 py-2 text-sm font-semibold text-white">Search</button>
          <a href={auditExport} className="rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-2 text-center text-sm font-semibold">CSV</a>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {auditRows.length === 0 ? <p className="text-sm text-[#6F6258]">Run a search to inspect sensitive admin actions.</p> : auditRows.slice(0, 20).map((l) => (
            <Row key={l.id} title={`${l.action} · ${l.entity}`} meta={`${l.actorRole} · ${new Date(l.at).toLocaleString()} · ${l.reason || "no reason"}`} />
          ))}
        </div>
      </section>
    </div>
  );
}

type PanelProps = { data: PlatformOverview; reload: () => void; busy: string | null; setBusy: (v: string | null) => void };
const inputCls = "w-full rounded-xl border border-[#E0D4C2] bg-white px-3 py-2 text-sm outline-none focus:border-[#C62828]";
const primaryCls = "inline-flex items-center justify-center gap-2 rounded-xl bg-[#C62828] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50";

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <div className="rounded-2xl border border-[#EFE6D8] bg-white p-4"><div className="flex items-center justify-between text-[#6F6258]"><p className="text-xs font-bold uppercase tracking-wide">{label}</p>{icon}</div><p className="mt-1 font-serif-display text-2xl font-bold tabular-nums">{value}</p></div>;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#EFE6D8] bg-white p-4"><div className="mb-3 flex items-center gap-2 font-semibold">{icon}{title}</div><div className="space-y-3">{children}</div></section>;
}

function Row({ title, meta }: { title: string; meta: string }) {
  return <div className="rounded-xl bg-[#FBF7F0] px-3 py-2"><p className="truncate text-sm font-semibold">{title}</p><p className="truncate text-xs text-[#6F6258]">{meta}</p></div>;
}
