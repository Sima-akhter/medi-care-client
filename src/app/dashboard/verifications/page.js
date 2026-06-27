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
import { ShieldCheck, ShieldAlert, ShieldX, Award, Stethoscope } from "lucide-react";

export default function AdminVerificationsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDoctorsList = async () => {
    try {
      const res = await apiRequest("/doctors?status=all&limit=200");
      if (res.success) {
        setDoctors(res.data);
      }
    } catch (err) {
      toast.error("Could not load registered doctors list.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchDoctorsList();
      setLoading(false);
    };
    load();
  }, []);

  const handleUpdateStatus = async (docId, newStatus) => {
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/doctors/${docId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        toast.success(`Verification status updated successfully to ${newStatus}.`);
        fetchDoctorsList();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile verification status.");
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
        <h1 className="text-2xl font-black text-foreground">Doctor Verification Workflow</h1>
        <p className="text-xs text-muted-foreground">Manage and audit medical credentials for specialist practitioners</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {doctors.length === 0 ? (
            <EmptyState 
              title="No doctors registered" 
              description="There are currently no doctor profiles registered in the system database." 
              icon={Stethoscope}
            />
          ) : (
            <Table headers={["Profile", "Name", "Specialization", "Experience", "Hospital", "Verification Status", "Actions"]}>
              {doctors.map((doc) => {
                const verifStatus = doc.verificationStatus || doc.status || "pending";
                
                return (
                  <TableRow key={doc._id}>
                    {/* Profile Image */}
                    <TableCell>
                      {doc.profileImage || doc.image ? (
                        <img
                          src={doc.profileImage || doc.image}
                          alt={doc.doctorName || doc.name}
                          className="w-10 h-10 object-cover border border-border rounded-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-sm rounded-xs">
                          {(doc.doctorName || doc.name || "D")[0].toUpperCase()}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="font-semibold text-foreground">
                      {doc.doctorName || doc.name}
                    </TableCell>
                    
                    <TableCell className="text-xs">
                      {doc.specialization}
                    </TableCell>
                    
                    <TableCell className="text-xs">
                      {doc.experience} Years
                    </TableCell>
                    
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.hospitalName || "General Hospital"}
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={
                          verifStatus === "verified" || verifStatus === "approved" 
                            ? "success" 
                            : verifStatus === "rejected" 
                            ? "danger" 
                            : "warning"
                        }
                      >
                        {verifStatus}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* Verify Button */}
                        {(verifStatus !== "verified" && verifStatus !== "approved") && (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(doc._id, "verified")}
                            className="flex items-center gap-1 bg-emerald-600 border border-emerald-600 hover:bg-emerald-600/90 text-white"
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </Button>
                        )}

                        {/* Reject Button */}
                        {verifStatus !== "rejected" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(doc._id, "rejected")}
                            className="flex items-center gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                          >
                            <ShieldAlert size={14} />
                            Reject
                          </Button>
                        )}

                        {/* Remove Verification Button */}
                        {(verifStatus === "verified" || verifStatus === "approved") && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(doc._id, "pending")}
                            className="flex items-center gap-1 text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                          >
                            <ShieldX size={14} />
                            Remove Verification
                          </Button>
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
    </div>
  );
}
