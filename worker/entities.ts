import { IndexedEntity } from "./core-utils";
import type { Seminar, Attendee } from "@shared/types";
import { MOCK_SEMINARS, MOCK_ATTENDEES } from "@shared/mock-data";
// SEMINAR ENTITY
export class SeminarEntity extends IndexedEntity<Seminar> {
  static readonly entityName = "seminar";
  static readonly indexName = "seminars";
  static readonly initialState: Seminar = {
    id: "",
    name: "",
    organizer: "",
    startDate: "",
    endDate: "",
    assignedRoom: "",
  };
  static seedData = MOCK_SEMINARS;
}
// ATTENDEE ENTITY
export class AttendeeEntity extends IndexedEntity<Attendee> {
  static readonly entityName = "attendee";
  static readonly indexName = "attendees";
  static readonly initialState: Attendee = {
    id: "",
    seminarId: "",
    firstName: "",
    lastName: "",
    roomNumber: "",
    breakfastStatus: "Pending",
  };
  static seedData = MOCK_ATTENDEES;
  async confirmBreakfast(): Promise<Attendee> {
    return this.mutate(s => ({ ...s, breakfastStatus: 'Served' }));
  }
}