"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiRequest, setCookie } from "@/lib/api-client";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import { HeartPulse, Loader2 } from "lucide-react";
import { Suspense } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleJWTExchange = async (email, name) => {
    const jwtRes = await apiRequest("/auth/jwt", {
      method: "POST",
      body: JSON.stringify({
        email,
        name: name || "User",
      }),
    });

    if (!jwtRes.success || !jwtRes.token) {
      throw new Error("Unable to create secure session token on backend.");
    }

    setCookie("jwt_token", jwtRes.token, 7);
  };

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials.");
      }

      await handleJWTExchange(data.user.email, data.user.name);

      toast.success("Login successful!");
      router.push(redirectUrl);
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Login failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`
      });
    } catch (err) {
      toast.error("Google authentication failed.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center rounded-xs mb-3">
            <HeartPulse size={26} />
          </div>
          <h1 className="text-xl font-black text-foreground">MediCare Connect</h1>
          <p className="text-xs text-muted-foreground">Log in to manage appointments & prescriptions</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter details to log in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="name@example.com"
                register={register}
                error={errors.email?.message}
                disabled={isLoading || isGoogleLoading}
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                register={register}
                error={errors.password?.message}
                disabled={isLoading || isGoogleLoading}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={isLoading}
                disabled={isGoogleLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              isLoading={isGoogleLoading}
              disabled={isLoading}
            >
              {!isGoogleLoading && (
                <svg className="h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              )}
              Google Social Sign In
            </Button>

            <div className="mt-6 text-center text-xs">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/register" className="text-primary font-bold hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary mb-2" size={32} />
        <span className="text-sm font-semibold text-muted-foreground">Loading authentication portal...</span>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
