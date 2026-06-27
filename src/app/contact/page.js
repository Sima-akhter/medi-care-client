"use client";

import { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import toast from "react-hot-toast";
import { Mail, Phone, MapPin, Clock, ShieldAlert, Send } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim() === "" || email.trim() === "" || message.trim() === "") {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    // Simulate sending message
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast.success("Thank you! Your inquiry has been sent to our healthcare staff.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Help Desk</span>
          <h1 className="text-2xl font-black text-foreground">Contact Us</h1>
          <p className="text-xs text-muted-foreground">Reach out to our clinical coordinators or diagnostic desk</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Contact Details Grid */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Directory</CardTitle>
                <CardDescription>Support coordinates and timings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-xs">
                
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Physical Address</h4>
                    <p className="text-muted-foreground mt-0.5">12 Clinic Plaza, Healthcare Blvd, NY 10012</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Phone Support</h4>
                    <p className="text-muted-foreground mt-0.5">+1 (800) 555-0199</p>
                    <p className="text-muted-foreground">+1 (800) 555-0188</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Email Support</h4>
                    <p className="text-muted-foreground mt-0.5">support@medicareconnect.com</p>
                    <p className="text-muted-foreground">admin@medicareconnect.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Working Hours</h4>
                    <p className="text-muted-foreground mt-0.5">Monday - Saturday: 8AM - 8PM</p>
                    <p className="text-muted-foreground">Sunday: Emergency Hotline Only</p>
                  </div>
                </div>

                {/* Emergency Hotline warning */}
                <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xs flex items-start gap-2.5">
                  <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-600 dark:text-red-400">Emergency Hotline</h4>
                    <p className="text-3xs text-muted-foreground mt-0.5 leading-relaxed">
                      For immediate assistance, dial our emergency hotline directly: <span className="font-bold text-red-600 dark:text-red-400">911-CONNECT</span>.
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Contact Inquiry Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send an Inquiry</CardTitle>
                <CardDescription>Our clinical coordinators will review and reply within 24 business hours</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Full Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Appointment reschedule / Billing inquiry..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Message Inquiry <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      placeholder="Write details of your question here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={5}
                      disabled={isSubmitting}
                      className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all min-h-[120px]"
                    />
                  </div>

                  <Button type="submit" variant="primary" className="w-full sm:w-auto" isLoading={isSubmitting}>
                    <Send size={14} className="mr-1.5" />
                    Send Message
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
