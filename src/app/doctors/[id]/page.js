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
  UserCheck,
  MessageSquare,
  Clock,
  MapPin,
  GraduationCap
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
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const user = session?.user;
  const isPatient = user?.role === "patient";

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Fetch doctor profile
        const docRes = await apiRequest(`/doctors/${doctorId}`);
        if (docRes.success && docRes.data) {
          const docData = docRes.data;
          
          // Verify doctor is approved/verified
          const isApproved = docData.verificationStatus === "verified" || docData.status === "approved";
          if (!isApproved) {
            toast.error("This doctor profile is not available publicly.");
            router.push("/doctors");
            return;
          }

          setDoctor(docData);
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

        // Check if doctor is in favorites
        if (user && isPatient) {
          const meRes = await apiRequest("/users/me");
          if (meRes.success && meRes.data) {
            const favorites = meRes.data.favorites || [];
            setIsFavorited(favorites.includes(doctorId));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load doctor details.");
        router.push("/doctors");
      } finally {
        setLoading(false);
      }
    };
    
    if (doctorId) {
      fetchDetails();
    }
  }, [doctorId, user, isPatient, router]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to add to favorites.");
      router.push(`/login?redirect=/doctors/${doctorId}`);
      return;
    }
    if (!isPatient) {
      toast.error("Only patients can favorite doctors.");
      return;
    }

    try {
      setFavLoading(true);
      const res = await apiRequest("/users/favorites", {
        method: "PUT",
        body: JSON.stringify({ doctorId }),
      });

      if (res.success) {
        setIsFavorited(!isFavorited);
        toast.success(isFavorited ? "Removed from favorites." : "Added to favorites!");
      }
    } catch (err) {
      toast.error("Could not update favorites.");
    } finally {
      setFavLoading(false);
    }
  };

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

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-150">
        <PublicNavbar />
        <main className="flex-1 max-w-3xl mx-auto px-6 py-16 w-full text-center">
          <EmptyState title="Doctor Not Found" description="This profile could not be loaded or is invalid." />
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
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center md:justify-start gap-1 font-medium">
                  <GraduationCap size={14} className="text-primary" />
                  {doctor.qualifications || "MBBS"} &bull; {doctor.hospitalName || "General Hospital"}
                </p>
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
            <div className="w-full md:w-auto shrink-0 flex flex-row md:flex-col gap-3">
              {session ? (
                isPatient ? (
                  <>
                    <Link href={`/dashboard/appointments?doctorId=${doctor._id}&book=true`} className="flex-1">
                      <Button variant="primary" className="w-full flex items-center justify-center gap-1.5">
                        <CalendarDays size={16} />
                        Book Appointment
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={handleToggleFavorite} 
                      disabled={favLoading}
                      className="flex items-center justify-center gap-1.5"
                    >
                      <Heart size={16} fill={isFavorited ? "currentColor" : "none"} className={isFavorited ? "text-red-500" : ""} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground italic font-medium p-3 bg-muted/30 border border-border text-center rounded-xs">
                    Sign in as Patient to Book
                  </div>
                )
              ) : (
                <Link href={`/login?redirect=/doctors/${doctor._id}`} className="w-full">
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
                    <span className="text-muted-foreground">Qualifications</span>
                    <span className="font-semibold text-foreground">{doctor.qualifications || "MBBS"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Medical Facility</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <MapPin size={12} className="text-primary" />
                      {doctor.hospitalName || "General Hospital"}
                    </span>
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

            {/* Available Days and Slots */}
            <Card>
              <CardHeader>
                <CardTitle>Clinic Availability</CardTitle>
                <CardDescription>Configure scheduling based on weekly active days and slots</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-primary" />
                    Available Days
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.availableDays && doctor.availableDays.length > 0 ? (
                      doctor.availableDays.map((day) => (
                        <Badge key={day} variant="primary">
                          {day}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No specific days configured.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Clock size={14} className="text-primary" />
                    Available Slots
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                      doctor.availableSlots.map((slot) => (
                        <Badge key={slot} variant="outline" className="border-primary/20 text-primary">
                          {slot}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">No specific time slots configured.</span>
                    )}
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
