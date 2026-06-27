"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import Card, { CardContent } from "@/components/Card";
import Table, { TableRow, TableCell } from "@/components/Table";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Skeleton, { SkeletonTable } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import toast from "react-hot-toast";
import { UserCheck, UserX, ShieldAlert, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUsers = async () => {
    try {
      let url = "/users";
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (roleFilter) params.push(`role=${roleFilter}`);
      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const res = await apiRequest(url);
      if (res.success) {
        setUsers(res.data);
      }
    } catch (err) {
      toast.error("Could not fetch user list.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleUpdateStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "blocked" : "active";
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.success) {
        toast.success(`User successfully ${nextStatus === "blocked" ? "blocked" : "unblocked"}.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update account status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/users/${userId}/status`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });

      if (res.success) {
        toast.success(`User role elevated to ${newRole}.`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user role.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to permanently delete this user account?")) return;
    setIsUpdating(true);
    try {
      const res = await apiRequest(`/users/${userId}`, {
        method: "DELETE",
      });

      if (res.success) {
        toast.success("User account deleted successfully.");
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || "Could not delete user account.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">User Management</h1>
        <p className="text-xs text-muted-foreground">Administer roles, block accounts, and audit medical profiles</p>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 bg-background border border-border rounded-xs px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          >
            <option value="">All Access Roles</option>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <EmptyState title="No matching accounts" description="Ensure your search filters are correct." />
          ) : (
            <Table headers={["Name", "Email", "Role", "Status", "Actions"]}>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-semibold text-foreground">{u.name}</TableCell>
                  <TableCell className="text-xs">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === "admin" ? "danger" : u.role === "doctor" ? "success" : "primary"}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "success" : "danger"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(u._id, u.status)}
                        className="flex items-center gap-1"
                      >
                        {u.status === "active" ? (
                          <>
                            <UserX size={14} className="text-destructive" />
                            Block
                          </>
                        ) : (
                          <>
                            <UserCheck size={14} className="text-emerald-600" />
                            Unblock
                          </>
                        )}
                      </Button>

                      {u.role !== "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isUpdating}
                          onClick={() => handleUpdateRole(u._id, u.role === "patient" ? "doctor" : "patient")}
                        >
                          Change to {u.role === "patient" ? "Doctor" : "Patient"}
                        </Button>
                      )}

                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={isUpdating}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-xs transition-colors cursor-pointer"
                        title="Delete account"
                      >
                        <Trash2 size={16} />
                      </button>
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
