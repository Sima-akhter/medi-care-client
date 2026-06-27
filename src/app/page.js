"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import Button from "@/components/Button";
import ThemeToggle from "@/components/ThemeToggle";
import { 
  HeartPulse, 
  ShieldCheck, 
  Stethoscope, 
  CalendarDays, 
  ClipboardList, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  MapPin, 
  Activity,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Hospital,
  Clock,
  Send
} from "lucide-react";

// FAQ accordion item sub-component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-sm font-bold text-foreground text-left focus:outline-none cursor-pointer hover:text-primary transition-colors"
      >
        <span className="flex items-center gap-2">
          <HelpCircle size={16} className="text-primary/75" />
          {question}
        </span>
        <span className="text-primary font-bold">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="pb-4 pr-6 text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-200">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session } = authClient.useSession();
  const [emailSub, setEmailSub] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub.trim() === "") return;
    toast.success("Thank you for subscribing to our wellness newsletter!");
    setEmailSub("");
  };

  const faqs = [
    {
      question: "How do I schedule a healthcare appointment?",
      answer: "Once registered, patients can click 'Book Consultation' on the appointments panel, search and select an approved doctor by specialty or fee, and reserve an active date and time slot."
    },
    {
      question: "Can I cancel or reschedule my consultations?",
      answer: "Yes. Patients can cancel pending bookings directly from their dashboard. For confirmed bookings, please coordinate cancellations or changes at least 24 hours in advance."
    },
    {
      question: "How do I download my digital prescriptions?",
      answer: "After your consultation, the attending doctor will compose a digital prescription containing medicines, dosages, and instructions. You can view or download this directly from the 'Prescriptions' panel."
    },
    {
      question: "Are the payment transactions secure?",
      answer: "Absolutely. All transactions are securely processed via Stripe. We do not store your credit card details on our servers, ensuring your billing information remains secure."
    },
    {
      question: "How does doctor credential verification work?",
      answer: "Administrators manually audit credentials, licensing, and medical profiles in the Doctor Verification Queue before approving them as verified specialists on our system."
    }
  ];

  const services = [
    {
      title: "Online Consultations",
      desc: "Connect directly with certified physicians for online advice and treatment guides.",
      icon: Activity
    },
    {
      title: "Hospital Appointments",
      desc: "Schedule physical slots at GREENVALLEY MEDICAL or other partner centers.",
      icon: CalendarDays
    },
    {
      title: "Specialist Doctors",
      desc: "Consult with pediatricians, cardiologists, neurologists, and orthopedists.",
      icon: Stethoscope
    },
    {
      title: "Emergency Care Support",
      desc: "Access our physical hotlines and emergency contact desks 24/7.",
      icon: HeartPulse
    },
    {
      title: "Digital Prescriptions",
      desc: "Review medication requirements, advisory reports, and dosage lists instantly.",
      icon: ClipboardList
    },
    {
      title: "Health Records",
      desc: "Keep a centralized transaction history, diagnostic log, and doctor files.",
      icon: ShieldCheck
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Register Profile",
      desc: "Sign up and create your patient profile file to enter the dashboard portal."
    },
    {
      step: "02",
      title: "Find Doctors",
      desc: "Filter approved medical specialists by specialty departments, reviews, or consultation fees."
    },
    {
      step: "03",
      title: "Reserve a Slot",
      desc: "Select a date and time slot that fits your personal schedule."
    },
    {
      step: "04",
      title: "Pay Consultation Fee",
      desc: "Process payments securely using Stripe to instantly confirm your booking."
    },
    {
      step: "05",
      title: "Receive Prescription",
      desc: "Download prescriptions, advice records, and clinical logs directly from your account."
    }
  ];

  const partners = [
    { name: "City General Hospital", location: "Downtown" },
    { name: "GreenValley Medical Center", location: "Northside" },
    { name: "Metro Care Diagnostics", location: "Eastgate" },
    { name: "Alpha Labs & Research", location: "Westlake" },
    { name: "Beacon Insurance Group", location: "Nationwide" }
  ];

  const blogs = [
    {
      title: "Hypertension: Strategies for Cardiovascular Wellness",
      category: "Cardiology",
      readTime: "5 min read",
      desc: "Discover simple lifestyle changes, diet advice, and tracking tips to manage high blood pressure and protect your heart."
    },
    {
      title: "The Importance of Preventive Health Audits",
      category: "Wellness",
      readTime: "4 min read",
      desc: "Learn why regular health check-ups and screen tests are key to early detection and long-term health."
    },
    {
      title: "Managing Stress & Sleep in the Digital Era",
      category: "Psychiatry",
      readTime: "6 min read",
      desc: "Practical techniques to unplug, improve sleep quality, and maintain mental balance in a screen-dominated world."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      
      {/* HEADER NAVBAR */}
      <header className="h-16 border-b border-border bg-card/40 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2 font-black text-primary">
          <HeartPulse size={24} />
          <span className="tracking-tight text-foreground font-black">MediCare Connect</span>
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
      <section className="flex flex-col items-center justify-center text-center px-4 md:px-8 py-20 max-w-5xl mx-auto space-y-8">
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
      </section>

      {/* SECTION 1: HOW MEDICARE CONNECT WORKS */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Process Overview</span>
            <h2 className="text-2xl font-black text-foreground mt-1">How MediCare Connect Works</h2>
            <p className="text-xs text-muted-foreground mt-2">Get access to qualified medical support in five simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {steps.map((item, idx) => (
              <div key={idx} className="relative bg-card p-5 border border-border rounded-xs flex flex-col justify-between">
                <div>
                  <span className="text-3xl font-black text-primary/10 block mb-2">{item.step}</span>
                  <h3 className="text-sm font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-3xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {idx < steps.length - 1 && (
                  <ArrowRight size={16} className="text-primary/30 absolute right-[-16px] top-1/2 -translate-y-1/2 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: OUR HEALTHCARE SERVICES */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Clinical Coverage</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Our Healthcare Services</h2>
            <p className="text-xs text-muted-foreground mt-2">Comprehensive health management facilities designed around patient convenience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div key={idx} className="p-6 border border-border bg-card rounded-xs hover:border-primary/50 transition-colors flex flex-col gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center border border-primary/20 rounded-xs">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-1">{svc.title}</h3>
                    <p className="text-2xs text-muted-foreground leading-relaxed">{svc.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: TRUSTED HOSPITALS & PARTNERS */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Collaborations</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Trusted Hospitals & Clinics</h2>
            <p className="text-xs text-muted-foreground mt-2">We partner with leading diagnostic hubs and care organizations</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {partners.map((partner, idx) => (
              <div key={idx} className="p-5 border border-border bg-card rounded-xs flex flex-col items-center justify-center text-center">
                <Hospital size={24} className="text-primary/75 mb-2" />
                <h4 className="text-xs font-bold text-foreground truncate w-full">{partner.name}</h4>
                <span className="text-3xs text-muted-foreground mt-0.5">{partner.location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HEALTHCARE TIPS & ARTICLES */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Clinical Blog</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Healthcare Tips & Insights</h2>
            <p className="text-xs text-muted-foreground mt-2">Explore health guidelines curated by our approved specialists</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((post, idx) => (
              <div key={idx} className="border border-border bg-card rounded-xs overflow-hidden flex flex-col justify-between">
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center text-3xs font-bold uppercase tracking-wider">
                    <span className="text-primary">{post.category}</span>
                    <span className="text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground leading-snug">{post.title}</h3>
                  <p className="text-2xs text-muted-foreground leading-relaxed">{post.desc}</p>
                </div>
                <div className="px-5 pb-5 pt-3 border-t border-border/50 bg-muted/10 flex items-center gap-1.5 text-2xs text-primary font-bold hover:underline cursor-pointer">
                  <BookOpen size={12} />
                  Read Full Article
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Common Inquiries</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Frequently Asked Questions</h2>
            <p className="text-xs text-muted-foreground mt-2">Answers to billing, appointments, and care operations</p>
          </div>

          <div className="bg-card border border-border p-6 rounded-xs divide-y divide-border">
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-card text-card-foreground border-t border-border mt-auto pt-16 pb-8 transition-colors duration-150">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Info & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-black">
              <HeartPulse size={22} />
              <span className="tracking-tight text-foreground font-black text-sm">MediCare Connect</span>
            </div>
            <p className="text-2xs text-muted-foreground leading-relaxed">
              MediCare Connect is a modern healthcare management portal. We bridge clinical appointments, verified specialists, and secure payments under a unified experience.
            </p>
            <div className="flex items-center gap-3">
              <Link href="#" className="p-2 border border-border rounded-xs hover:bg-muted text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3h-4V6.5c0-.8.2-1 1-1h3V2h-4c-3.3 0-5 1.7-5 5V8z"/>
                </svg>
              </Link>
              <Link href="#" className="p-2 border border-border rounded-xs hover:bg-muted text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7L10.9 15.3l-6 7.1H1.5l7.7-8.8L1 2.4h6.9l4.7 6.2 5.6-6.2zm-1.2 17.5h1.8L7 4.2H5.1l11.9 15.7z"/>
                </svg>
              </Link>
              <Link href="#" className="p-2 border border-border rounded-xs hover:bg-muted text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.3c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm13.5 12.3h-3v-5.6c0-3.3-4-3-4 0v5.6h-3v-11h3v1.8c1.4-2.6 7-2.8 7 2.5v6.7z"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Column 2: Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-2xs text-muted-foreground font-medium">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">Home Portal</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-primary transition-colors">User Dashboard</Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="hover:text-primary transition-colors">Profile Details</Link>
              </li>
              <li>
                <Link href="/dashboard/appointments" className="hover:text-primary transition-colors">Consultation Booking</Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">Careers & Internship</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Medical Services */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Specialties</h4>
            <ul className="space-y-2 text-2xs text-muted-foreground font-medium">
              <li>Cardiology Care</li>
              <li>Pediatrics Medicine</li>
              <li>Neurology & Sleep</li>
              <li>Orthopedics Clinical</li>
              <li>Mental Wellness Audits</li>
            </ul>
          </div>

          {/* Column 4: Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact & Working Hours</h4>
            <div className="space-y-2.5 text-2xs text-muted-foreground font-medium">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span>12 Clinic Plaza, Healthcare Blvd, NY 10012</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-primary shrink-0" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-primary shrink-0" />
                <span>Working: Mon - Sat, 8AM - 8PM</span>
              </div>
              <div className="pt-2 border-t border-border/60">
                <p className="text-3xs font-bold uppercase tracking-wider text-foreground mb-2">Subscribe to wellness insights</p>
                <form onSubmit={handleSubscribe} className="flex gap-1.5">
                  <input
                    type="email"
                    placeholder="Enter email..."
                    value={emailSub}
                    onChange={(e) => setEmailSub(e.target.value)}
                    required
                    className="flex-1 bg-background border border-border text-xs px-2.5 py-1.5 rounded-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                  />
                  <button type="submit" className="p-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xs transition-colors cursor-pointer">
                    <Send size={12} />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer */}
        <div className="max-w-5xl mx-auto px-6 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-3xs font-bold uppercase tracking-wider text-muted-foreground">
          <div>
            &copy; {new Date().getFullYear()} MediCare Connect Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
