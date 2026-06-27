"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/Card";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonCards } from "@/components/Skeleton";
import { 
  Heart,
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
  Send,
  Award,
  Users,
  Star,
  CheckCircle2,
  Bookmark
} from "lucide-react";
import toast from "react-hot-toast";

// Animated counter sub-component
function AnimatedCounter({ target, duration = 1500 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (isNaN(end) || end === 0) {
      setCount(target || 0);
      return;
    }
    
    const incrementTime = Math.floor(duration / end);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      }
    }, Math.max(incrementTime, 20));

    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count}</span>;
}

// Collapsible FAQ item sub-component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-4 text-sm font-bold text-foreground text-left focus:outline-none cursor-pointer hover:text-primary transition-colors animate-in"
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
  const [stats, setStats] = useState({ totalDoctors: 0, totalPatients: 0, totalAppointments: 0, totalReviews: 0 });
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    // 1. Fetch public platform statistics
    const fetchStats = async () => {
      try {
        const res = await apiRequest("/dashboard/public-stats");
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load statistics:", err);
      }
    };

    // 2. Fetch approved doctors
    const fetchFeaturedDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const res = await apiRequest("/doctors?status=approved&limit=3");
        if (res.success) {
          setFeaturedDoctors(res.data);
        }
      } catch (err) {
        console.error("Failed to load featured doctors:", err);
      } finally {
        setLoadingDoctors(false);
      }
    };

    // 3. Fetch reviews for patient success stories
    const fetchTestimonials = async () => {
      try {
        setLoadingReviews(true);
        const res = await apiRequest("/reviews");
        if (res.success) {
          setTestimonials(res.data.slice(0, 3)); // Display top 3 reviews
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchStats();
    fetchFeaturedDoctors();
    fetchTestimonials();
  }, []);

  const specializations = [
    { name: "Cardiology", desc: "Heart disease care & checkups", icon: HeartPulse },
    { name: "Neurology", desc: "Brain & central nervous system", icon: Activity },
    { name: "Orthopedics", desc: "Bone joints & skeletal structure", icon: Award },
    { name: "Dermatology", desc: "Skin healthcare & wellness", icon: ShieldCheck },
    { name: "Pediatrics", desc: "Children care & vaccination", icon: Users },
    { name: "General Medicine", desc: "General health diagnostics", icon: Stethoscope },
    { name: "Gynecology", desc: "Women health coordination", icon: Heart },
    { name: "Dentistry", desc: "Teeth restoration & hygiene", icon: Bookmark }
  ];

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
      desc: "Schedule physical slots at GreenValley Medical or other partner centers.",
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
      <PublicNavbar />

      {/* 1. HERO BANNER SECTION (Framer Motion Animated) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center md:text-left"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-2xs font-bold uppercase tracking-wider rounded-xs">
              <ShieldCheck size={12} />
              Secure Healthcare Management System
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              Hospital appointments & <span className="text-primary">expert healthcare</span> managed seamlessly.
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg">
              MediCare Connect provides patients with direct scheduling to approved specialists, secure billing audits, and direct medical prescription downloads.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative w-full max-w-sm aspect-square bg-primary/5 border border-primary/10 rounded-xs flex items-center justify-center p-8 overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
              <Stethoscope size={180} className="text-primary/15 absolute -right-10 -bottom-10" />
              <div className="space-y-6 relative z-10 w-full">
                <div className="p-4 bg-card border border-border rounded-xs flex items-center gap-4">
                  <HeartPulse size={28} className="text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Immediate Booking</h4>
                    <p className="text-3xs text-muted-foreground">Certified specialties scheduling</p>
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xs flex items-center gap-4 translate-x-6">
                  <ShieldCheck size={28} className="text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Verified Doctors</h4>
                    <p className="text-3xs text-muted-foreground">Licensed healthcare practitioners</p>
                  </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-xs flex items-center gap-4">
                  <ClipboardList size={28} className="text-primary shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Digital Prescription</h4>
                    <p className="text-3xs text-muted-foreground">Direct dosage records access</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 2. DYNAMIC PLATFORM STATISTICS */}
      <section className="py-12 border-t border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-primary">
              <AnimatedCounter target={stats.totalDoctors || 12} />+
            </h3>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Approved Specialists</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-primary">
              <AnimatedCounter target={stats.totalPatients || 150} />+
            </h3>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Registered Patients</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-primary">
              <AnimatedCounter target={stats.totalAppointments || 450} />+
            </h3>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Appointments Serviced</p>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-primary">
              <AnimatedCounter target={stats.totalReviews || 80} />+
            </h3>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Patient Feedbacks</p>
          </div>
        </div>
      </section>

      {/* 3. MEDICAL SPECIALIZATIONS SECTION */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Specialties</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Medical Specializations</h2>
            <p className="text-xs text-muted-foreground mt-2">Access care divisions coordinated by our verified practitioners</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {specializations.map((spec, idx) => {
              const Icon = spec.icon;
              return (
                <div key={idx} className="p-5 border border-border bg-card rounded-xs text-center flex flex-col items-center gap-3 hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center border border-primary/20 rounded-xs">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{spec.name}</h3>
                    <p className="text-3xs text-muted-foreground mt-1 leading-snug">{spec.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. DYNAMIC FEATURED DOCTORS SECTION */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Meet Specialists</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Featured Doctors</h2>
            <p className="text-xs text-muted-foreground mt-2">Consult with top-rated medical specialists from our approved directory</p>
          </div>

          {loadingDoctors ? (
            <SkeletonCards />
          ) : featuredDoctors.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xs text-center">
              <p className="text-xs text-muted-foreground">No approved doctors found in the directory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDoctors.map((doc) => {
                const displayName = doc.name || doc.doctorName || "Doctor";
                const displayImage = doc.profileImage || doc.image;
                const displayFee = doc.consultationFee !== undefined ? doc.consultationFee : doc.fee;
                const displayReviews = doc.ratingCount !== undefined ? doc.ratingCount : (doc.totalReviews || 0);

                return (
                  <Card key={doc._id} className="flex flex-col justify-between hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3 flex flex-row items-center gap-4">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={displayName}
                          className="w-14 h-14 object-cover border border-border rounded-xs shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-lg rounded-xs shrink-0">
                          {displayName[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">{displayName}</CardTitle>
                        <Badge variant="success" className="mt-1">
                          {doc.specialization}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <div className="text-3xs text-muted-foreground font-semibold uppercase tracking-wider space-y-1.5 pt-2 border-t border-border/40">
                        <div className="flex items-center gap-1.5">
                          <Award size={13} className="text-primary" />
                          <span>{doc.experience} Years Experience</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Star size={13} className="text-amber-500 fill-current" />
                          <span>Rating: {doc.rating || 0} ({displayReviews} Reviews)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <DollarSign size={13} className="text-primary" />
                          <span>Consultation Fee: ${displayFee}</span>
                        </div>
                      </div>

                      <Link href={`/doctors/${doc._id}`} className="block w-full mt-2">
                        <Button variant="primary" size="sm" className="w-full">
                          View Profile & Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Link href="/doctors">
              <Button variant="outline" className="flex items-center gap-1">
                Explore Full Directory
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE MEDICARE CONNECT (Static Advantages) */}
      <section className="py-16 bg-background">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Advantages</span>
              <h2 className="text-2xl font-black text-foreground mt-1">Why Patients Trust Us</h2>
              <p className="text-xs text-muted-foreground mt-1">Providing care coordination standards built on safety and clarity</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Verified & Certified Specialties</h4>
                  <p className="text-3xs text-muted-foreground leading-relaxed mt-0.5">
                    We manually verify medical certifications, state licenses, and clinical bios before approving specialists.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Secure Billing Auditing</h4>
                  <p className="text-3xs text-muted-foreground leading-relaxed mt-0.5">
                    Payments are handled securely via Stripe, offering transparent invoices and invoice records.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 size={18} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-foreground">Instant Digital Prescription Retrieval</h4>
                  <p className="text-3xs text-muted-foreground leading-relaxed mt-0.5">
                    No paperwork loss. Retrieve and reference medication guideline records directly in your patient portal.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-8 rounded-xs space-y-4">
            <h3 className="text-sm font-bold text-foreground">24/7 Digital Health Desk</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              MediCare Connect is engineered to improve medical care accessibility. Patients schedule appointments from home, and doctors write clinical prescriptions in seconds.
            </p>
            <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-bold text-primary uppercase tracking-wider">
              <span>Emergency Desk Hotline:</span>
              <span>+1 (800) 555-0199</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DYNAMIC PATIENT SUCCESS STORIES (Testimonials) */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Testimonials</span>
            <h2 className="text-2xl font-black text-foreground mt-1">Patient Success Stories</h2>
            <p className="text-xs text-muted-foreground mt-2">Discover feedback from patients who completed consultations on Medicare Connect</p>
          </div>

          {loadingReviews ? (
            <SkeletonCards />
          ) : testimonials.length === 0 ? (
            <div className="bg-card border border-border p-8 rounded-xs text-center">
              <p className="text-xs text-muted-foreground">Testimonials will show up after patients submit feedback reviews.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((rev) => (
                <Card key={rev._id} className="flex flex-col justify-between">
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-foreground">{rev.patientName}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star size={13} className="fill-current" />
                        {rev.rating} Stars
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="px-5 pb-4 text-3xs text-muted-foreground/60 font-semibold uppercase tracking-wider pt-2 border-t border-border/40">
                    Consulted Approved Specialist
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 7. HOW MEDICARE CONNECT WORKS (ADDITIONAL SECTION 1) */}
      <section className="py-16 bg-background">
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

      {/* 8. OUR HEALTHCARE SERVICES (ADDITIONAL SECTION 2) */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
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

      {/* 9. TRUSTED HOSPITALS & PARTNERS (ADDITIONAL SECTION 3) */}
      <section className="py-16 bg-background">
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

      {/* 10. HEALTHCARE TIPS & ARTICLES (ADDITIONAL SECTION 4) */}
      <section className="py-16 bg-muted/20 border-t border-b border-border">
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

      {/* 11. COLLAPSIBLE FAQS SECTION (ADDITIONAL SECTION 5) */}
      <section className="py-16 bg-background">
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

      <Footer />
    </div>
  );
}
