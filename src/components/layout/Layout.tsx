import { House, LayoutDashboard, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut({ scope: "local" });

    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-slate-800">
          <House className="text-amber-500" />
          <span>Builder</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={true} />
          <NavItem
            icon={<LogOut size={20} />}
            label="Sign Out"
            active={false}
            onClick={handleSignOut}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-700">Material Requests</h2>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
              John
            </div>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${active ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
