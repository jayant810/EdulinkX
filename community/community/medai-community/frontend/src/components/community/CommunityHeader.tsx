import { Link, useLocation } from "react-router-dom";
import { MessageCircle, PenSquare, Settings, Shield, Trophy } from "lucide-react";

const navItems = [
  { to: "/community", label: "Feed", icon: MessageCircle },
  { to: "/community/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/settings/community", label: "Settings", icon: Settings },
  { to: "/admin/community", label: "Admin", icon: Shield },
];

const linkBase =
  "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-white/10 hover:text-white";

const activeLink = "bg-white/15 text-white shadow";
const inactiveLink = "text-white/80";

export function CommunityHeader() {
  const location = useLocation();

  return (
    <header className="gradient-dark text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/70">MedAI</p>
          <h1 className="text-2xl font-semibold">Community</h1>
          <p className="text-sm text-white/80">
            Ask questions, share answers, and earn reputation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.to ||
              location.pathname.startsWith(`${item.to}/`);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`${linkBase} ${isActive ? activeLink : inactiveLink}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/community/ask"
            className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100"
          >
            <PenSquare size={16} />
            Ask a Question
          </Link>
        </div>
      </div>
    </header>
  );
}
