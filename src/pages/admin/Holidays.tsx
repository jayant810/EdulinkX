import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useSidebarLinks } from "@/hooks/useSidebarLinks";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const AdminHolidays = () => {
  const { token } = useAuth();
  const userInfo = useUserInfo();
  const { adminLinks } = useSidebarLinks();

  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    holiday_date: "",
    title: "",
    description: "",
    is_weekend: false
  });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/holidays`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setHolidays(await res.json());
    } catch (err) {
      console.error("Failed to fetch holidays", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchHolidays();
  }, [token]);

  const handleAddHoliday = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/holidays`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(holidayForm)
      });
      if (res.ok) {
        toast.success("Holiday added/updated");
        setAddDialog(false);
        setHolidayForm({ holiday_date: "", title: "", description: "", is_weekend: false });
        fetchHolidays();
      }
    } catch (err) {
      toast.error("Failed to add holiday");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/holidays/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success("Holiday deleted");
        fetchHolidays();
      }
    } catch (err) {
      toast.error("Failed to delete holiday");
    }
  };

  return (
    <>
      <Helmet><title>Holidays - Admin</title></Helmet>
      <DashboardLayout
        sidebarLinks={adminLinks}
        userInfo={userInfo}
        title="Holiday Management"
        subtitle="Manage academic holidays and working days"
        headerActions={
          <Button onClick={() => setAddDialog(true)}><Plus className="h-4 w-4 mr-2" /> Add Holiday</Button>
        }
      >
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Upcoming Holidays</CardTitle></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-left font-bold">
                      <th className="p-4">Date</th>
                      <th className="p-4">Holiday Title</th>
                      <th className="p-4">Type</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {holidays.map((h) => (
                      <tr key={h.id}>
                        <td className="p-4 font-mono">{new Date(h.holiday_date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{h.title}</td>
                        <td className="p-4 text-xs">
                          {h.is_weekend ? <span className="text-muted-foreground uppercase">Weekend</span> : <span className="text-primary font-bold uppercase">Gazetted</span>}
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(h.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </td>
                      </tr>
                    ))}
                    {holidays.length === 0 && !loading && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No holidays defined.</td></tr>}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Dialog open={addDialog} onOpenChange={setAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Holiday</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input type="date" value={holidayForm.holiday_date} onChange={e => setHolidayForm({...holidayForm, holiday_date: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Holiday Title</label>
                <Input placeholder="e.g. Republic Day" value={holidayForm.title} onChange={e => setHolidayForm({...holidayForm, title: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="is_weekend" checked={holidayForm.is_weekend} onChange={e => setHolidayForm({...holidayForm, is_weekend: e.target.checked})} />
                <label htmlFor="is_weekend" className="text-sm">Mark as recurring weekend/non-working day</label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
              <Button onClick={handleAddHoliday}>Save Holiday</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default AdminHolidays;
