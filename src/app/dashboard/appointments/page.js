"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  ClipboardList,
  Eye,
  RefreshCw
} from "lucide-react";

// Booking appointment schema
const bookingSchema = z.object({
  doctorId: z.string().min(1, "Please choose a doctor"),
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
  symptoms: z.string().min(3, "Please describe your symptoms (min 3 characters)"),
});

// Reschedule schema
const rescheduleSchema = z.object({
  appointmentDate: z.string().min(1, "Date is required"),
  appointmentTime: z.string().min(1, "Time is required"),
});

// Review schema
const reviewSchema = z.object({
  rating: z.string().min(1, "Please choose a rating"),
  comment: z.string().min(3, "Comment must be at least 3 characters"),
});

function AppointmentsPortalContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const role = session?.user?.role || "patient";

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  const fetchPrescriptions = async () => {
    try {
      const res = await apiRequest("/prescriptions");
      if (res.success) {
        setPrescriptions(res.data);
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
      await fetchPrescriptions();
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
    setValue: setBookingValue,
    formState: { errors: bookingErrors },
  } = useForm({
    resolver: zodResolver(bookingSchema),
  });

  // React Hook Form for Rescheduling
  const {
    register: registerReschedule,
    handleSubmit: handleSubmitReschedule,
    reset: resetReschedule,
    setValue: setRescheduleValue,
    formState: { errors: rescheduleErrors },
  } = useForm({
    resolver: zodResolver(rescheduleSchema),
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

  // Handle auto-opening booking modal if search parameters are present
  useEffect(() => {
    if (doctors.length > 0 && role === "patient") {
      const preSelectedDoctorId = searchParams.get("doctorId");
      const shouldOpenBook = searchParams.get("book") === "true";
      
      if (shouldOpenBook && preSelectedDoctorId) {
        setBookingValue("doctorId", preSelectedDoctorId);
        setBookingOpen(true);
      }
    }
  }, [doctors, role, searchParams, setBookingValue]);

  const onBookSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("/appointments", {
        method: "POST",
        body: JSON.stringify(values),
      });

      if (res.success && res.data) {
        toast.success("Appointment booked! Redirecting to payment...");
        setBookingOpen(false);
        resetBooking();
        // Redirect to payment screen
        router.push(`/dashboard/payment?appointmentId=${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to schedule appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRescheduleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await apiRequest(`/appointments/${selectedAppointment._id}/reschedule`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });

      if (res.success) {
        toast.success("Appointment rescheduled successfully.");
        setRescheduleOpen(false);
        setSelectedAppointment(null);
        resetReschedule();
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.message || "Failed to reschedule appointment.");
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
        fetchPrescriptions();
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
          appointmentId: selectedAppointment._id,
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

  const isFutureAppointment = (dateStr, timeStr) => {
    const now = new Date();
    const appDate = new Date(`${dateStr}T${timeStr}`);
    return appDate > now;
  };

  const getPrescriptionForAppointment = (appId) => {
    return prescriptions.find(p => p.appointmentId === appId);
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

  const matchingPrescription = selectedAppointment ? getPrescriptionForAppointment(selectedAppointment._id) : null;

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
              {appointments.map((app) => {
                const canEdit = app.status !== "completed" && app.status !== "cancelled" && isFutureAppointment(app.appointmentDate, app.appointmentTime);
                return (
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* VIEW DETAILS (ALL ROLES) */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setSelectedAppointment(app);
                            setDetailsOpen(true);
                          }}
                          className="flex items-center gap-1 hover:bg-muted text-foreground"
                        >
                          <Eye size={12} />
                          View
                        </Button>

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
                                <CreditCard size={12} />
                                Pay
                              </Button>
                            )}
                            {canEdit && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedAppointment(app);
                                  setRescheduleValue("appointmentDate", app.appointmentDate);
                                  setRescheduleValue("appointmentTime", app.appointmentTime);
                                  setRescheduleOpen(true);
                                }}
                                className="flex items-center gap-1 text-primary border-primary/20 hover:bg-primary/5"
                              >
                                <RefreshCw size={12} />
                                Reschedule
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
                                <Star size={12} />
                                Review
                              </Button>
                            )}
                            {(app.status === "pending" || app.status === "confirmed") && (
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
                                <FileEdit size={12} />
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
                );
              })}
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
              className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all h-[38px]"
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map(doc => (
                <option key={doc._id} value={doc._id}>
                  {doc.name} ({doc.specialization}) - Fee: ${doc.consultationFee !== undefined ? doc.consultationFee : doc.fee}
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
            placeholder="e.g. 10:00 AM"
            type="text"
            register={registerBooking}
            error={bookingErrors.appointmentTime?.message}
            disabled={isSubmitting}
          />

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Describe Symptoms
            </label>
            <textarea
              {...registerBooking("symptoms")}
              placeholder="e.g. Fever, persistent cough, headache since 2 days..."
              disabled={isSubmitting}
              className="w-full min-h-[80px] bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
            />
            {bookingErrors.symptoms && (
              <span className="text-xs font-medium text-destructive mt-0.5">{bookingErrors.symptoms.message}</span>
            )}
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Confirm Booking
          </Button>
        </form>
      </Dialog>

      {/* DIALOG 2: RESCHEDULE APPOINTMENT */}
      <Dialog isOpen={rescheduleOpen} onClose={() => setRescheduleOpen(false)} title="Reschedule Appointment">
        <form onSubmit={handleSubmitReschedule(onRescheduleSubmit)} className="space-y-4">
          <Input
            label="New Appointment Date"
            name="appointmentDate"
            type="date"
            register={registerReschedule}
            error={rescheduleErrors.appointmentDate?.message}
            disabled={isSubmitting}
          />

          <Input
            label="New Appointment Time"
            name="appointmentTime"
            type="text"
            placeholder="e.g. 11:30 AM"
            register={registerReschedule}
            error={rescheduleErrors.appointmentTime?.message}
            disabled={isSubmitting}
          />

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Reschedule Booking
          </Button>
        </form>
      </Dialog>

      {/* DIALOG 3: VIEW APPOINTMENT DETAILS */}
      <Dialog isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} title="Appointment Information">
        {selectedAppointment && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Specialist</span>
                <span className="font-semibold text-foreground">{selectedAppointment.doctorName}</span>
                <span className="text-3xs text-muted-foreground block font-mono">{selectedAppointment.doctorEmail}</span>
              </div>
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Patient</span>
                <span className="font-semibold text-foreground">{selectedAppointment.patientName}</span>
                <span className="text-3xs text-muted-foreground block font-mono">{selectedAppointment.patientEmail}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Date & Time</span>
                <span className="font-medium text-foreground">{selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime}</span>
              </div>
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Consultation Fee</span>
                <span className="font-semibold text-foreground">${selectedAppointment.fee}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border/40 pb-4">
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Status</span>
                <Badge variant={selectedAppointment.status === "completed" ? "primary" : selectedAppointment.status === "confirmed" ? "success" : selectedAppointment.status === "cancelled" ? "danger" : "warning"}>
                  {selectedAppointment.status}
                </Badge>
              </div>
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block">Payment Status</span>
                <Badge variant={selectedAppointment.paymentStatus === "paid" ? "success" : "danger"}>
                  {selectedAppointment.paymentStatus}
                </Badge>
              </div>
            </div>

            <div className="border-b border-border/40 pb-4">
              <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Symptoms Reported</span>
              <p className="p-3 bg-muted/20 border border-border/40 rounded-xs text-xs italic text-foreground leading-relaxed">
                {selectedAppointment.symptoms || "No symptoms specified."}
              </p>
            </div>

            {selectedAppointment.status === "completed" && (
              <div>
                <span className="text-2xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center gap-1">
                  <ClipboardList size={14} className="text-primary" />
                  Prescription Details
                </span>
                {matchingPrescription ? (
                  <div className="space-y-3 p-3 bg-primary/5 border border-primary/10 rounded-xs text-xs">
                    <div className="space-y-1.5">
                      <p className="font-bold text-foreground uppercase tracking-wider text-2xs">Medicines:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {matchingPrescription.medicines.map((med, index) => (
                          <li key={index}>
                            <span className="font-bold text-foreground">{med.name}</span> &bull; {med.dosage} &bull; {med.duration}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {matchingPrescription.advice && (
                      <div className="pt-2 border-t border-border/40">
                        <p className="font-bold text-foreground uppercase tracking-wider text-2xs mb-0.5">Special Advice:</p>
                        <p className="italic text-muted-foreground">{matchingPrescription.advice}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Prescription data is being loaded or was not created yet.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* DIALOG 4: WRITE PRESCRIPTION (DOCTOR ONLY) */}
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

      {/* DIALOG 5: SUBMIT REVIEW (PATIENT ONLY) */}
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

export default function AppointmentsPortal() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <AppointmentsPortalContent />
    </Suspense>
  );
}
