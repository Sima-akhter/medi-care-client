"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import Card, { CardContent } from "@/components/Card";
import Table, { TableRow, TableCell } from "@/components/Table";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Skeleton, { SkeletonTable } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import { Trash2, Stethoscope, Star } from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest("/doctors?status=approved&limit=100");
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      toast.error("Could not load doctor profiles.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchDoctors();
      setLoading(false);
    };
    load();
  }, []);

  const handleDeleteDoctor = async (docId) => {
    if (!confirm("Are you sure you want to permanently delete this doctor profile? The user will be demoted to patient status.")) return;
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/doctors/${docId}`, {
        method: "DELETE",
      });

      if (res.success) {
        toast.success("Doctor profile deleted successfully.");
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete doctor profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Doctor Directory</h1>
        <p className="text-xs text-muted-foreground">Monitor approved healthcare specialists and profiles</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {doctors.length === 0 ? (
            <EmptyState 
              title="No doctors approved" 
              description="Authorizations will appear here after approving application requests." 
              icon={Stethoscope}
            />
          ) : (
            <Table headers={["Name", "Specialization", "Experience", "Consultation Fee", "Rating", "Action"]}>
              {doctors.map((doc) => (
                <TableRow key={doc._id}>
                  <TableCell className="font-semibold text-foreground">{doc.name}</TableCell>
                  <TableCell className="text-xs">{doc.specialization}</TableCell>
                  <TableCell className="text-xs">{doc.experience} Years</TableCell>
                  <TableCell className="font-semibold text-foreground">${doc.fee}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={14} fill="currentColor" />
                      {doc.rating || 0} ({doc.ratingCount || 0} reviews)
                    </div>
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDeleteDoctor(doc._id)}
                      disabled={isUpdating}
                      className="p-2 hover:bg-destructive/10 text-destructive rounded-xs transition-colors cursor-pointer"
                      title="Delete profile"
                    >
                      <Trash2 size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
