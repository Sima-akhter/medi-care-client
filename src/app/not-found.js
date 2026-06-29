"use client";

import Link from "next/link";
import { HeartPulse, Home, Stethoscope } from "lucide-react";
import Button from "@/components/Button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />
      
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-xl mx-auto space-y-6">
        {/* SVG Illustration */}
        <div className="relative w-48 h-48 bg-primary/5 border border-primary/10 rounded-xs flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
          <div className="relative flex flex-col items-center text-primary/80">
            <Stethoscope size={72} className="animate-pulse" />
            <span className="text-3xl font-black mt-2 font-mono">404</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-2xs font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-2.5 py-1.5 rounded-xs">
            Diagnostics Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-4">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            We checked our healthcare database, but the medical record, dashboard file, or clinical page you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-4">
          <Link href="/">
            <Button variant="primary" className="flex items-center justify-center gap-2 px-6">
              <Home size={15} />
              Back to Home Desk
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
