"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/Card";
import Badge from "@/components/Badge";
import { User, Mail, Shield, UserCog } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Must be a valid photo URL").or(z.literal("")),
});

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);

  const user = session?.user;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      image: user?.image || "",
    },
  });

  const onSubmit = async (values) => {
    setIsLoading(true);
    try {
      // 1. Update Better Auth User profile
      const { error } = await authClient.updateUser({
        name: values.name,
        image: values.image || undefined,
      });

      if (error) {
        throw new Error(error.message || "Failed to update profile on auth server.");
      }

      // 2. Synchronize with backend Express server database
      await apiRequest("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name: values.name,
        }),
      });

      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Could not save profile changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Profile Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your personal identification and status indicators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card View */}
        <Card className="lg:col-span-1 flex flex-col items-center text-center justify-center p-6 h-fit">
          <div className="relative mb-4">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-24 h-24 object-cover border-2 border-primary rounded-xs"
              />
            ) : (
              <div className="w-24 h-24 bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-black text-2xl rounded-xs">
                {user?.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
          </div>

          <h2 className="text-base font-bold text-foreground mb-1">{user?.name}</h2>
          <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <Mail size={12} />
            {user?.email}
          </p>

          <div className="flex flex-col gap-2 w-full pt-4 border-t border-border mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Shield size={12} />
                Access Role:
              </span>
              <Badge variant={user?.role === "admin" ? "danger" : user?.role === "doctor" ? "success" : "primary"}>
                {user?.role || "patient"}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <UserCog size={12} />
                Status:
              </span>
              <Badge variant={user?.status === "active" ? "success" : "danger"}>
                {user?.status || "active"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Edit Details</CardTitle>
            <CardDescription>Keep your profile details up to date</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                register={register}
                error={errors.name?.message}
                disabled={isLoading}
              />

              <Input
                label="Photo URL"
                name="image"
                placeholder="https://images.unsplash.com/photo-..."
                register={register}
                error={errors.image?.message}
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="mt-2"
              >
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
