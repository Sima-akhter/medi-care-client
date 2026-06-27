"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import { HeartPulse, Menu, X, ChevronDown, LayoutDashboard, User, LogOut, Shield } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import Button from "./Button";
import Badge from "./Badge";
import toast from "react-hot-toast";

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Find Doctors", href: "/doctors" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50 transition-colors duration-150">
      <div className="max-w-full mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 font-black text-primary hover:opacity-90">
          <HeartPulse size={24} />
          <span className="tracking-tight text-foreground font-black">MediCare Connect</span>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                isActive(link.href) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {user ? (
            /* Logged In: Profile Dropdown */
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 hover:bg-muted text-foreground rounded-xs transition-colors focus:outline-none cursor-pointer"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-7 h-7 object-cover border border-border rounded-xs"
                  />
                ) : (
                  <div className="w-7 h-7 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs rounded-xs">
                    {user.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                )}
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border shadow-md py-2 z-20 rounded-xs animate-in fade-in slide-in-from-top-1 duration-100">
                    <div className="px-4 py-2 border-b border-border mb-1">
                      <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate mb-1">{user.email}</p>
                      <Badge variant={user.role === "admin" ? "danger" : user.role === "doctor" ? "success" : "primary"}>
                        {user.role}
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
                      My Profile
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
          ) : (
            /* Logged Out: Sign In & Register */
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TRIGGER & TOGGLE */}
        <div className="flex md:hidden items-center gap-4">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 hover:bg-muted text-foreground rounded-xs cursor-pointer focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU DRAWER */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-16 right-0 w-64 bg-card border-l border-border h-[calc(100vh-4rem)] p-6 z-50 md:hidden flex flex-col justify-between shadow-lg animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              {user && (
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-9 h-9 object-cover border border-border rounded-xs"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm rounded-xs">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{user.name}</p>
                    <span className="text-3xs text-muted-foreground uppercase font-black tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                      isActive(link.href) ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                      isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </nav>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              {user ? (
                <>
                  <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2">
                      <User size={14} />
                      My Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive hover:bg-destructive/10 flex items-center justify-center gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={14} />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full">
                      Register
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}
