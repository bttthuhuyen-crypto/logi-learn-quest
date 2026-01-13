import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useEmailInvites } from '@/hooks/useEmailInvites';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSVRow {
  email: string;
  name?: string;
  isValid: boolean;
  error?: string;
}

export const CSVImportTab = () => {
  const { validateEmail, importFromCSV } = useEmailInvites();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [role, setRole] = useState('member');
  const [fileName, setFileName] = useState<string | null>(null);

  const validRows = csvData.filter(r => r.isValid);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes('email') ? 1 : 0;
    const seen = new Set<string>();

    const parsed: CSVRow[] = lines.slice(startIndex).map(line => {
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      const email = parts[0]?.toLowerCase() || '';
      const name = parts[1] || undefined;

      if (!email || !validateEmail(email)) {
        return { email, name, isValid: false, error: 'Email không hợp lệ' };
      }

      if (seen.has(email)) {
        return { email, name, isValid: false, error: 'Email trùng lặp' };
      }

      seen.add(email);
      return { email, name, isValid: true };
    });

    setCSVData(parsed);
  };

  const handleDownloadTemplate = () => {
    const template = 'email,name\nexample@gmail.com,Nguyễn Văn A\ntest@example.com,Trần Thị B';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invite_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;

    await importFromCSV.mutateAsync({
      emails: validRows.map(r => r.email),
      role,
    });

    setCSVData([]);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Template CSV</p>
            <p className="text-xs text-muted-foreground">Tải template để định dạng đúng</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          Tải về
        </Button>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label>Tải lên file CSV</Label>
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          {fileName ? (
            <p className="text-sm font-medium">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium">Nhấn để chọn file hoặc kéo thả vào đây</p>
              <p className="text-xs text-muted-foreground mt-1">Chỉ chấp nhận file .csv</p>
            </>
          )}
        </div>
      </div>

      {/* Preview Table */}
      {csvData.length > 0 && (
        <div className="space-y-2">
          <Label>
            Xem trước ({validRows.length} hợp lệ / {csvData.length} dòng)
          </Label>
          <ScrollArea className="h-[180px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {row.isValid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell className={row.isValid ? '' : 'text-muted-foreground'}>
                      {row.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.name || '-'}
                    </TableCell>
                    <TableCell>
                      {row.error ? (
                        <Badge variant="destructive" className="text-xs">
                          {row.error}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Sẵn sàng
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      )}

      {/* Role Selection */}
      <div className="space-y-2">
        <Label>Vai trò</Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="member">Thành viên</SelectItem>
            <SelectItem value="moderator">Điều hành viên</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Import Button */}
      <Button
        className="w-full"
        onClick={handleImport}
        disabled={validRows.length === 0 || importFromCSV.isPending}
      >
        {importFromCSV.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        Import {validRows.length} thành viên
      </Button>
    </div>
  );
};
