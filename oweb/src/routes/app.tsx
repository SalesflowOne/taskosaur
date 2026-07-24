import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { getSessionUser } from "@/lib/pm";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/app")({
  beforeLoad: async () => {
    const user = await getSessionUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: AppShell,
});

function AppShell() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--ts-moss)]/10 bg-white/50 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Link to="/app" className="font-display text-xl font-bold text-[var(--ts-moss)]">
              Taskosaur
            </Link>
            <nav className="hidden text-sm font-semibold text-[var(--ts-ink)]/70 sm:flex sm:gap-4">
              <Link to="/app" className="hover:text-[var(--ts-forest)]">
                Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-[var(--ts-ink)]/60 sm:inline">
              {user.email}
            </span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-md border border-[var(--ts-moss)]/20 px-3 py-1.5 font-semibold"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
