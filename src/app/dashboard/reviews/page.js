"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Skeleton, { SkeletonCards } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { Star, MessageSquare, Edit2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const editReviewSchema = z.object({
  rating: z.string().min(1, "Please choose a rating"),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

export default function ReviewsPage() {
  const { data: session } = authClient.useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Doctor state
  const [doctorProfile, setDoctorProfile] = useState(null);
  
  // Patient state for editing/deleting
  const [selectedReview, setSelectedReview] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = session?.user;
  const role = user?.role || "patient";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editReviewSchema)
  });

  const loadReviews = async () => {
    if (!user) return;
    try {
      setLoading(true);

      if (role === "doctor") {
        const res = await apiRequest("/dashboard/doctor");
        if (res.success && res.data?.doctor) {
          const foundProfile = res.data.doctor;
          setDoctorProfile(foundProfile);
          
          const reviewRes = await apiRequest(`/reviews/doctor/${foundProfile.id || foundProfile._id}`);
          if (reviewRes.success) {
            setReviews(reviewRes.data);
          }
        }
      } else if (role === "patient") {
        const reviewRes = await apiRequest("/reviews/patient");
        if (reviewRes.success) {
          setReviews(reviewRes.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [user, role]);

  const onEditClick = (rev) => {
    setSelectedReview(rev);
    setValue("rating", String(rev.rating));
    setValue("comment", rev.comment);
    setEditOpen(true);
  };

  const onEditSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/reviews/${selectedReview._id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      });

      if (res.success) {
        toast.success("Review updated successfully!");
        setEditOpen(false);
        setSelectedReview(null);
        loadReviews();
      }
    } catch (err) {
      toast.error(err.message || "Could not update review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteClick = (rev) => {
    setSelectedReview(rev);
    setDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/reviews/${selectedReview._id}`, {
        method: "DELETE"
      });

      if (res.success) {
        toast.success("Review deleted successfully.");
        setDeleteOpen(false);
        setSelectedReview(null);
        loadReviews();
      }
    } catch (err) {
      toast.error(err.message || "Could not delete review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonCards />
      </div>
    );
  }

  // DOCTOR VIEW
  if (role === "doctor") {
    if (!doctorProfile) {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-black text-foreground">Patient Reviews</h1>
          <EmptyState 
            title="No Doctor Profile" 
            description="You do not have an approved doctor profile registered. Reviews are only available to verified doctors."
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

  // PATIENT VIEW (FULL CRUD)
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">My Reviews</h1>
        <p className="text-xs text-muted-foreground">Manage feedback and rating scores you gave to specialists</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-2">
            <EmptyState 
              title="No reviews submitted" 
              description="Reviews can be added on completed appointments. Once submitted, they appear here."
              icon={MessageSquare}
            />
          </div>
        ) : (
          reviews.map((rev) => (
            <Card key={rev._id} className="flex flex-col justify-between">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-sm font-bold">Dr. {rev.doctorName}</CardTitle>
                    <CardDescription className="text-3xs text-muted-foreground uppercase tracking-wider font-semibold">
                      {rev.doctorSpecialization || "General Medicine"}
                    </CardDescription>
                    <span className="text-3xs text-muted-foreground block mt-1">
                      Submitted on {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500 font-semibold text-xs">
                    <Star size={14} fill="currentColor" />
                    {rev.rating} Stars
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-foreground italic bg-muted/20 border border-border/40 p-3 rounded-xs leading-relaxed">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditClick(rev)}
                    className="flex items-center gap-1 text-primary border-primary/20 hover:bg-primary/5"
                  >
                    <Edit2 size={12} />
                    Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onDeleteClick(rev)}
                    className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={12} />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* DIALOG: EDIT REVIEW */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Consultation Review">
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rating Score
            </label>
            <select
              {...register("rating")}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all h-[38px]"
            >
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Very Good</option>
              <option value="3">3 Stars - Good</option>
              <option value="2">2 Stars - Fair</option>
              <option value="1">1 Star - Poor</option>
            </select>
            {errors.rating && (
              <span className="text-xs font-medium text-destructive mt-0.5">{errors.rating.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Feedback Comment
            </label>
            <textarea
              placeholder="Share your consultation experience..."
              {...register("comment")}
              disabled={isSubmitting}
              className="w-full min-h-[100px] bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
            {errors.comment && (
              <span className="text-xs font-medium text-destructive mt-0.5">{errors.comment.message}</span>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </form>
      </Dialog>

      {/* DIALOG: CONFIRM DELETE */}
      <Dialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Review">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Are you sure you want to permanently delete this review? This action cannot be undone and will update the doctor's average rating.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(false)} 
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={onDeleteConfirm} 
              isLoading={isSubmitting}
              className="flex-1 bg-destructive border-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
