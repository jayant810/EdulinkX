import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface BulkPDFUploadProps {
  onUpload: (file: File) => void;
  buttonText?: string;
}

export const BulkPDFUpload: React.FC<BulkPDFUploadProps> = ({ 
  onUpload, 
  buttonText = "Bulk Upload PDF"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    onUpload(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        className="hidden"
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <FileText className="h-4 w-4 mr-1" /> {buttonText}
      </Button>
    </div>
  );
};
