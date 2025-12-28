import { House, LayoutDashboard, ClipboardList, Settings } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2 font-bold text-xl border-b border-slate-800">
          <House className="text-amber-500" />
          <span>Builder</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={false} />
          <NavItem icon={<ClipboardList size={20} />} label="Requests" active={true} />
          <NavItem icon={<Settings size={20} />} label="Settings" active={false} />
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
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer ${
        active ? "bg-amber-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}
