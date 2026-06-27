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
import { Stethoscope, CheckCircle, XCircle } from "lucide-react";

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchDoctors = async () => {
    try {
      const res = await apiRequest("/doctors?status=all&limit=200");
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

  const handleVerify = async (doctorId) => {
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/doctors/${doctorId}/verify`, {
        method: "PATCH",
      });

      if (res.success) {
        toast.success("Doctor verified successfully.");
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.message || "Failed to verify doctor.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async (doctorId) => {
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/doctors/${doctorId}/reject`, {
        method: "PATCH",
      });

      if (res.success) {
        toast.success("Doctor rejected successfully.");
        fetchDoctors();
      }
    } catch (err) {
      toast.error(err.message || "Failed to reject doctor.");
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
        <h1 className="text-2xl font-black text-foreground">Manage Doctors</h1>
        <p className="text-xs text-muted-foreground">Verify, reject, or audit specialist registration requests</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {doctors.length === 0 ? (
            <EmptyState 
              title="No Doctors Registered" 
              description="Doctor registrations will appear here for verification reviews." 
              icon={Stethoscope}
            />
          ) : (
            <Table headers={["Name", "Specialization", "Hospital", "Verification Status", "Actions"]}>
              {doctors.map((doc) => {
                const verifStatus = doc.verificationStatus || doc.status || "pending";
                const displayName = doc.doctorName || doc.name || "Doctor";
                
                return (
                  <TableRow key={doc._id}>
                    <TableCell className="font-semibold text-foreground">{displayName}</TableCell>
                    <TableCell className="text-xs">{doc.specialization}</TableCell>
                    <TableCell className="text-xs">{doc.hospitalName || "General Hospital"}</TableCell>
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
                        {verifStatus === "pending" ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleVerify(doc._id)}
                              className="flex items-center gap-1 bg-emerald-600 border border-emerald-600 hover:bg-emerald-600/90 text-white"
                            >
                              <CheckCircle size={14} />
                              Verify
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isUpdating}
                              onClick={() => handleReject(doc._id)}
                              className="flex items-center gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                            >
                              <XCircle size={14} />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
                            No Actions Required
                          </span>
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
