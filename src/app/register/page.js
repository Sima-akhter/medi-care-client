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
  image: z.string().url("Must be a valid photo URL").or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
      image: "",
      password: "",
    },
  });

  const passwordVal = watch("password") || "";

  // Password rules validation checks
  const passwordChecks = {
    length: passwordVal.length >= 6,
    upper: /[A-Z]/.test(passwordVal),
    lower: /[a-z]/.test(passwordVal),
    number: /[0-9]/.test(passwordVal),
    special: /[^A-Za-z0-9]/.test(passwordVal),
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const onSubmit = async (values) => {
    if (!isPasswordValid) {
      toast.error("Please ensure your password satisfies all security rules.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Register with Better Auth
      const { data, error } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        image: values.image || undefined,
        // The default role is set on backend and schema mapping
      });

      if (error) {
        throw new Error(error.message || "Registration failed on authentication server.");
      }

      // 2. Obtain Express Server JWT Token (stores JWT in cookie/local storage)
      const jwtRes = await apiRequest("/auth/jwt", {
        method: "POST",
        body: JSON.stringify({
          email: values.email,
          name: values.name,
          role: "patient", // always register as patient default
        }),
      });

      if (!jwtRes.success) {
        throw new Error("Failed to configure session tokens.");
      }

      // 3. Store JWT token on success
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
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs mb-3">
            <HeartPulse size={26} />
          </div>
          <h1 className="text-xl font-black text-foreground">MediCare Connect</h1>
          <p className="text-xs text-muted-foreground">Create your healthcare dashboard account</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Enter details to open a patient file</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <Input
                label="Photo URL (Optional)"
                name="image"
                placeholder="https://images.unsplash.com/photo-..."
                register={register}
                error={errors.image?.message}
                disabled={isLoading}
              />

              <Input
                label="Security Password"
                name="password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.password?.message}
                disabled={isLoading}
              />

              {/* Password Visual Checkers */}
              <div className="p-3 bg-muted/40 border border-border rounded-xs space-y-1.5">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <ShieldAlert size={12} className="text-primary" />
                  Password Rules
                </p>
                <div className="grid grid-cols-2 gap-y-1 gap-x-2">
                  <RuleIndicator label="6+ Characters" passed={passwordChecks.length} />
                  <RuleIndicator label="1 Uppercase" passed={passwordChecks.upper} />
                  <RuleIndicator label="1 Lowercase" passed={passwordChecks.lower} />
                  <RuleIndicator label="1 Number" passed={passwordChecks.number} />
                  <RuleIndicator label="1 Special Char" passed={passwordChecks.special} />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                disabled={!isPasswordValid}
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
