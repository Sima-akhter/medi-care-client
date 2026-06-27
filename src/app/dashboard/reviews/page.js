"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonCards } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Star, MessageSquare } from "lucide-react";

export default function ReviewsPage() {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const user = session?.user;

  useEffect(() => {
    const loadDoctorReviews = async () => {
      if (!user) return;
      try {
        setLoading(true);

        const res = await apiRequest("/dashboard/doctor");
        if (res.success && res.data?.doctor) {
          const foundProfile = res.data.doctor;
          setDoctorProfile(foundProfile);
          
          // Load reviews for doctor
          const reviewRes = await apiRequest(`/reviews/doctor/${foundProfile.id || foundProfile._id}`);
          if (reviewRes.success) {
            setReviews(reviewRes.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadDoctorReviews();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonCards />
      </div>
    );
  }

  if (!doctorProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-black text-foreground">Patient Reviews</h1>
        <EmptyState 
          title="No Doctor Profile" 
          description="You do not have a doctor profile registered. Reviews are only available to doctors."
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Patient Reviews</h1>
          <p className="text-xs text-muted-foreground">Monitor patient feedback and satisfaction metrics</p>
        </div>

        {/* Rating summary */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border px-4 py-2 rounded-xs w-fit">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-lg">
            <Star size={18} fill="currentColor" />
            {doctorProfile.rating || 0}
          </div>
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            ({doctorProfile.ratingCount || doctorProfile.totalReviews || 0} ratings)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-2">
            <EmptyState 
              title="No reviews posted yet" 
              description="When patients leave feedback on completed appointments, they will show up here."
              icon={MessageSquare}
            />
          </div>
        ) : (
          reviews.map((rev) => (
            <Card key={rev._id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold">{rev.patientName}</CardTitle>
                    <CardDescription className="text-3xs text-muted-foreground">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {/* Rating stars badge */}
                  <div className="flex items-center gap-0.5 text-amber-500 font-semibold text-xs">
                    <Star size={14} fill="currentColor" />
                    {rev.rating} Stars
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-xs text-foreground italic bg-muted/20 border border-border/40 p-3 rounded-xs leading-relaxed">
                  "{rev.comment}"
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
