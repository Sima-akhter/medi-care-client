"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  History,
  FileText,
  Users,
  ShieldCheck,
  Star,
  LogOut,
  X,
  Stethoscope
} from "lucide-react";
import toast from "react-hot-toast";

export default function Sidebar({ role, isOpen, setIsOpen }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      await apiRequest("/auth/logout", { method: "POST" });
      toast.success("Successfully logged out.");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Logout failed.");
    }
  };

  const getLinks = () => {
    switch (role) {
      case "patient":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "My Appointments", href: "/dashboard/appointments", icon: CalendarDays },
          { name: "Payment History", href: "/dashboard/payments", icon: History },
          { name: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText },
          { name: "Profile", href: "/dashboard/profile", icon: User }
        ];
      case "doctor":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Schedules", href: "/dashboard/appointments", icon: CalendarDays },
          { name: "Prescriptions", href: "/dashboard/prescriptions", icon: FileText },
          { name: "Reviews", href: "/dashboard/reviews", icon: Star },
          { name: "Profile", href: "/dashboard/profile", icon: User }
        ];
      case "admin":
        return [
          { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { name: "Users", href: "/dashboard/users", icon: Users },
          { name: "Verifications", href: "/dashboard/verifications", icon: ShieldCheck },
          { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
          { name: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
          { name: "Profile", href: "/dashboard/profile", icon: User }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 bg-card border-r border-border w-64 z-40 transform transition-transform duration-200 ease-in-out flex flex-col lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-card">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-primary">
            <Stethoscope size={22} />
            <span className="tracking-tight text-foreground font-black">MediCare</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground lg:hidden rounded-xs cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            // Strict check for active state:
            // /dashboard is only active if the path is exactly /dashboard (not followed by anything else)
            // other paths are active if the path starts with the link href
            const isActive = link.href === "/dashboard" 
              ? pathname === "/dashboard"
              : pathname === link.href || pathname.startsWith(link.href + "/");

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xs transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-destructive hover:bg-destructive/10 rounded-xs transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
