"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import Card, { CardHeader, CardTitle, CardContent } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import Input from "@/components/Input";
import Dialog from "@/components/Dialog";
import EmptyState from "@/components/EmptyState";
import Table, { TableRow, TableCell } from "@/components/Table";
import Skeleton, { SkeletonTable } from "@/components/Skeleton";
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  Stethoscope, 
  CreditCard, 
  Star,
  FileEdit,
  ClipboardList
} from "lucide-react";

// Booking appointment schema
const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please choose a doctor"),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
});

// Review schema
const reviewSchema = z.object({
  rating: z.string().min(1, "Please choose a rating"),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

export default function AppointmentsPortal() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  const role = session?.user?.role || "patient";

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState("pending");

  // Selected elements
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionMedicines, setPrescriptionMedicines] = useState([{ name: "", dosage: "", duration: "" }]);
  const [prescriptionAdvice, setPrescriptionAdvice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await apiRequest("/appointments");
      if (res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      toast.error("Could not load appointments.");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest("/doctors?status=approved&limit=100");
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      
      if (role === "doctor") {
        try {
          const dashRes = await apiRequest("/dashboard/doctor");
          if (dashRes.success) {
            const status = dashRes.data?.doctor?.verificationStatus || dashRes.data?.doctor?.status || "pending";
            setVerificationStatus(status);
            if (status !== "verified" && status !== "approved") {
              setIsVerified(false);
            }
          }
        } catch (err) {
          console.error("Doctor status verification failed:", err);
        }
      }

      await fetchAppointments();
      if (role === "patient") {
        await fetchDoctors();
      }
      setLoading(false);
    };
    init();
  }, [role]);

  // React Hook Form for Booking
  const {
    register: registerBooking,
    handleSubmit: handleSubmitBooking,
    reset: resetBooking,
    formState: { errors: bookingErrors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  // React Hook Form for Reviews
  const {
    register: registerReview,
    handleSubmit: handleSubmitReview,
    reset: resetReview,
    formState: { errors: reviewErrors },
  } = useForm({
    resolver: zodResolver(reviewSchema),
  });

  const onBookSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.success) {
        toast.success("Appointment booked successfully.");
        setBookingOpen(false);
        resetBooking();
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || "Failed to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await apiRequest(`/appointments/${appId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        toast.success(`Appointment marked as ${newStatus}.`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || "Could not update appointment status.");
    }
  };

  // Prescription handler
  const handleAddMedicine = () => {
    setPrescriptionMedicines([...prescriptionMedicines, { name: "", dosage: "", duration: "" }]);
  };

  const handleRemoveMedicine = (index) => {
    const updated = prescriptionMedicines.filter((_, idx) => idx !== index);
    setPrescriptionMedicines(updated);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...prescriptionMedicines];
    updated[index][field] = value;
    setPrescriptionMedicines(updated);
  };

  const handleWritePrescription = async (e) => {
    e.preventDefault();
    // Validate medicines
    const validMedicines = prescriptionMedicines.filter(m => m.name.trim() !== "");
    if (validMedicines.length === 0) {
      toast.error("Please add at least one medicine.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiRequest("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          appointmentId: selectedAppointment._id,
          medicines: validMedicines,
          advice: prescriptionAdvice
        }),
      });

      if (res.success) {
        toast.success("Prescription submitted and appointment completed!");
        setPrescriptionOpen(false);
        setSelectedAppointment(null);
        setPrescriptionMedicines([{ name: "", dosage: "", duration: "" }]);
        setPrescriptionAdvice("");
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || "Prescription recording failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Review handler
  const onReviewSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("/reviews", {
        method: "POST",
        body: JSON.stringify({
          doctorId: selectedAppointment.doctorId,
          rating: values.rating,
          comment: values.comment
        }),
      });

      if (res.success) {
        toast.success("Review submitted! Thank you.");
        setReviewOpen(false);
        setSelectedAppointment(null);
        resetReview();
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <SkeletonTable />;
  }

  if (role === "doctor" && !isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Appointments</h1>
          <p className="text-xs text-muted-foreground">Audit, manage, and book consultations</p>
        </div>
        <div className="p-8 border border-dashed border-border bg-card/40 rounded-xs text-center flex flex-col items-center justify-center gap-2">
          <Stethoscope size={36} className="text-muted-foreground/60 mb-2" />
          <h4 className="text-xs font-bold text-foreground">Schedules & Appointments Disabled</h4>
          <p className="text-3xs text-muted-foreground max-w-sm leading-relaxed">
            {verificationStatus === "pending"
              ? "Appointment scheduling features are disabled until your medical credentials have been verified by administrators."
              : "Appointment scheduling features are locked due to rejection. Please review your profile data."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Appointments</h1>
          <p className="text-xs text-muted-foreground">Audit, manage, and book consultations</p>
        </div>

        {role === "patient" && (
          <Button variant="primary" onClick={() => setBookingOpen(true)} className="flex items-center gap-1.5 w-fit">
            <Plus size={16} />
            Book Consultation
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {appointments.length === 0 ? (
            <EmptyState 
              title="No appointments registered" 
              description={role === "patient" ? "Click 'Book Consultation' to schedule your first appointment." : "No appointments have been booked with you yet."} 
              icon={CalendarDays}
            />
          ) : (
            <Table headers={role === "patient" ? ["Doctor", "Date/Time", "Fee", "Status", "Payment", "Action"] : role === "doctor" ? ["Patient Name", "Email", "Date/Time", "Status", "Payment", "Action"] : ["Patient Name", "Doctor", "Date/Time", "Status", "Payment", "Action"]}>
              {appointments.map((app) => (
                <TableRow key={app._id}>
                  {role === "patient" ? (
                    <TableCell className="font-semibold text-foreground">{app.doctorName}</TableCell>
                  ) : (
                    <TableCell className="font-semibold text-foreground">{app.patientName}</TableCell>
                  )}

                  {role === "admin" && (
                    <TableCell className="text-xs text-muted-foreground">{app.doctorName}</TableCell>
                  )}

                  {role === "doctor" && (
                    <TableCell className="text-xs text-muted-foreground">{app.patientEmail}</TableCell>
                  )}

                  <TableCell className="text-xs">{app.appointmentDate} at {app.appointmentTime}</TableCell>
                  
                  {role === "patient" && (
                    <TableCell className="font-semibold text-foreground">${app.fee}</TableCell>
                  )}

                  <TableCell>
                    <Badge variant={app.status === "completed" ? "primary" : app.status === "confirmed" ? "success" : app.status === "cancelled" ? "danger" : "warning"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.paymentStatus === "paid" ? "success" : "danger"}>
                      {app.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Patient Actions */}
                      {role === "patient" && (
                        <>
                          {app.paymentStatus === "unpaid" && app.status !== "cancelled" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => router.push(`/dashboard/payment?appointmentId=${app._id}`)}
                              className="flex items-center gap-1"
                            >
                              <CreditCard size={14} />
                              Pay Fee
                            </Button>
                          )}
                          {app.status === "completed" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                setSelectedAppointment(app);
                                setReviewOpen(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <Star size={14} />
                              Review
                            </Button>
                          )}
                          {app.status === "pending" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10" 
                              onClick={() => handleUpdateStatus(app._id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}

                      {/* Doctor Actions */}
                      {role === "doctor" && (
                        <>
                          {app.status === "pending" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-emerald-600 border-emerald-600/30 hover:bg-emerald-600/10"
                                onClick={() => handleUpdateStatus(app._id, "confirmed")}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:bg-destructive/10"
                                onClick={() => handleUpdateStatus(app._id, "cancelled")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === "confirmed" && app.paymentStatus === "paid" && (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => {
                                setSelectedAppointment(app);
                                setPrescriptionOpen(true);
                              }}
                              className="flex items-center gap-1"
                            >
                              <FileEdit size={14} />
                              Prescribe
                            </Button>
                          )}
                          {app.status === "confirmed" && app.paymentStatus !== "paid" && (
                            <span className="text-xs text-muted-foreground font-medium italic">Unpaid</span>
                          )}
                        </>
                      )}

                      {/* Admin Actions */}
                      {role === "admin" && (
                        <>
                          {app.status === "pending" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUpdateStatus(app._id, "confirmed")}
                            >
                              Confirm
                            </Button>
                          )}
                          {app.status !== "completed" && app.status !== "cancelled" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => handleUpdateStatus(app._id, "cancelled")}
                            >
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DIALOG 1: BOOKING APPOINTMENT (PATIENT ONLY) */}
      <Dialog isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="Book Appointment">
        <form onSubmit={handleSubmitBooking(onBookSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Choose Medical Specialist
            </label>
            <select
              {...registerBooking("doctorId")}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.specialization}) - Fee: ${doc.fee}
                </option>
              ))}
            </select>
            {bookingErrors.doctorId && (
              <span className="text-xs font-medium text-destructive mt-0.5">{bookingErrors.doctorId.message}</span>
            )}
          </div>

          <Input
            label="Appointment Date"
            name="appointmentDate"
            type="date"
            register={registerBooking}
            error={bookingErrors.appointmentDate?.message}
            disabled={isSubmitting}
          />

          <Input
            label="Appointment Time"
            name="appointmentTime"
            type="time"
            register={registerBooking}
            error={bookingErrors.appointmentTime?.message}
            disabled={isSubmitting}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Confirm Booking
          </Button>
        </form>
      </Dialog>

      {/* DIALOG 2: WRITE PRESCRIPTION (DOCTOR ONLY) */}
      <Dialog isOpen={prescriptionOpen} onClose={() => setPrescriptionOpen(false)} title="Compose Prescription">
        <form onSubmit={handleWritePrescription} className="space-y-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <ClipboardList size={14} />
              Prescribed Medicines
            </p>
            {prescriptionMedicines.map((med, idx) => (
              <div key={idx} className="flex gap-2 items-end border-b border-border/40 pb-2 last:border-b-0">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    placeholder="Medicine Name (e.g. Paracetamol)"
                    value={med.name}
                    onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="w-full bg-background border border-border rounded-xs px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1-0-1)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full bg-background border border-border rounded-xs px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, "duration", e.target.value)}
                      required
                      disabled={isSubmitting}
                      className="w-full bg-background border border-border rounded-xs px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                {prescriptionMedicines.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMedicine(idx)}
                    disabled={isSubmitting}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-xs transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={handleAddMedicine} disabled={isSubmitting}>
              + Add Medicine
            </Button>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Special Advice / Remarks
            </label>
            <textarea
              placeholder="Drink plenty of water. Rest well."
              value={prescriptionAdvice}
              onChange={(e) => setPrescriptionAdvice(e.target.value)}
              disabled={isSubmitting}
              className="w-full min-h-[80px] bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Submit Prescription & Complete Booking
          </Button>
        </form>
      </Dialog>

      {/* DIALOG 3: SUBMIT REVIEW (PATIENT ONLY) */}
      <Dialog isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Submit Doctor Review">
        <form onSubmit={handleSubmitReview(onReviewSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Rating Score
            </label>
            <select
              {...registerReview("rating")}
              disabled={isSubmitting}
              className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="">-- Choose Stars --</option>
              <option value="5">5 Stars - Excellent</option>
              <option value="4">4 Stars - Very Good</option>
              <option value="3">3 Stars - Good</option>
              <option value="2">2 Stars - Fair</option>
              <option value="1">1 Star - Poor</option>
            </select>
            {reviewErrors.rating && (
              <span className="text-xs font-medium text-destructive mt-0.5">{reviewErrors.rating.message}</span>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Feedback Comment
            </label>
            <textarea
              placeholder="Share your consultation experience..."
              {...registerReview("comment")}
              disabled={isSubmitting}
              className="w-full min-h-[100px] bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
            {reviewErrors.comment && (
              <span className="text-xs font-medium text-destructive mt-0.5">{reviewErrors.comment.message}</span>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
