import { z } from 'zod';
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface Seminar {
  id: string;
  name: string;
  organizer: string;
  startDate: string; // ISO 8601 date string
  endDate: string;   // ISO 8601 date string
  assignedRoom: string;
}
export interface Attendee {
  id: string;
  seminarId: string;
  firstName: string;
  lastName: string;
  roomNumber: string;
  breakfastStatus: 'Pending' | 'Served';
}
// Zod Schemas for validation
export const seminarSchema = z.object({
  name: z.string().min(3, { message: "Seminar name must be at least 3 characters long." }),
  organizer: z.string().min(2, { message: "Organizer name must be at least 2 characters long." }),
  startDate: z.coerce.date({ message: "Start date is required." }),
  endDate: z.coerce.date({ message: "End date is required." }),
  assignedRoom: z.string().min(1, { message: "Assigned room is required." }),
}).refine(data => data.endDate >= data.startDate, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
});
export const attendeeSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  roomNumber: z.string().min(1, { message: "Room number is required." }),
});