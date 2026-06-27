"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { apiRequest } from "@/lib/api-client";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import { CreditCard, ShieldCheck, HeartPulse, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Initialize Stripe Promise
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  "pk_test_51SYgOqLGlG54FLAgheeqk9aw9pVuMiGFxSErhaS6EqQugM3zFVuJGSQYueXzUq8OvG1GHlo8WVadc8YsqBPsfIyA00CXst2cPy"
);

function CheckoutForm({ appointment, clientSecret, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm payment with Stripe
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: appointment.patientName,
              email: appointment.patientEmail,
            },
          },
        }
      );

      if (error) {
        toast.error(error.message || "Payment authorization failed.");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Save payment to database via Express backend
        const saveRes = await apiRequest("/payments", {
          method: "POST",
          body: JSON.stringify({
            appointmentId: appointment._id,
            transactionId: paymentIntent.id,
            amount: appointment.fee,
          }),
        });

        if (saveRes.success) {
          toast.success("Payment completed! Your appointment is confirmed.");
          router.push("/dashboard/appointments");
          router.refresh();
        } else {
          throw new Error("Unable to save billing record.");
        }
      }
    } catch (err) {
      toast.error(err.message || "Payment process encountered an error.");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted/40 border border-border rounded-xs">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
          Secure Credit Card Details
        </label>
        <div className="bg-background border border-border rounded-xs p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "hsl(var(--foreground))",
                  "::placeholder": {
                    color: "hsl(var(--muted-foreground))",
                  },
                },
                invalid: {
                  color: "hsl(var(--destructive))",
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isProcessing}
          disabled={!stripe}
          className="flex-1"
        >
          Pay ${appointment.fee}
        </Button>
      </div>
    </form>
  );
}

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  const [appointment, setAppointment] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appointmentId) {
      toast.error("Invalid checkout request. Missing appointment ID.");
      router.push("/dashboard/appointments");
      return;
    }

    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);

        // Fetch appointments and find the current one
        const appRes = await apiRequest("/appointments");
        const found = appRes.data?.find((a) => a._id === appointmentId);

        if (!found) {
          toast.error("Appointment record not found.");
          router.push("/dashboard/appointments");
          return;
        }

        if (found.paymentStatus === "paid") {
          toast.error("This appointment is already paid.");
          router.push("/dashboard/appointments");
          return;
        }

        setAppointment(found);

        // Create stripe payment intent
        const intentRes = await apiRequest("/payments/create-payment-intent", {
          method: "POST",
          body: JSON.stringify({ appointmentId }),
        });

        if (intentRes.success) {
          setClientSecret(intentRes.clientSecret);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [appointmentId, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-primary mb-2" size={28} />
        <span className="text-sm text-muted-foreground">Preparing secure checkout...</span>
      </div>
    );
  }

  if (!appointment || !clientSecret) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="flex flex-col items-center mb-6 text-center">
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs mb-3">
          <CreditCard size={24} />
        </div>
        <h1 className="text-xl font-black text-foreground">Secure Checkout</h1>
        <p className="text-xs text-muted-foreground">Complete payment to confirm appointment details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
          <CardDescription>Review appointment consultation fees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2 border-b border-border/60 pb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Specialist:</span>
              <span className="font-semibold text-foreground">{appointment.doctorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scheduled Date:</span>
              <span className="font-semibold text-foreground">
                {appointment.appointmentDate} at {appointment.appointmentTime}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border/40 font-bold">
              <span className="text-foreground">Total Fee due:</span>
              <span className="text-primary">${appointment.fee}</span>
            </div>
          </div>

          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              appointment={appointment}
              clientSecret={clientSecret}
              onCancel={() => router.push("/dashboard/appointments")}
            />
          </Elements>

          <div className="flex items-center justify-center gap-1.5 text-2xs text-muted-foreground font-semibold uppercase tracking-wider mt-4">
            <ShieldCheck size={14} className="text-emerald-500" />
            Stripe SSL Secured Transaction
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin text-primary mb-2" size={28} />
        <span className="text-sm text-muted-foreground">Loading checkout...</span>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  );
}
