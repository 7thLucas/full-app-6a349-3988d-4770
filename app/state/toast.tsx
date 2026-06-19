import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Bell } from "lucide-react";

interface Toast {
  id: number;
  title: string;
  body?: string;
}

interface ToastCtx {
  notify: (title: string, body?: string) => void;
}

const Ctx = createContext<ToastCtx | null>(null);
let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((title: string, body?: string) => {
    const id = nextId++;
    setToasts((t) => [...t, { id, title, body }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <Ctx.Provider value={{ notify }}>
      {children}
      <div className="fixed top-0 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="ht-fade-in w-full max-w-md flex items-start gap-3 rounded-2xl bg-primary text-primary-foreground px-4 py-3 shadow-lg"
            role="status"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent">
              <Bell className="h-4 w-4 text-accent-foreground" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{t.title}</p>
              {t.body && <p className="text-xs opacity-80 mt-0.5">{t.body}</p>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
