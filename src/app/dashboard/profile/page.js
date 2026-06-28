"use client";

import { useEffect, useState } from "react";
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
import { User, Mail, Shield, UserCog, Stethoscope, Phone, CalendarRange } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  image: z.string().url("Must be a valid photo URL").or(z.literal("")),
  phone: z.string().optional(),
  gender: z.string().optional(),
  specialization: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  fee: z.string().optional(),
  hospitalName: z.string().optional(),
  bio: z.string().optional(),
  availableDays: z.array(z.string()).optional(),
  availableSlots: z.string().optional(),
});

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);

  const user = session?.user;
  const isDoctor = user?.role === "doctor";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      image: "",
      phone: "",
      gender: "Other",
      specialization: "",
      qualifications: "",
      experience: "",
      fee: "",
      hospitalName: "",
      bio: "",
      availableDays: [],
      availableSlots: "",
    },
  });

  const selectedDays = watch("availableDays") || [];

  // Fetch full user profile from Express backend & doctor profile
  useEffect(() => {
    const loadFullProfile = async () => {
      if (!user) return;
      try {
        setIsFetchingUser(true);
        // Fetch user from backend db (for phone & gender)
        const userRes = await apiRequest("/users/me");
        if (userRes.success && userRes.data) {
          const dbUser = userRes.data;
          setValue("name", dbUser.name || "");
          setValue("image", dbUser.photo || dbUser.image || "");
          setValue("phone", dbUser.phone || "");
          setValue("gender", dbUser.gender || "Other");
        }

        // Fetch doctor profile if doctor
        if (isDoctor) {
          const res = await apiRequest("/dashboard/doctor");
          if (res.success && res.data?.doctor) {
            const doc = res.data.doctor;
            setDoctorProfile(doc);
            setValue("specialization", doc.specialization || "");
            setValue("qualifications", doc.qualifications || "");
            setValue("experience", String(doc.experience || ""));
            setValue("fee", String(doc.consultationFee || doc.fee || ""));
            setValue("hospitalName", doc.hospitalName || "");
            setValue("bio", doc.bio || "");
            setValue("availableDays", doc.availableDays || []);
            setValue("availableSlots", doc.availableSlots ? doc.availableSlots.join(", ") : "");
          }
        }
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setIsFetchingUser(false);
      }
    };

    loadFullProfile();
  }, [user, isDoctor, setValue]);

  const handleDayCheckboxChange = (day, checked) => {
    let updatedDays = [...selectedDays];
    if (checked) {
      if (!updatedDays.includes(day)) {
        updatedDays.push(day);
      }
    } else {
      updatedDays = updatedDays.filter((d) => d !== day);
    }
    setValue("availableDays", updatedDays);
  };

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

      // 2. Synchronize with backend Express server database users collection
      await apiRequest("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          gender: values.gender,
          photo: values.image,
        }),
      });

      // 3. If doctor, synchronize doctor profile fields
      if (isDoctor && doctorProfile) {
        const slotsArray = values.availableSlots
          ? values.availableSlots.split(",").map(s => s.trim()).filter(Boolean)
          : [];

        await apiRequest(`/doctors/${doctorProfile.id || doctorProfile._id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: values.name,
            specialization: values.specialization,
            qualifications: values.qualifications,
            experience: values.experience,
            fee: values.fee,
            hospitalName: values.hospitalName,
            profileImage: values.image,
            bio: values.bio,
            availableDays: values.availableDays || [],
            availableSlots: slotsArray,
          }),
        });
      }

      toast.success("Profile updated successfully!");
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Could not save profile changes.");
    } finally {
      setIsLoading(false);
    }
  };

  const verifStatus = doctorProfile?.verificationStatus || doctorProfile?.status || "pending";

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
            
            {isDoctor && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <UserCog size={12} />
                  Verification:
                </span>
                <Badge variant={verifStatus === "verified" || verifStatus === "approved" ? "success" : verifStatus === "rejected" ? "danger" : "warning"}>
                  {verifStatus}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <UserCog size={12} />
                Account Status:
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
            {isFetchingUser ? (
              <div className="p-8 text-center text-xs font-semibold text-muted-foreground animate-pulse">
                Fetching profile records...
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Phone Number"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
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
                      className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all cursor-pointer h-[38px]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* DOCTOR FIELDS */}
                {isDoctor && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-xs space-y-4">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider border-b border-primary/20 pb-1 flex items-center gap-1.5">
                      <Stethoscope size={14} />
                      Medical Credentials
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

                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Bio & Remarks
                      </label>
                      <textarea
                        {...register("bio")}
                        disabled={isLoading}
                        rows={3}
                        className="w-full bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
                        placeholder="Tell patients about your medical background..."
                      />
                    </div>

                    {/* Available Days Checkboxes */}
                    <div className="space-y-2 pt-2 border-t border-border/40">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
                        <CalendarRange size={14} className="text-primary" />
                        Weekly Active Days
                      </label>
                      <div className="flex flex-wrap gap-x-4 gap-y-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label key={day} className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={selectedDays.includes(day)}
                              disabled={isLoading}
                              onChange={(e) => handleDayCheckboxChange(day, e.target.checked)}
                              className="accent-primary h-3.5 w-3.5 border-border rounded-xs"
                            />
                            {day}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Available Slots Text Input */}
                    <Input
                      label="Time Slots (Comma separated)"
                      name="availableSlots"
                      placeholder="e.g. 09:00 AM, 10:00 AM, 11:00 AM, 02:00 PM, 03:00 PM"
                      register={register}
                      error={errors.availableSlots?.message}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="mt-2 w-full sm:w-fit"
                >
                  Save Changes
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
