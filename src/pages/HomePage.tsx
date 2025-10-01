import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Utensils, CheckCircle, Hourglass, Download, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import type { Attendee, Seminar } from "@shared/types";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/export";
const fetchAllSeminars = async (): Promise<Seminar[]> => {
  return api<Seminar[]>("/api/seminars");
};
const fetchAllAttendees = async (): Promise<Attendee[]> => {
  return api<Attendee[]>("/api/attendees");
};
export function HomePage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeminarId, setSelectedSeminarId] = useState<string>("all");
  const { data: seminars = [], isLoading: isLoadingSeminars } = useQuery<Seminar[]>({
    queryKey: ["seminars"],
    queryFn: fetchAllSeminars,
  });
  const { data: attendees = [], isLoading: isLoadingAttendees } = useQuery<Attendee[]>({
    queryKey: ["allAttendees"],
    queryFn: fetchAllAttendees,
  });
  const confirmBreakfastMutation = useMutation({
    mutationFn: (attendeeId: string) => api(`/api/attendees/${attendeeId}/confirm-breakfast`, { method: "POST" }),
    onSuccess: (updatedAttendee: Attendee) => {
      toast.success(`${updatedAttendee.firstName} ${updatedAttendee.lastName}'s breakfast confirmed.`);
      queryClient.setQueryData(['allAttendees'], (oldData: Attendee[] | undefined) => {
        return oldData ? oldData.map(a => a.id === updatedAttendee.id ? updatedAttendee : a) : [];
      });
      setSearchTerm("");
    },
    onError: (error) => {
      toast.error(`Failed to confirm breakfast: ${error.message}`);
    },
  });
  const filteredAttendeesBySeminar = useMemo(() => {
    if (selectedSeminarId === "all") return attendees;
    return attendees.filter(a => a.seminarId === selectedSeminarId);
  }, [attendees, selectedSeminarId]);
  const searchedAttendees = useMemo(() => {
    if (!searchTerm) return [];
    return filteredAttendeesBySeminar.filter(
      (attendee) =>
        attendee.roomNumber.toString().includes(searchTerm) &&
        attendee.breakfastStatus === "Pending"
    );
  }, [searchTerm, filteredAttendeesBySeminar]);
  const pendingAttendees = useMemo(() => filteredAttendeesBySeminar.filter(a => a.breakfastStatus === 'Pending'), [filteredAttendeesBySeminar]);
  const servedAttendees = useMemo(() => filteredAttendeesBySeminar.filter(a => a.breakfastStatus === 'Served'), [filteredAttendeesBySeminar]);
  const handleConfirmBreakfast = (attendeeId: string) => {
    confirmBreakfastMutation.mutate(attendeeId);
  };
  const handleExport = (format: 'csv' | 'pdf') => {
    const seminarName = selectedSeminarId === 'all' ? 'All Seminars' : seminars.find(s => s.id === selectedSeminarId)?.name || 'Seminar';
    const dataToExport = [...servedAttendees, ...pendingAttendees];
    if (format === 'csv') {
      exportToCSV(dataToExport, `breakfast-report-${seminarName.toLowerCase().replace(/ /g, '-')}`);
      toast.success("CSV report generated.");
    } else {
      exportToPDF(dataToExport, `Breakfast Report - ${seminarName}`);
      toast.success("PDF report generated.");
    }
  };
  const AttendeeCard = ({ attendee }: { attendee: Attendee }) => (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md animate-fade-in">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="font-semibold text-lg">{attendee.firstName} {attendee.lastName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Room: {attendee.roomNumber}</p>
        </div>
        <Button
          onClick={() => handleConfirmBreakfast(attendee.id)}
          disabled={confirmBreakfastMutation.isPending}
          className="bg-green-500 hover:bg-green-600 active:scale-95 transition-all"
        >
          <Utensils className="mr-2 h-4 w-4" />
          Confirm Breakfast
        </Button>
      </CardContent>
    </Card>
  );
  const AttendeeList = ({ list, emptyMessage }: { list: Attendee[], emptyMessage: string }) => {
    if (isLoadingAttendees) {
      return Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full mb-2" />
      ));
    }
    if (list.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-8">{emptyMessage}</p>;
    }
    return (
      <div className="space-y-2">
        {list.map((attendee) => (
          <div key={attendee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div>
              <p className="font-medium">{attendee.firstName} {attendee.lastName}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Room: {attendee.roomNumber}</p>
            </div>
            {attendee.breakfastStatus === 'Served' && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Breakfast Dashboard</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Find Attendee by Room Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter room number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-6"
            />
          </div>
          {searchTerm && (
            <div className="mt-4">
              {searchedAttendees.length > 0 ? (
                searchedAttendees.map((attendee) => (
                  <AttendeeCard key={attendee.id} attendee={attendee} />
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 pt-4">No pending attendees found for this room number.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <Select onValueChange={setSelectedSeminarId} defaultValue="all" disabled={isLoadingSeminars}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Filter by seminar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Seminars</SelectItem>
            {seminars.map(seminar => (
              <SelectItem key={seminar.id} value={seminar.id}>{seminar.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export List
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              <FileDown className="mr-2 h-4 w-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              <FileDown className="mr-2 h-4 w-4" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            <Hourglass className="mr-2 h-4 w-4" />
            Pending ({pendingAttendees.length})
          </TabsTrigger>
          <TabsTrigger value="served">
            <CheckCircle className="mr-2 h-4 w-4" />
            Served ({servedAttendees.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Breakfast</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendeeList list={pendingAttendees} emptyMessage="All attendees have been served breakfast." />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="served">
          <Card>
            <CardHeader>
              <CardTitle>Breakfast Served</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendeeList list={servedAttendees} emptyMessage="No attendees have been served breakfast yet." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}