import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UploadCloud, X } from 'lucide-react';
import { toast } from 'sonner';
interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
  isImporting: boolean;
}
export function ImportDialog({ isOpen, onClose, onImport, isImporting }: ImportDialogProps) {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFileName(file.name);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const requiredHeaders = ['firstName', 'lastName', 'roomNumber'];
          const actualHeaders = results.meta.fields || [];
          const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
          if (missingHeaders.length > 0) {
            toast.error(`CSV is missing required headers: ${missingHeaders.join(', ')}`);
            resetState();
            return;
          }
          const validData = results.data.filter((row: any) => row.firstName && row.lastName && row.roomNumber);
          setParsedData(validData);
          toast.success(`${validData.length} valid rows parsed from ${file.name}.`);
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
          resetState();
        }
      });
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });
  const resetState = () => {
    setParsedData([]);
    setFileName(null);
  };
  const handleClose = () => {
    resetState();
    onClose();
  };
  const handleImportClick = () => {
    onImport(parsedData);
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Attendees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: firstName, lastName, roomNumber.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {!fileName ? (
            <div
              {...getRootProps()}
              className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {isDragActive ? 'Drop the file here...' : 'Drag & drop a CSV file here, or click to select'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 border rounded-md">
                <p className="font-medium">{fileName}</p>
                <Button variant="ghost" size="icon" onClick={resetState}><X className="h-4 w-4" /></Button>
              </div>
              <h3 className="font-semibold">Preview Data ({parsedData.length} rows)</h3>
              <ScrollArea className="h-64 border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Room Number</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 100).map((row, index) => ( // Preview up to 100 rows
                      <TableRow key={index}>
                        <TableCell>{row.firstName}</TableCell>
                        <TableCell>{row.lastName}</TableCell>
                        <TableCell>{row.roomNumber}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button onClick={handleImportClick} disabled={parsedData.length === 0 || isImporting}>
            {isImporting ? `Importing ${parsedData.length} attendees...` : `Import ${parsedData.length} attendees`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}