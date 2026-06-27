"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { HeartPulse, ShieldCheck, Stethoscope, CalendarDays, ClipboardList } from "lucide-react";

export default function Home() {
  const { data: session } = authClient.useSession();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      {/* HEADER NAVBAR */}
      <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 font-black text-primary">
          <HeartPulse size={24} />
          <span className="tracking-tight text-foreground">MediCare Connect</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8 py-16 max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-2xs font-bold uppercase tracking-wider rounded-xs">
            <ShieldCheck size={12} />
            Secure Healthcare Management System
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight max-w-3xl">
            Hospital appointments & <span className="text-primary">expert healthcare</span> managed seamlessly.
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            MediCare Connect provides patients with direct scheduling to approved specialists, secure billing audits, and direct medical prescription downloads.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          {session ? (
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Open Dashboard Portal
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Open Patient File
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Access Portal
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-10 border-t border-border/80">
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center border border-primary/20 rounded-xs mb-3">
              <Stethoscope size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Approved Specialists</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Directly consult with licensed specialists across verified clinical specialties.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20 rounded-xs mb-3">
              <CalendarDays size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Instant Scheduling</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Book consultations, check billing lists, and coordinate care schedules.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 rounded-xs mb-3">
              <ClipboardList size={20} />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">Direct Prescriptions</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              Retrieve medications, instructions, and advisory details from doctors.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="h-14 border-t border-border bg-card/20 flex items-center justify-center px-6 text-2xs text-muted-foreground font-semibold uppercase tracking-wider">
        &copy; {new Date().getFullYear()} MediCare Connect Inc. All rights reserved.
      </footer>
    </div>
  );
}
