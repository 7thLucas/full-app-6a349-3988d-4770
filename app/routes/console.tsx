import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { LayoutGrid, UtensilsCrossed, Store, LogOut, Loader2, CreditCard, BarChart3, ShieldCheck } from "lucide-react";
import { useAuth } from "~/modules/authentication/use-authentication";
import { htApi } from "~/lib/ht-api";
import { cn } from "~/lib/utils";

export default function ConsoleLayout() {
  const { loading, isAuthenticated, isAdmin, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7]">
        <Loader2 className="h-6 w-6 animate-spin text-[#C62828]" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <ConsoleLogin />;
  }

  const nav = [
    { to: "/console", label: "Order Board", icon: LayoutGrid, end: true },
    { to: "/console/menu", label: "Menu & Catalog", icon: UtensilsCrossed },
    { to: "/console/outlets", label: "Outlets", icon: Store },
    { to: "/console/finance", label: "Finance", icon: CreditCard },
    { to: "/console/reports", label: "Reports", icon: BarChart3 },
    { to: "/console/platform", label: "Growth & Compliance", icon: ShieldCheck },
  ];

  const logout = async () => {
    await htApi.logout();
    window.location.href = "/console";
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#3E2723]">
      <div className="mx-auto flex max-w-6xl">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[#EFE6D8] bg-[#FBF7F0] px-4 py-6 md:flex">
          <div className="px-2">
            <p className="font-serif-display text-xl font-bold">Hong Tang</p>
            <p className="text-xs text-[#6F6258]">Operations Console</p>
          </div>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-[#C62828] text-white" : "text-[#6F6258] hover:bg-[#F2EADD]",
                  )
                }
              >
                <n.icon className="h-4.5 w-4.5" /> {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-[#EFE6D8] pt-3">
            <p className="px-3 text-xs text-[#6F6258]">{user?.email}</p>
            <button
              onClick={logout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#C62828] hover:bg-[#F2EADD]"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Mobile top tabs */}
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#EFE6D8] bg-[#FDFBF7]/95 px-4 py-3 backdrop-blur md:hidden">
            <p className="font-serif-display text-lg font-bold">Hong Tang Console</p>
            <button onClick={logout} className="text-[#C62828]">
              <LogOut className="h-5 w-5" />
            </button>
          </header>
          <div className="flex gap-2 overflow-x-auto border-b border-[#EFE6D8] px-4 py-2 md:hidden">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium",
                    isActive ? "bg-[#C62828] text-white" : "bg-[#F2EADD] text-[#6F6258]",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>

          <main key={location.pathname} className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function ConsoleLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await htApi.adminLogin(email.trim().toLowerCase(), password);
    setBusy(false);
    if (res.success) {
      window.location.href = "/console";
    } else {
      setError(res.message ?? "Sign in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFBF7] px-4 text-[#3E2723]">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-[#EFE6D8] bg-white p-7 shadow-sm">
        <p className="font-serif-display text-2xl font-bold">Hong Tang</p>
        <p className="text-sm text-[#6F6258]">Operations Console sign-in</p>

        {error && (
          <div className="mt-4 rounded-xl bg-[#C62828]/10 px-4 py-3 text-sm font-medium text-[#C62828]">{error}</div>
        )}

        <label className="mt-5 block text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="ops@hongtang.id"
          className="mt-1.5 w-full rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#C62828]"
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="mt-1.5 w-full rounded-xl border border-[#E0D4C2] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#C62828]"
        />

        <button
          type="submit"
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#C62828] py-3 text-sm font-semibold text-white transition active:scale-[0.985] disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-center text-xs text-[#6F6258]">Staff access only. Use your operations credentials.</p>
      </form>
    </div>
  );
}
