import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Phone, MessageCircle, ChevronLeft, Sparkles } from "lucide-react";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication/use-authentication";
import { htApi } from "~/lib/ht-api";
import { Button, Card } from "~/components/ui/primitives";
import { cn } from "~/lib/utils";

type Step = "phone" | "otp" | "profile";

export default function Onboarding() {
  const { config } = useConfigurables();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState<Step>("phone");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState("");
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [referredBy, setReferredBy] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    // If arriving already-authenticated and only profile remains
    if (!loading && isAuthenticated && params.get("step") === "profile") {
      setStep("profile");
    }
  }, [loading, isAuthenticated, params]);

  const submitPhone = async () => {
    setError("");
    setBusy(true);
    const res = await htApi.requestOtp(phone, channel);
    setBusy(false);
    if (!res.success || !res.data) {
      setError(res.message ?? "Could not send code");
      return;
    }
    setPhone(res.data.phone);
    setDevCode(res.data.devCode);
    setIsNew(res.data.isNewUser);
    setStep("otp");
  };

  const submitOtp = async () => {
    setError("");
    setBusy(true);
    const res = await htApi.verifyOtp(phone, code);
    setBusy(false);
    if (!res.success || !res.data) {
      setError(res.message ?? "Verification failed");
      return;
    }
    if (res.data.isNewUser) {
      setStep("profile");
    } else {
      window.location.href = "/app";
    }
  };

  const submitProfile = async () => {
    setError("");
    setBusy(true);
    const res = await htApi.completeProfile({
      name,
      birthday: birthday || null,
      referredBy: referredBy.trim() || null,
    });
    setBusy(false);
    if (!res.success) {
      setError(res.message ?? "Could not save profile");
      return;
    }
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen w-full bg-[#EDE3D4] flex justify-center">
      <div className="relative w-full max-w-md bg-background min-h-screen shadow-xl flex flex-col">
        {/* Hero */}
        <div className="relative h-[38vh] min-h-[260px] overflow-hidden bg-primary">
          <img
            src={`https://api.qb-deck.quantumbyte.ai/common/image-generation?prompt=${encodeURIComponent(
              "premium minimalist oriental dessert flatlay, brown sugar pearls, warm cream tones, editorial food photography",
            )}`}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E9C9A3]">
              {config?.appName ?? "Hong Tang"}
            </p>
            <h1 className="font-serif-display text-2xl font-bold text-primary-foreground leading-tight mt-1">
              {config?.tagline ?? "Oriental Dessert Culture, Now in Your Pocket"}
            </h1>
          </div>
        </div>

        <div className="flex-1 px-6 pt-6 pb-10 ht-fade-in">
          {step === "phone" && (
            <>
              <h2 className="font-serif-display text-xl font-semibold text-foreground">Welcome</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your phone number — we'll send a one-time code. No passwords.
              </p>

              <div className="mt-5 flex gap-2">
                {(["whatsapp", "sms"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setChannel(c)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition-colors",
                      channel === c
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-[#E0D4C2] text-muted-foreground",
                    )}
                  >
                    {c === "whatsapp" ? <MessageCircle className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    {c === "whatsapp" ? "WhatsApp" : "SMS"}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm font-medium text-foreground">Phone number</label>
              <div className="mt-1.5 flex items-center rounded-xl border border-[#E0D4C2] bg-white px-3">
                <span className="text-muted-foreground text-sm">+62</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="812 3456 7890"
                  className="flex-1 bg-transparent px-2 py-3.5 text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}

              <Button full className="mt-6" onClick={submitPhone} disabled={busy || phone.length < 6}>
                {busy ? "Sending…" : "Send code"}
              </Button>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms & Privacy.
              </p>
            </>
          )}

          {step === "otp" && (
            <>
              <button onClick={() => setStep("phone")} className="-ml-1 mb-2 flex items-center text-sm text-muted-foreground">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="font-serif-display text-xl font-semibold text-foreground">Enter your code</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sent via {channel === "whatsapp" ? "WhatsApp" : "SMS"} to {phone}
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="mt-5 w-full rounded-xl border border-[#E0D4C2] bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] tabular-nums text-foreground outline-none focus:border-accent"
              />

              {devCode && (
                <Card className="mt-3 p-3">
                  <p className="text-xs text-muted-foreground">
                    Demo mode — your code is{" "}
                    <button
                      onClick={() => setCode(devCode)}
                      className="font-bold text-accent tabular-nums underline"
                    >
                      {devCode}
                    </button>{" "}
                    (tap to fill). A real SMS/WhatsApp gateway is configured later.
                  </p>
                </Card>
              )}
              {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}

              <Button full className="mt-6" onClick={submitOtp} disabled={busy || code.length < 4}>
                {busy ? "Verifying…" : "Verify & continue"}
              </Button>
              <button onClick={submitPhone} className="mt-4 w-full text-center text-sm text-muted-foreground">
                Resend code
              </button>
            </>
          )}

          {step === "profile" && (
            <>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                <Sparkles className="h-3.5 w-3.5" /> A welcome voucher is waiting
              </div>
              <h2 className="font-serif-display text-xl font-semibold text-foreground">Almost there</h2>
              <p className="mt-1 text-sm text-muted-foreground">Just your name to personalize your Loyal-Tang membership.</p>

              <label className="mt-5 block text-sm font-medium text-foreground">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="mt-1.5 w-full rounded-xl border border-[#E0D4C2] bg-white px-4 py-3.5 text-foreground outline-none focus:border-accent"
              />

              <label className="mt-4 block text-sm font-medium text-foreground">
                Birthday <span className="text-muted-foreground font-normal">(optional — for a birthday gift)</span>
              </label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-[#E0D4C2] bg-white px-4 py-3.5 text-foreground outline-none focus:border-accent"
              />

              {isNew && (
                <>
                  <label className="mt-4 block text-sm font-medium text-foreground">
                    Referral code <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    value={referredBy}
                    onChange={(e) => setReferredBy(e.target.value.toUpperCase())}
                    placeholder="TANG-XXXX"
                    className="mt-1.5 w-full rounded-xl border border-[#E0D4C2] bg-white px-4 py-3.5 text-foreground uppercase outline-none focus:border-accent"
                  />
                </>
              )}

              {error && <p className="mt-3 text-sm text-accent font-medium">{error}</p>}
              <Button full className="mt-6" onClick={submitProfile} disabled={busy || name.trim().length < 2}>
                {busy ? "Setting up…" : "Enter Hong Tang"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
