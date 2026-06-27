"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import Card, { CardContent } from "@/components/Card";
import Table, { TableRow, TableCell } from "@/components/Table";
import Badge from "@/components/Badge";
import Skeleton, { SkeletonTable } from "@/components/Skeleton";
import EmptyState from "@/components/EmptyState";
import { CreditCard, DollarSign } from "lucide-react";

export default function PaymentsHistoryPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await apiRequest("/payments");
        if (res.success) {
          setPayments(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) {
    return <SkeletonTable />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Billing History</h1>
        <p className="text-xs text-muted-foreground">Review your transaction logs and invoice codes</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <EmptyState 
              title="No transactions completed" 
              description="Your billing records will appear here after paying appointment fees." 
              icon={CreditCard}
            />
          ) : (
            <Table headers={["Doctor", "Transaction ID", "Amount", "Status", "Paid On"]}>
              {payments.map((pay) => (
                <TableRow key={pay._id}>
                  <TableCell className="font-semibold text-foreground">{pay.doctorName}</TableCell>
                  <TableCell className="font-mono text-xs">{pay.transactionId}</TableCell>
                  <TableCell className="font-bold text-emerald-600 dark:text-emerald-400">${pay.amount}</TableCell>
                  <TableCell>
                    <Badge variant="success">{pay.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(pay.createdAt).toLocaleString()}
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
