"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiRequest, getCookie, setCookie } from "@/lib/api-client";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isJWPending, setIsJWPending] = useState(true);

  useEffect(() => {
    const checkJWT = async () => {
      if (isPending) return;

      if (!session) {
        setIsJWPending(false);
        return;
      }

      const jwtToken = getCookie("jwt_token");
      if (!jwtToken) {
        try {
          const res = await apiRequest("/auth/jwt", {
            method: "POST",
            body: JSON.stringify({
              email: session.user.email,
              name: session.user.name,
              role: session.user.role || "patient"
            })
          });

          if (res.success && res.token) {
            setCookie("jwt_token", res.token, 7);
          } else {
            throw new Error("Failed token exchange.");
          }
        } catch (err) {
          toast.error("Auth server connection failed. Please log in again.");
          await authClient.signOut();
          router.push("/login");
          return;
        }
      }
      setIsJWPending(false);
    };

    checkJWT();
  }, [session, isPending, router]);

  if (isPending || isJWPending) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary mb-3" size={32} />
        <span className="text-sm font-semibold text-muted-foreground">Checking authentication...</span>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const user = {
    ...session.user,
    role: session.user.role || "patient"
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-150">
      <Sidebar
        role={user.role}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
