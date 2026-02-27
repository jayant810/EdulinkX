import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface BulkUploadProps {
  onUpload: (data: any[]) => void;
  templateData?: any[];
  templateFileName?: string;
  buttonText?: string;
}

export const BulkUpload: React.FC<BulkUploadProps> = ({ 
  onUpload, 
  templateData, 
  templateFileName = "template.xlsx",
  buttonText = "Bulk Upload"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          toast.error("The Excel file is empty");
          return;
        }

        onUpload(data);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (err) {
        toast.error("Error parsing Excel file");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    if (!templateData) return;
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, templateFileName);
  };

  return (
    <div className="flex gap-2">
      {templateData && (
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-1" /> Template
        </Button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        className="hidden"
      />
      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
        <FileSpreadsheet className="h-4 w-4 mr-1" /> {buttonText}
      </Button>
    </div>
  );
};
