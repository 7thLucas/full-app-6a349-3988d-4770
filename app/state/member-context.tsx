import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setMember(null);
      setLoading(false);
      return;
    }
    const res = await htApi.member();
    if (res.success && res.data) setMember(res.data);
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
