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
import { ShieldCheck, ShieldAlert, Award } from "lucide-react";

export default function AdminVerificationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await apiRequest("/doctors?status=pending");
      if (res.success) {
        setApplications(res.data);
      }
    } catch (err) {
      toast.error("Could not fetch verification applications.");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchApplications();
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
        toast.success(`Doctor profile application marked as ${newStatus}.`);
        fetchApplications();
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
        <h1 className="text-2xl font-black text-foreground">Doctor Applications</h1>
        <p className="text-xs text-muted-foreground">Verify and authorize credentials for new medical specialists</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <EmptyState 
              title="Verification queue is empty" 
              description="There are currently no pending doctor profile credentials waiting for review." 
              icon={Award}
            />
          ) : (
            <Table headers={["Name", "Specialization", "Experience", "Cons. Fee", "Actions"]}>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-semibold text-foreground">{app.name}</TableCell>
                  <TableCell className="text-xs">{app.specialization}</TableCell>
                  <TableCell className="text-xs">{app.experience} Years</TableCell>
                  <TableCell className="font-semibold text-foreground">${app.fee}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(app._id, "approved")}
                        className="flex items-center gap-1 bg-emerald-600 border border-emerald-600 hover:bg-emerald-600/90 text-white"
                      >
                        <ShieldCheck size={14} />
                        Approve
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(app._id, "rejected")}
                        className="flex items-center gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <ShieldAlert size={14} />
                        Reject
                      </Button>
                    </div>
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
