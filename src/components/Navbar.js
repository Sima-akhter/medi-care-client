"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import { Menu, User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Badge from "./Badge";
import toast from "react-hot-toast";

export default function Navbar({ user, onMenuClick }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground lg:hidden rounded-xs cursor-pointer"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-bold text-foreground capitalize hidden md:inline-block">
          Welcome back, {user?.name || "User"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-muted text-foreground rounded-xs transition-colors focus:outline-none cursor-pointer"
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-7 h-7 object-cover border border-border rounded-xs"
              />
            ) : (
              <div className="w-7 h-7 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs rounded-xs">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <ChevronDown size={14} className="text-muted-foreground" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-md py-2 z-20 rounded-xs animate-in fade-in slide-in-from-top-1 duration-100">
                <div className="px-4 py-2 border-b border-border mb-1">
                  <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate mb-1">{user?.email}</p>
                  <Badge variant={user?.role === "admin" ? "danger" : user?.role === "doctor" ? "success" : "primary"}>
                    {user?.role}
                  </Badge>
                </div>
                
                <Link
                  href="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <User size={15} />
                  Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
