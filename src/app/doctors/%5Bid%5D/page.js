"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import PublicNavbar from "@/components/PublicNavbar";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Skeleton from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import Footer from "@/components/Footer";
import { 
  Stethoscope, 
  Star, 
  Award, 
  DollarSign, 
  CalendarDays, 
  Heart, 
  ArrowLeft,
  Mail,
  UserCheck,
  MessageSquare
} from "lucide-react";
import toast from "react-hot-toast";

export default function DoctorDetailsPage({ params }) {
  const resolvedParams = use(params);
  const doctorId = resolvedParams.id;
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch doctor profile
        const docRes = await apiRequest(`/doctors/${doctorId}`);
        if (docRes.success) {
          setDoctor(docRes.data);
        } else {
          toast.error("Doctor profile not found.");
          router.push("/doctors");
          return;
        }

        // Fetch doctor reviews
        const revRes = await apiRequest(`/reviews/doctor/${doctorId}`);
        if (revRes.success) {
          setReviews(revRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
        <PublicNavbar />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-40 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = doctor.name || doctor.doctorName || "Doctor";
  const displayImage = doctor.profileImage || doctor.image;
  const displayFee = doctor.consultationFee !== undefined ? doctor.consultationFee : doctor.fee;
  const displayReviews = doctor.ratingCount !== undefined ? doctor.ratingCount : (doctor.totalReviews || 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
      <PublicNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full space-y-8">
        
        {/* Navigation back */}
        <Link href="/doctors" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ArrowLeft size={14} />
          Back to Doctors Directory
        </Link>

        {/* Doctor Header Profile */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="shrink-0">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName}
                  className="w-28 h-28 object-cover border-2 border-primary/20 rounded-xs"
                />
              ) : (
                <div className="w-28 h-28 bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-black text-3xl rounded-xs">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <Badge variant="success">{doctor.specialization}</Badge>
                <h1 className="text-2xl font-black text-foreground mt-1.5">{displayName}</h1>
                <p className="text-xs text-muted-foreground mt-1">Verified Healthcare Specialist</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border/40 text-xs">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-medium">Experience</span>
                  <p className="font-bold text-foreground flex items-center justify-center md:justify-start gap-1">
                    <Award size={14} className="text-primary" />
                    {doctor.experience} Years
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground font-medium">Consultation Fee</span>
                  <p className="font-bold text-foreground flex items-center justify-center md:justify-start gap-1">
                    <DollarSign size={14} className="text-primary" />
                    ${displayFee}
                  </p>
                </div>
                <div className="space-y-0.5 col-span-2 sm:col-span-1">
                  <span className="text-muted-foreground font-medium">Rating Score</span>
                  <p className="font-bold text-foreground flex items-center justify-center md:justify-start gap-1">
                    <Star size={14} className="text-amber-500 fill-current" />
                    {doctor.rating || 0} ({displayReviews} Reviews)
                  </p>
                </div>
              </div>
            </div>

            {/* Booking action trigger */}
            <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
              {session ? (
                <Link href="/dashboard/appointments">
                  <Button variant="primary" className="w-full flex items-center justify-center gap-1.5">
                    <CalendarDays size={16} />
                    Schedule Appointment
                  </Button>
                </Link>
              ) : (
                <Link href={`/login?redirect=/doctors/${doctor._id}`}>
                  <Button variant="primary" className="w-full">
                    Login to Book
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Doctor bio/about details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Details column */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Specialist Profile & Bio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Dr. {displayName} is a highly accomplished {doctor.specialization} specialist with over {doctor.experience} years of clinical practice. Recognized for professional dedication and patient-centric care, they coordinate diagnostic checkups, wellness advice, and treatment audits.
                </p>
                {doctor.bio && (
                  <p className="text-xs text-foreground bg-muted/10 p-3 border border-border/50 rounded-xs leading-relaxed">
                    {doctor.bio}
                  </p>
                )}
                <div className="flex flex-col gap-2 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Specialty Department</span>
                    <span className="font-semibold text-foreground">{doctor.specialization}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Credential Verification</span>
                    <Badge variant="success" className="flex items-center gap-0.5">
                      <UserCheck size={10} />
                      Approved Practitioner
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials list */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Success Testimonials ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-border">
                {reviews.length === 0 ? (
                  <div className="p-6">
                    <EmptyState 
                      title="No feedback posted yet" 
                      description="Be the first to schedule an appointment and leave your diagnostic review."
                      icon={MessageSquare}
                    />
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="p-6 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-foreground">{rev.patientName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star size={14} className="fill-current" />
                          {rev.rating} Stars
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground italic bg-muted/20 border border-border/40 p-3 rounded-xs leading-relaxed">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick stats / contacts sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Consultation Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3 bg-primary/5 border border-primary/10 rounded-xs flex flex-col gap-2">
                  <div className="flex justify-between font-bold">
                    <span>Consultation Fee:</span>
                    <span className="text-primary">${displayFee}</span>
                  </div>
                  <p className="text-3xs text-muted-foreground leading-relaxed">
                    Stripe transaction fees apply upon appointment bookings confirmation.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-bold text-foreground">Clinic Hours:</span>
                  <div className="text-muted-foreground space-y-1">
                    <p>Monday - Friday: 9AM - 5PM</p>
                    <p>Saturday: 10AM - 2PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
