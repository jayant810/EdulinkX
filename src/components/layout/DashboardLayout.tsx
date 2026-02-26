import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useAuth } from "@/auth/AuthProvider";

interface SidebarLink {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarLinks?: SidebarLink[];
  userInfo?: {
    name: string;
    id: string;
    initials: string;
    gradientFrom?: string;
    gradientTo?: string;
  };
  title: string;
  subtitle: string;
  headerActions?: React.ReactNode;
}

export const DashboardLayout = ({
  children,
  sidebarLinks: customSidebarLinks,
  userInfo: customUserInfo,
  title,
  subtitle,
  headerActions,
}: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const defaultSidebarLinks = useSidebarLinks();
  const defaultUserInfo = useUserInfo();

  const sidebarLinks = customSidebarLinks || defaultSidebarLinks;
  const userInfo = customUserInfo || defaultUserInfo;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-info">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold font-display">EdulinkX</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-sidebar-accent"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-semibold",
                  `bg-gradient-to-r ${userInfo.gradientFrom || "from-primary"} ${userInfo.gradientTo || "to-info"}`
                )}
              >
                {userInfo.initials}
              </div>
              <div>
                <div className="font-medium text-sm">{userInfo.name}</div>
                <div className="text-xs text-sidebar-foreground/60">{userInfo.id}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {sidebarLinks.map((link) => (
                <li key={link.label}>
                  <NavLink
                    to={link.href}
                    end={link.href.split('/').length <= 3}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    activeClassName="bg-sidebar-primary text-sidebar-primary-foreground"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-muted"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold font-display">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center gap-3">{headerActions}</div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
};