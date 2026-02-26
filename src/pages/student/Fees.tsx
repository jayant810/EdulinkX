import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthProvider";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const StudentFees = () => {
  const { token } = useAuth();
  const [fees, setFees] = useState<any>({ total: 0, paid: 0, pending: 0, history: [] });

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/student/fees`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFees(data));
  }, [token]);

  return (
    <>
      <Helmet>
        <title>Fees - EdulinkX</title>
      </Helmet>
      <DashboardLayout
        title="Fee Management"
        subtitle="View and manage your fee payments"
      >
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="stat" className="border-l-warning">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold font-display text-warning">₹{fees.pending.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card variant="stat" className="border-l-success">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold font-display text-success">₹{fees.paid.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Current Due */}
          {fees.pending > 0 && (
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Outstanding Balance</h3>
                      <p className="text-muted-foreground">Please clear your dues to avoid late fees.</p>
                      <p className="text-2xl font-bold mt-2">₹{fees.pending.toLocaleString()}</p>
                    </div>
                  </div>
                  <Button variant="hero" size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fee History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border">
                      <th className="pb-3 font-medium">Invoice</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Paid On</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.history.map((fee: any) => (
                      <tr key={fee.id} className="border-b border-border last:border-0">
                        <td className="py-4 font-medium">{fee.invoice}</td>
                        <td className="py-4">₹{fee.amount.toLocaleString()}</td>
                        <td className="py-4 text-muted-foreground">{new Date(fee.date).toLocaleDateString()}</td>
                        <td className="py-4 text-muted-foreground">{fee.method}</td>
                        <td className="py-4">
                          <Badge variant="success">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {fee.status}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {fees.history.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">No payment history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default StudentFees;
