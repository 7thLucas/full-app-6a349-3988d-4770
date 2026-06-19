import { Outlet, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { useAuth } from "~/modules/authentication/use-authentication";
import { AppStoreProvider } from "~/state/app-store";
import { MemberProvider, useMember } from "~/state/member-context";
import { ToastProvider } from "~/state/toast";
import { BottomNav } from "~/components/app/phone-shell";

function Guard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const { member, loading: memberLoading } = useMember();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/onboarding", { replace: true });
      return;
    }
    // Authenticated but profile not completed → finish onboarding
    if (!memberLoading && member && !member.onboarded) {
      if (!location.pathname.startsWith("/onboarding")) {
        navigate("/onboarding?step=profile", { replace: true });
      }
    }
  }, [isAuthenticated, loading, member, memberLoading, navigate, location.pathname]);

  if (loading || (isAuthenticated && memberLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="ht-skeleton h-12 w-12 rounded-full" />
      </div>
    );
  }
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

function AnimatedOutlet() {
  const location = useLocation();
  // Re-key on the route segment so each navigation replays the page-in motion
  return (
    <div key={location.pathname} className="ht-page">
      <Outlet />
    </div>
  );
}

export default function AppLayout() {
  return (
    <AppStoreProvider>
      <MemberProvider>
        <ToastProvider>
          <div className="min-h-screen w-full bg-[#EDE3D4] flex justify-center">
            <div className="relative w-full max-w-md bg-background min-h-screen shadow-xl">
              <Guard>
                <main className="pb-28">
                  <AnimatedOutlet />
                </main>
                <BottomNav />
              </Guard>
            </div>
          </div>
        </ToastProvider>
      </MemberProvider>
    </AppStoreProvider>
  );
}
