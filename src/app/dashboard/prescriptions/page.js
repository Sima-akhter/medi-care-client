"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Card, { CardContent } from "@/components/Card";
import Table, { TableRow, TableCell } from "@/components/Table";
import Dialog from "@/components/Dialog";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Skeleton, { SkeletonTable } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { FileText, ClipboardList, User, ShieldAlert } from "lucide-react";

export default function PrescriptionsPage() {
  const { data: session } = authClient.useSession();
  const role = session?.user?.role || "patient";

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState("pending");

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        
        if (role === "doctor") {
          try {
            const dashRes = await apiRequest("/dashboard/doctor");
            if (dashRes.success) {
              const status = dashRes.data?.doctor?.verificationStatus || dashRes.data?.doctor?.status || "pending";
              setVerificationStatus(status);
              if (status !== "verified" && status !== "approved") {
                setIsVerified(false);
              }
            }
          } catch (err) {
            console.error("Doctor status verification failed:", err);
          }
        }

        const res = await apiRequest("/prescriptions");
        if (res.success) {
          setPrescriptions(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [role]);

  if (loading) {
    return <SkeletonTable />;
  }

  if (role === "doctor" && !isVerified) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Prescriptions</h1>
          <p className="text-xs text-muted-foreground">Access issued medicines, dosage guidelines, and doctor advice</p>
        </div>
        <div className="p-8 border border-dashed border-border bg-card/40 rounded-xs text-center flex flex-col items-center justify-center gap-2">
          <FileText size={36} className="text-muted-foreground/60 mb-2" />
          <h4 className="text-xs font-bold text-foreground">Prescription Management Disabled</h4>
          <p className="text-3xs text-muted-foreground max-w-sm leading-relaxed">
            {verificationStatus === "pending"
              ? "Prescription features are disabled until your medical credentials have been verified by administrators."
              : "Prescription features are locked due to rejection. Please contact support."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Prescriptions</h1>
        <p className="text-xs text-muted-foreground">Access issued medicines, dosage guidelines, and doctor advice</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {prescriptions.length === 0 ? (
            <EmptyState 
              title="No prescriptions logged" 
              description={role === "patient" ? "Any prescriptions created by your doctor will show up here." : "You have not composed any patient prescriptions yet."} 
              icon={FileText}
            />
          ) : (
            <Table headers={role === "patient" ? ["Doctor", "Prescribed On", "Actions"] : ["Patient Name", "Email", "Prescribed On", "Actions"]}>
              {prescriptions.map((pres) => (
                <TableRow key={pres._id}>
                  {role === "patient" ? (
                    <TableCell className="font-semibold text-foreground">{pres.doctorName}</TableCell>
                  ) : (
                    <TableCell className="font-semibold text-foreground">{pres.patientName}</TableCell>
                  )}

                  {role !== "patient" && (
                    <TableCell className="text-xs text-muted-foreground">{pres.patientEmail}</TableCell>
                  )}

                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(pres.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSelectedPrescription(pres);
                        setDetailOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <ClipboardList size={14} />
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </CardContent>
      </Card>

      {/* DETAIL MODAL DIALOG */}
      <Dialog 
        isOpen={detailOpen} 
        onClose={() => {
          setDetailOpen(false);
          setSelectedPrescription(null);
        }} 
        title="Medical Prescription Details"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col gap-2 p-3 bg-muted/40 border border-border rounded-xs text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Doctor:</span>
                <span className="font-semibold text-foreground">{selectedPrescription.doctorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Patient:</span>
                <span className="font-semibold text-foreground">{selectedPrescription.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-medium">Date Issued:</span>
                <span className="text-muted-foreground font-medium">
                  {new Date(selectedPrescription.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Medicines List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList size={14} className="text-primary" />
                Prescribed Medicines
              </h3>
              <div className="border border-border rounded-xs divide-y divide-border overflow-hidden">
                {selectedPrescription.medicines.map((med, idx) => (
                  <div key={idx} className="p-3 bg-card flex flex-col gap-1">
                    <p className="text-sm font-bold text-foreground">{med.name}</p>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Dosage: {med.dosage}</span>
                      <span>Duration: {med.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special advice */}
            {selectedPrescription.advice && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert size={14} className="text-primary" />
                  Doctor Advice & Remarks
                </h3>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xs text-sm text-foreground italic leading-relaxed">
                  "{selectedPrescription.advice}"
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
