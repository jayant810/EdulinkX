import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Upload, File, X, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function AssignmentPDFModal({ open, onClose, assignment }) {
  const { token } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!assignment) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("pdf", files[0]);
    formData.append("notes", notes);

    try {
      const res = await fetch(`${API_BASE}/api/assignments/${assignment.id}/submit/pdf`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true);
      toast.success("Assignment submitted successfully!");
    } catch (err) {
      toast.error("Error submitting assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {
      if (!isSubmitting) {
        setSubmitted(false);
        setFiles([]);
        setNotes("");
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>

        {!submitted ? (
          <div className="space-y-4 pt-4">
            {/* Assignment Details */}
            <Card className="bg-muted/30 border-none shadow-none">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {assignment.course_code || assignment.courseCode}
                    </Badge>
                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{assignment.max_score || assignment.totalMarks} Marks</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {assignment.description && (
                  <p className="text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Due: <strong>{new Date(assignment.due_date || assignment.dueDate).toLocaleString()}</strong>
                </div>
              </CardContent>
            </Card>

            {/* Upload Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Document (PDF)</label>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="bg-background cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg border border-primary/10 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-destructive/10 flex items-center justify-center text-destructive">
                        <File className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFile(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Submission Notes</label>
                <Textarea
                  placeholder="Anything you want to tell the teacher..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none h-24"
                />
              </div>

              <Button
                variant="hero"
                className="w-full h-12 text-lg shadow-lg"
                disabled={files.length === 0 || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Submit Assignment</>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto shadow-inner border border-success/20">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Submission Confirmed</h3>
              <p className="text-muted-foreground max-w-[250px] mx-auto">
                Your work has been uploaded successfully and is now pending review.
              </p>
            </div>
            <Button variant="outline" className="px-10" onClick={onClose}>Finish</Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
