import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PlusCircle, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Seminar } from "@shared/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { SeminarForm, type SeminarFormData } from "@/components/SeminarForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
const fetchSeminars = async (): Promise<Seminar[]> => {
  return api<Seminar[]>("/api/seminars");
};
export function SeminarsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const { data: seminars, isLoading, error } = useQuery<Seminar[]>({
    queryKey: ["seminars"],
    queryFn: fetchSeminars,
  });
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seminars"] });
      setIsFormOpen(false);
      setIsDeleteConfirmOpen(false);
      setSelectedSeminar(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  };
  const createSeminarMutation = useMutation({
    mutationFn: (newSeminar: Omit<Seminar, 'id'>) => api<Seminar>('/api/seminars', { method: 'POST', body: JSON.stringify(newSeminar) }),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success("Seminar created successfully.");
      mutationOptions.onSuccess();
    },
  });
  const updateSeminarMutation = useMutation({
    mutationFn: (updatedSeminar: Seminar) => api<Seminar>(`/api/seminars/${updatedSeminar.id}`, { method: 'PUT', body: JSON.stringify(updatedSeminar) }),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success("Seminar updated successfully.");
      mutationOptions.onSuccess();
    },
  });
  const deleteSeminarMutation = useMutation({
    mutationFn: (seminarId: string) => api(`/api/seminars/${seminarId}`, { method: 'DELETE' }),
    ...mutationOptions,
    onSuccess: (...args) => {
      toast.success("Seminar deleted successfully.");
      mutationOptions.onSuccess();
    },
  });
  const handleFormSubmit = (data: SeminarFormData) => {
    if (selectedSeminar) {
      updateSeminarMutation.mutate({ ...selectedSeminar, ...data });
    } else {
      createSeminarMutation.mutate(data);
    }
  };
  const openCreateForm = () => {
    setSelectedSeminar(null);
    setIsFormOpen(true);
  };
  const openEditForm = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setIsFormOpen(true);
  };
  const openDeleteDialog = (seminar: Seminar) => {
    setSelectedSeminar(seminar);
    setIsDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedSeminar) {
      deleteSeminarMutation.mutate(selectedSeminar.id);
    }
  };
  const isSubmitting = createSeminarMutation.isPending || updateSeminarMutation.isPending;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Seminar Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Create, view, and manage all hotel seminars.</p>
        </div>
        <Button onClick={openCreateForm} className="transition-all active:scale-95">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Seminar
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Seminars</CardTitle>
          <CardDescription>A list of all scheduled seminars. Click on a seminar to view details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seminar Name</TableHead>
                <TableHead>Organizer</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-red-500">Failed to load seminars: {(error as Error).message}</TableCell>
                </TableRow>
              ) : seminars && seminars.length > 0 ? (
                seminars.map((seminar) => (
                  <TableRow key={seminar.id} className="group">
                    <TableCell className="font-medium">{seminar.name}</TableCell>
                    <TableCell>{seminar.organizer}</TableCell>
                    <TableCell>{format(new Date(seminar.startDate), "MMM d, yyyy")} - {format(new Date(seminar.endDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{seminar.assignedRoom}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link to={`/seminars/${seminar.id}`}>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditForm(seminar)}>
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(seminar)} className="text-red-500 focus:text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">No seminars found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SeminarForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={selectedSeminar || {}}
        isSubmitting={isSubmitting}
      />
      {selectedSeminar && (
        <DeleteConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={selectedSeminar.name}
          itemType="seminar"
          isDeleting={deleteSeminarMutation.isPending}
        />
      )}
    </div>
  );
}