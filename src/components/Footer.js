"use client";

import { useState } from "react";
import Link from "next/link";
import { HeartPulse, Mail, Phone, MapPin, Clock, ShieldAlert, Send } from "lucide-react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() === "") return;
    toast.success("Thank you for subscribing to Medicare Connect insights!");
    setEmail(null);
    setEmail("");
  };

  return (
    <footer className="bg-card text-card-foreground border-t border-border mt-auto pt-16 pb-8 transition-colors duration-150">
      <div className="max-w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        
        {/* Column 1: Logo & About */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-black">
            <HeartPulse size={22} />
            <span className="tracking-tight text-foreground font-black text-sm">MediCare Connect</span>
          </div>
          <p className="text-2xs text-muted-foreground leading-relaxed">
            MediCare Connect is a modern healthcare portal designed to bridge the gap between patients, verified medical specialists, and secure payment systems.
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
            <Link href="#" className="p-2 border border-border rounded-xs hover:bg-muted text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01"/>
              </svg>
            </Link>
          </div>
        </div>

        {/* Column 2: Quick Links & Services */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Quick Navigation</h4>
          <ul className="space-y-2 text-2xs text-muted-foreground font-medium">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/doctors" className="hover:text-primary transition-colors">Find Doctors</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            </li>
            <li>
              <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Clinical Specialties */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Medical Specialties</h4>
          <ul className="space-y-2 text-2xs text-muted-foreground font-medium">
            <li>Cardiology</li>
            <li>Neurology</li>
            <li>Orthopedics</li>
            <li>Pediatrics</li>
            <li>Dermatology</li>
            <li>General Medicine</li>
          </ul>
        </div>

        {/* Column 4: Contact info & Newsletter */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Contact Coordinates</h4>
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
              <span>Mon - Sat: 8AM - 8PM</span>
            </div>
            <div className="pt-2 border-t border-border/60">
              <p className="text-3xs font-bold uppercase tracking-wider text-foreground mb-2">Subscribe to wellness insights</p>
              <form onSubmit={handleSubscribe} className="flex gap-1.5" suppressHydrationWarning>
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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

      {/* Bottom Sub-Footer */}
      <div className="max-w-5xl mx-auto px-6 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-3xs font-bold uppercase tracking-wider text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
          <span>&copy; {new Date().getFullYear()} MediCare Connect Inc. All Rights Reserved.</span>
          <span className="hidden sm:inline">|</span>
          <span>Made with ❤️ for better healthcare</span>
        </div>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms & Conditions</Link>
          <Link href="#" className="hover:text-primary transition-colors">Cookie Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Careers</Link>
          <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
        </div>
      </div>
    </footer>
  );
}
