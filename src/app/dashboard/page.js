"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from "@/components/Card";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonCards, SkeletonTable } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import Table, { TableRow, TableCell } from "@/components/Table";
import { 
  CalendarDays, 
  FileText, 
  DollarSign, 
  Users, 
  Activity, 
  Star, 
  BriefcaseMedical,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function DashboardPortal() {
  const { data: session } = authClient.useSession();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = session?.user?.role || "patient";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/dashboard/${role}`);
        if (res.success) {
          setData(res.data);
        } else {
          throw new Error("Failed to parse statistics.");
        }
      } catch (err) {
        setError(err.message || "Unable to download dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [role]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <SkeletonCards />
        <SkeletonTable />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border bg-card/25 rounded-xs">
        <p className="text-sm font-semibold text-destructive mb-2">Error loading dashboard</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  // Choose the dashboard view based on the role
  if (role === "patient") {
    return <PatientDashboard data={data} />;
  }

  if (role === "doctor") {
    return <DoctorDashboard data={data} />;
  }

  if (role === "admin") {
    return <AdminDashboard data={data} />;
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*                              PATIENT VIEW                                  */
/* -------------------------------------------------------------------------- */
function PatientDashboard({ data }) {
  const { stats, upcomingAppointments = [], recentPayments = [] } = data || {};

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Patient Dashboard</h1>
        <p className="text-xs text-muted-foreground">Manage your healthcare bookings and treatments</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xs">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Appointments</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalAppointments || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xs">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Prescriptions Issued</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalPrescriptions || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xs">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Invested</p>
            <h3 className="text-xl font-black text-foreground">${stats?.totalSpent || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Tables section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming appointments */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Upcoming Schedules</h2>
          {upcomingAppointments.length === 0 ? (
            <EmptyState 
              title="No upcoming visits" 
              description="Schedule a consultation with our approved specialists to begin." 
            />
          ) : (
            <Table headers={["Doctor", "Date/Time", "Status", "Payment"]}>
              {upcomingAppointments.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-semibold text-foreground">{app.doctorName}</TableCell>
                  <TableCell className="text-xs">{app.appointmentDate} at {app.appointmentTime}</TableCell>
                  <TableCell>
                    <Badge variant={app.status === "confirmed" ? "success" : app.status === "cancelled" ? "danger" : "warning"}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={app.paymentStatus === "paid" ? "success" : "danger"}>
                      {app.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </div>

        {/* Recent payments */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-foreground">Recent Billings</h2>
          {recentPayments.length === 0 ? (
            <EmptyState 
              title="No billing records" 
              description="Any appointment fees paid will be logged here." 
            />
          ) : (
            <Table headers={["Doctor", "Transaction ID", "Amount", "Date"]}>
              {recentPayments.map((pay) => (
                <TableRow key={pay._id}>
                  <TableCell className="font-semibold text-foreground">{pay.doctorName}</TableCell>
                  <TableCell className="font-mono text-2xs max-w-[120px] truncate">{pay.transactionId}</TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">${pay.amount}</TableCell>
                  <TableCell className="text-xs">{new Date(pay.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              DOCTOR VIEW                                   */
/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                              DOCTOR VIEW                                   */
/* -------------------------------------------------------------------------- */
function DoctorDashboard({ data }) {
  const { doctor, stats, upcomingAppointments = [] } = data || {};
  const verificationStatus = doctor?.verificationStatus || "pending";
  const isVerified = verificationStatus === "verified" || verificationStatus === "approved";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground">Doctor Office</h1>
          <p className="text-xs text-muted-foreground">Monitor schedules, review patients, and issue prescriptions</p>
        </div>
        
        {/* Verification Status Badge */}
        <div>
          {verificationStatus === "pending" && (
            <Badge variant="warning" className="text-xs py-1 px-2.5">
              Pending Verification
            </Badge>
          )}
          {verificationStatus === "rejected" && (
            <Badge variant="danger" className="text-xs py-1 px-2.5">
              Rejected Verification
            </Badge>
          )}
          {isVerified && (
            <Badge variant="success" className="text-xs py-1 px-2.5">
              Verified Practitioner
            </Badge>
          )}
        </div>
      </div>

      {/* WARNING ALERTS */}
      {verificationStatus === "pending" && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xs space-y-1 text-xs">
          <p className="font-bold">Your account is waiting for admin verification.</p>
          <p className="text-muted-foreground">You can update your profile, but patients cannot book appointments until your account has been verified.</p>
        </div>
      )}

      {verificationStatus === "rejected" && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xs space-y-1 text-xs">
          <p className="font-bold">Your verification request has been rejected.</p>
          <p className="text-muted-foreground">Please update your information and contact the administrator.</p>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xs">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-xl font-black text-foreground">
              {isVerified ? stats?.totalAppointments || 0 : "—"}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xs">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Earnings</p>
            <h3 className="text-xl font-black text-foreground">
              {isVerified ? `$${stats?.totalEarnings || 0}` : "—"}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xs">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Patients Served</p>
            <h3 className="text-xl font-black text-foreground">
              {isVerified ? stats?.uniquePatients || 0 : "—"}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xs">
            <Star size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Patient Rating</p>
            <h3 className="text-xl font-black text-foreground">
              {isVerified ? `${stats?.rating || 0} (${stats?.ratingCount || 0} reviews)` : "—"}
            </h3>
          </div>
        </Card>
      </div>

      {/* Upcoming Schedules / Feature lock block */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">Upcoming Schedules</h2>
        {!isVerified ? (
          <div className="p-8 border border-dashed border-border bg-card/40 rounded-xs text-center flex flex-col items-center justify-center gap-2">
            <Stethoscope size={36} className="text-muted-foreground/60 mb-2" />
            <h4 className="text-xs font-bold text-foreground">Schedules & Appointments Disabled</h4>
            <p className="text-3xs text-muted-foreground max-w-sm leading-relaxed">
              {verificationStatus === "pending"
                ? "Appointment scheduling features are disabled until your medical credentials have been verified by administrators."
                : "Appointment scheduling features are locked due to rejection. Please review your profile data."
              }
            </p>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <EmptyState 
            title="Empty schedule" 
            description="You have no pending consultations booked for the near future." 
            icon={BriefcaseMedical}
          />
        ) : (
          <Table headers={["Patient Name", "Email", "Date/Time", "Status", "Payment"]}>
            {upcomingAppointments.map((app) => (
              <TableRow key={app._id}>
                <TableCell className="font-semibold text-foreground">{app.patientName}</TableCell>
                <TableCell className="text-xs">{app.patientEmail}</TableCell>
                <TableCell className="text-xs">{app.appointmentDate} at {app.appointmentTime}</TableCell>
                <TableCell>
                  <Badge variant={app.status === "confirmed" ? "success" : app.status === "cancelled" ? "danger" : "warning"}>
                    {app.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={app.paymentStatus === "paid" ? "success" : "danger"}>
                    {app.paymentStatus}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADMIN VIEW                                    */
/* -------------------------------------------------------------------------- */
function AdminDashboard({ data }) {
  const { stats, statusBreakdown = {}, doctorPerformance = [] } = data || {};

  const barData = [
    { name: "Pending", value: statusBreakdown.pending || 0, color: "var(--color-amber-500)" },
    { name: "Confirmed", value: statusBreakdown.confirmed || 0, color: "var(--color-emerald-500)" },
    { name: "Completed", value: statusBreakdown.completed || 0, color: "var(--color-primary)" },
    { name: "Cancelled", value: statusBreakdown.cancelled || 0, color: "var(--color-destructive)" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">System Administration</h1>
        <p className="text-xs text-muted-foreground">Manage patients, review doctor credentials, and audit transaction billings</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary border border-primary/20 rounded-xs">
            <Stethoscope size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Doctors</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalDoctors || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-500 border border-sky-500/20 rounded-xs">
            <Users size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Patients</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalPatients || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xs">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalAppointments || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xs">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Earnings</p>
            <h3 className="text-xl font-black text-foreground">${stats?.totalEarnings || 0}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xs">
            <Star size={20} />
          </div>
          <div>
            <p className="text-2xs font-bold text-muted-foreground uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-xl font-black text-foreground">{stats?.totalReviews || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Grid layouts for chart and top performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Appointments Status breakdown</CardTitle>
            <CardDescription>Visual metrics representing appointment states</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.125rem",
                    fontSize: "12px"
                  }}
                />
                <Bar dataKey="value" radius={[1, 1, 0, 0]} barSize={40}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Completed" ? "hsl(var(--primary))" : entry.name === "Confirmed" ? "#10b981" : entry.name === "Pending" ? "#f59e0b" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top performing doctors */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Top Approved Specialists</CardTitle>
            <CardDescription>Sorted by patient satisfaction rating and experience</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {doctorPerformance.length === 0 ? (
              <EmptyState title="No active doctors" description="There are no approved doctor profiles inside the database." />
            ) : (
              <div className="space-y-4">
                {doctorPerformance.map((doc, idx) => (
                  <div key={doc.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-4">#{idx + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-foreground">{doc.name}</p>
                        <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm justify-end">
                          <Star size={14} fill="currentColor" />
                          {doc.rating || 0}
                        </div>
                        <p className="text-3xs text-muted-foreground">{doc.experience} Years Exp.</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
