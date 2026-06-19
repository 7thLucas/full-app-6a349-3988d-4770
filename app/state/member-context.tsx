import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { htApi, type MemberDto } from "~/lib/ht-api";
import { useAuth } from "~/modules/authentication/use-authentication";

interface MemberCtx {
  member: MemberDto | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const Ctx = createContext<MemberCtx | null>(null);

export function MemberProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [member, setMember] = useState<MemberDto | null>(null);
  const [loading, setLoading] = useState(true);

  const deviceRegistered = useRef(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setMember(null);
      setLoading(false);
      return;
    }
    const res = await htApi.member();
    if (res.success && res.data) {
      setMember(res.data);
      // Register a push device token once per session (Sprint 6).
      if (!deviceRegistered.current) {
        deviceRegistered.current = true;
        let token = "";
        try {
          token = localStorage.getItem("ht_device_token") ?? "";
          if (!token) {
            token = "web-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
            localStorage.setItem("ht_device_token", token);
          }
        } catch {
          token = "web-ephemeral";
        }
        htApi.registerDevice(token, "web").catch(() => {});
      }
    }
    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refresh();
  }, [authLoading, refresh]);

  return <Ctx.Provider value={{ member, loading, refresh }}>{children}</Ctx.Provider>;
}

export function useMember(): MemberCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMember must be used within MemberProvider");
  return ctx;
}
