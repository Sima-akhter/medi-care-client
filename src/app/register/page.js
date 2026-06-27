"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { Check, X, ShieldAlert, HeartPulse } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  gender: z.string().min(1, "Please select your gender"),
  photo: z.string().url("Must be a valid photo URL").or(z.literal("")),
  role: z.enum(["patient", "doctor"], { errorMap: () => ({ message: "Please select a role" }) }),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  // Optional doctor credentials fields
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  fee: z.string().optional(),
  hospitalName: z.string().optional(),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gender: "",
      photo: "",
      role: "patient",
      password: "",
      confirmPassword: "",
      specialization: "",
      qualifications: "",
      experience: "",
      fee: "",
      hospitalName: "",
    },
  });

  const selectedRole = watch("role");
  const passwordVal = watch("password") || "";
  const confirmPasswordVal = watch("confirmPassword") || "";

  // Password rules validation checks
  const passwordChecks = {
    length: passwordVal.length >= 6,
    number: /[0-9]/.test(passwordVal),
    special: /[^A-Za-z0-9]/.test(passwordVal),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const onSubmit = async (values) => {
    if (!isPasswordValid) {
      toast.error("Please ensure your password satisfies all security rules.");
      return;
    }

    if (values.password !== values.confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    if (values.role === "doctor") {
      if (
        !values.specialization ||
        !values.qualifications ||
        !values.experience ||
        !values.fee ||
        !values.hospitalName
      ) {
        toast.error("Please fill out all doctor profile fields.");
        return;
      }
    }

    setIsLoading(true);
    try {
      // 1. Register with Better Auth
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        image: values.photo || undefined,
        role: values.role,
      });

      if (error) {
        throw new Error(error.message || "Registration failed on authentication server.");
      }

      // 2. Generate and obtain backend Express Server JWT Token
      const jwtRes = await apiRequest("/auth/jwt", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          role: values.role,
          phone: values.phone,
          gender: values.gender,
          photo: values.photo,
          specialization: values.specialization,
          qualifications: values.qualifications,
          experience: values.experience,
          fee: values.fee,
          hospitalName: values.hospitalName,
        }),
      });

      if (!jwtRes.success || !jwtRes.token) {
        throw new Error("Failed to configure secure backend session.");
      }

      // 3. Store JWT cookie
      const { setCookie } = await import("@/lib/api-client");
      setCookie("jwt_token", jwtRes.token, 7);

      toast.success("Account registered successfully! Redirecting...");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const RuleIndicator = ({ label, passed }) => (
    <div className="flex items-center gap-1.5 text-xs">
      {passed ? (
        <Check size={14} className="text-emerald-500" />
      ) : (
        <X size={14} className="text-destructive/70" />
      )}
      <span className={passed ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-background transition-colors duration-150">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs mb-3">
            <HeartPulse size={26} />
          </div>
          <h1 className="text-xl font-black text-foreground">MediCare Connect</h1>
          <p className="text-xs text-muted-foreground">Create your healthcare portal account</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter details to open your patient or doctor file</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="e.g. John Doe"
                  register={register}
                  error={errors.name?.message}
                  disabled={isLoading}
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  register={register}
                  error={errors.email?.message}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  name="phone"
                  placeholder="e.g. +1 555-0199"
                  register={register}
                  error={errors.phone?.message}
                  disabled={isLoading}
                />

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gender Selection
                  </label>
                  <select
                    {...register("gender")}
                    disabled={isLoading}
                    className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">-- Choose Gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <span className="text-xs font-medium text-destructive mt-0.5">{errors.gender.message}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Profile Photo URL"
                  name="photo"
                  placeholder="https://images.unsplash.com/photo-..."
                  register={register}
                  error={errors.photo?.message}
                  disabled={isLoading}
                />

                <div className="flex flex-col gap-1 w-full">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Portal Role Selection
                  </label>
                  <select
                    {...register("role")}
                    disabled={isLoading}
                    className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer font-bold text-primary"
                  >
                    <option value="patient">Register as Patient</option>
                    <option value="doctor font-black">Register as Doctor Specialist</option>
                  </select>
                  {errors.role && (
                    <span className="text-xs font-medium text-destructive mt-0.5">{errors.role.message}</span>
                  )}
                </div>
              </div>

              {/* DYNAMIC DOCTOR FIELD BLOCKS */}
              {selectedRole === "doctor" && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xs space-y-4 animate-in fade-in duration-200">
                  <p className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/20 pb-1">
                    Specialist Medical Qualifications
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Specialization"
                      name="specialization"
                      placeholder="e.g. Cardiology, Neurology"
                      register={register}
                      error={errors.specialization?.message}
                      disabled={isLoading}
                    />

                    <Input
                      label="Qualifications"
                      name="qualifications"
                      placeholder="e.g. MBBS, MD, FCPS"
                      register={register}
                      error={errors.qualifications?.message}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Experience (Years)"
                      name="experience"
                      type="number"
                      placeholder="e.g. 10"
                      register={register}
                      error={errors.experience?.message}
                      disabled={isLoading}
                    />

                    <Input
                      label="Consultation Fee ($)"
                      name="fee"
                      type="number"
                      placeholder="e.g. 150"
                      register={register}
                      error={errors.fee?.message}
                      disabled={isLoading}
                    />
                  </div>

                  <Input
                    label="Hospital Name"
                    name="hospitalName"
                    placeholder="e.g. GreenValley Medical Center"
                    register={register}
                    error={errors.hospitalName?.message}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Security Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  register={register}
                  error={errors.password?.message}
                  disabled={isLoading}
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  register={register}
                  error={errors.confirmPassword?.message}
                  disabled={isLoading}
                />
              </div>

              {/* Password Rule Checkers */}
              <div className="p-3 bg-muted/40 border border-border rounded-xs space-y-1.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ShieldAlert size={12} className="text-primary" />
                  Password Rules
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <RuleIndicator label="6+ Characters" passed={passwordChecks.length} />
                  <RuleIndicator label="1 Number" passed={passwordChecks.number} />
                  <RuleIndicator label="1 Special Char" passed={passwordChecks.special} />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 animate-bounce-short"
                isLoading={isLoading}
              >
                Register Account
              </Button>
            </form>

            <div className="mt-4 text-center text-xs">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
