import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, PlusCircle, Users, MoreHorizontal, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api-client";
import type { Seminar, Attendee } from "@shared/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { AttendeeForm } from "@/components/AttendeeForm";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { ImportDialog } from "@/components/ImportDialog";
const fetchSeminar = async (seminarId: string): Promise<Seminar> => {
  return api<Seminar>(`/api/seminars/${seminarId}`);
};
const fetchAttendees = async (seminarId: string): Promise<Attendee[]> => {
  return api<Attendee[]>(`/api/seminars/${seminarId}/attendees`);
};
function SeminarDetailContent({ seminarId }: { seminarId: string }) {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const { data: seminar, isLoading: isLoadingSeminar, error: seminarError } = useQuery<Seminar>({
    queryKey: ["seminar", seminarId],
    queryFn: () => fetchSeminar(seminarId),
  });
  const { data: attendees, isLoading: isLoadingAttendees, error: attendeesError } = useQuery<Attendee[]>({
    queryKey: ["attendees", seminarId],
    queryFn: () => fetchAttendees(seminarId),
  });
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees", seminarId] });
      setIsFormOpen(false);
      setIsDeleteConfirmOpen(false);
      setSelectedAttendee(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  };
  const createAttendeeMutation = useMutation({
    mutationFn: (newAttendee: Omit<Attendee, 'id' | 'seminarId' | 'breakfastStatus'>) => api<Attendee>(`/api/seminars/${seminarId}/attendees`, { method: 'POST', body: JSON.stringify(newAttendee) }),
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Attendee added successfully.");
      mutationOptions.onSuccess();
    },
  });
  const updateAttendeeMutation = useMutation({
    mutationFn: (updatedAttendee: Attendee) => api<Attendee>(`/api/attendees/${updatedAttendee.id}`, { method: 'PUT', body: JSON.stringify(updatedAttendee) }),
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Attendee updated successfully.");
      mutationOptions.onSuccess();
    },
  });
  const deleteAttendeeMutation = useMutation({
    mutationFn: (attendeeId: string) => api(`/api/attendees/${attendeeId}`, { method: 'DELETE' }),
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Attendee deleted successfully.");
      mutationOptions.onSuccess();
    },
  });
  const bulkCreateAttendeesMutation = useMutation({
    mutationFn: (newAttendees: Omit<Attendee, 'id' | 'seminarId' | 'breakfastStatus'>[]) => api(`/api/seminars/${seminarId}/attendees/bulk`, { method: 'POST', body: JSON.stringify(newAttendees) }),
    onSuccess: () => {
      toast.success("Attendees imported successfully.");
      queryClient.invalidateQueries({ queryKey: ["attendees", seminarId] });
      setIsImportOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Import failed: ${error.message}`);
    },
  });
  const handleFormSubmit = (data: Omit<Attendee, 'id' | 'seminarId' | 'breakfastStatus'>) => {
    if (selectedAttendee) {
      updateAttendeeMutation.mutate({ ...selectedAttendee, ...data });
    } else {
      createAttendeeMutation.mutate(data);
    }
  };
  const openCreateForm = () => {
    setSelectedAttendee(null);
    setIsFormOpen(true);
  };
  const openEditForm = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsFormOpen(true);
  };
  const openDeleteDialog = (attendee: Attendee) => {
    setSelectedAttendee(attendee);
    setIsDeleteConfirmOpen(true);
  };
  const handleDeleteConfirm = () => {
    if (selectedAttendee) {
      deleteAttendeeMutation.mutate(selectedAttendee.id);
    }
  };
  const handleImportSubmit = (data: any[]) => {
    bulkCreateAttendeesMutation.mutate(data);
  };
  const isSubmitting = createAttendeeMutation.isPending || updateAttendeeMutation.isPending;
  if (isLoadingSeminar) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />)}</CardContent></Card>
      </div>
    );
  }
  if (seminarError) return <div className="text-red-500">Error loading seminar: {(seminarError as Error).message}</div>;
  return (
    <div className="space-y-8">
      <Button asChild variant="outline" size="sm" className="mb-4"><Link to="/seminars"><ArrowLeft className="mr-2 h-4 w-4" />Back to Seminars</Link></Button>
      {seminar && (
        <Card>
          <CardHeader><CardTitle className="text-2xl">{seminar.name}</CardTitle><CardDescription>{seminar.organizer}</CardDescription></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</span><span>{format(new Date(seminar.startDate), "PPP")}</span></div>
            <div className="flex flex-col"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">End Date</span><span>{format(new Date(seminar.endDate), "PPP")}</span></div>
            <div className="flex flex-col"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned Room</span><span>{seminar.assignedRoom}</span></div>
            <div className="flex flex-col"><span className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendees</span><span className="flex items-center gap-1"><Users className="h-4 w-4" /> {attendees?.length ?? 0}</span></div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div><CardTitle>Attendees</CardTitle><CardDescription>List of all attendees for this seminar.</CardDescription></div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="transition-all active:scale-95" onClick={() => setIsImportOpen(true)}><Upload className="mr-2 h-4 w-4" />Import Attendees</Button>
            <Button size="sm" className="transition-all active:scale-95" onClick={openCreateForm}><PlusCircle className="mr-2 h-4 w-4" />Add Attendee</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Room Number</TableHead><TableHead>Breakfast Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoadingAttendees ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}><TableCell><Skeleton className="h-5 w-32" /></TableCell><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell><TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell></TableRow>
                ))
              ) : attendeesError ? (
                <TableRow><TableCell colSpan={4} className="text-center text-red-500">Failed to load attendees: {(attendeesError as Error).message}</TableCell></TableRow>
              ) : attendees && attendees.length > 0 ? (
                attendees.map((attendee) => (
                  <TableRow key={attendee.id}>
                    <TableCell className="font-medium">{attendee.firstName} {attendee.lastName}</TableCell>
                    <TableCell>{attendee.roomNumber}</TableCell>
                    <TableCell><Badge variant={attendee.breakfastStatus === "Served" ? "default" : "secondary"} className={attendee.breakfastStatus === "Served" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}>{attendee.breakfastStatus}</Badge></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditForm(attendee)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(attendee)} className="text-red-500 focus:text-red-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="text-center h-24">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500">No attendees found for this seminar.</p>
                    <p className="text-sm text-gray-400">Add an attendee or import a list to get started.</p>
                  </div>
                </TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AttendeeForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        defaultValues={selectedAttendee || {}}
        isSubmitting={isSubmitting}
      />
      {selectedAttendee && (
        <DeleteConfirmationDialog
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
          itemName={`${selectedAttendee.firstName} ${selectedAttendee.lastName}`}
          itemType="attendee"
          isDeleting={deleteAttendeeMutation.isPending}
        />
      )}
      <ImportDialog
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={handleImportSubmit}
        isImporting={bulkCreateAttendeesMutation.isPending}
      />
    </div>
  );
}
export function SeminarDetailPage() {
  const { seminarId } = useParams<{ seminarId: string }>();
  if (!seminarId) {
    return (
      <div>
        <Button asChild variant="outline" size="sm" className="mb-4">
          <Link to="/seminars">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Seminars
          </Link>
        </Button>
        <div className="text-red-500 text-center py-10">Invalid Seminar ID. Please select a valid seminar.</div>
      </div>
    );
  }
  return <SeminarDetailContent seminarId={seminarId} />;
}