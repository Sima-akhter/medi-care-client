"use client";

import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/Card";
import { HeartPulse, ShieldCheck, Stethoscope, Award, Users, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const coreValues = [
    {
      title: "Specialist Validation",
      desc: "Every doctor listed on our platform is manually verified by clinical administrators to ensure licensing integrity.",
      icon: Award
    },
    {
      title: "Patient Data Safety",
      desc: "We enforce high-security standards for patient profiles, prescription downloads, and billing records.",
      icon: ShieldCheck
    },
    {
      title: "Direct Accessibility",
      desc: "No unnecessary waiting list. Book, check schedules, pay consultation fees, and consult directly.",
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Our Mission</span>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            Bridging the gap between <span className="text-primary">patients & validated specialists</span>.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            MediCare Connect is a complete hospital appointments and digital health management portal. Our mission is to digitize clinical scheduling, invoicing, and prescription delivery securely.
          </p>
        </div>

        {/* Company Overview Image/Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-border/80">
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-foreground">Why MediCare Connect was Founded</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We recognized the friction patients experience when scheduling clinical visits: lack of transparent practitioner fees, complex verification of licensing details, and delayed access to prescriptions. 
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MediCare Connect consolidates medical profiles, calendar scheduling, Stripe billing, and digital prescription tracking into a simple, light/dark responsive dashboard portal.
            </p>
            <ul className="space-y-2 text-xs font-semibold text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Verified Doctor Licensing Check
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Secure Stripe Payment Integration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primary" />
                Dynamic Doctor Success Reviews
              </li>
            </ul>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-8 rounded-xs flex flex-col justify-center gap-6">
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs">
              <HeartPulse size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-foreground">Healthcare Innovation</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                By offering instant role-based dashboards (Patient, Doctor, Admin) alongside Google Social login, we simplify clinical workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-8 pt-8 border-t border-border/80">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold text-foreground">Our Core Pillars</h2>
            <p className="text-xs text-muted-foreground mt-2">The guidelines that define our healthcare collaboration network</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => {
              const Icon = val.icon;
              return (
                <Card key={idx} className="p-6 flex flex-col gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary border border-primary/20 rounded-xs flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{val.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
