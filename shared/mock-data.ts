import type { Seminar, Attendee } from './types';
export const MOCK_SEMINARS: Seminar[] = [
  {
    id: 'sem1',
    name: 'Cloudflare Connect 2024',
    organizer: 'Cloudflare Inc.',
    startDate: '2024-10-05T09:00:00Z',
    endDate: '2024-10-07T17:00:00Z',
    assignedRoom: 'Grand Ballroom',
  },
  {
    id: 'sem2',
    name: 'Future of Web Development',
    organizer: 'Tech Conferences LLC',
    startDate: '2024-11-12T08:30:00Z',
    endDate: '2024-11-14T18:00:00Z',
    assignedRoom: 'Neptune Hall',
  },
];
export const MOCK_ATTENDEES: Attendee[] = [
  // Seminar 1
  { id: 'att1', seminarId: 'sem1', firstName: 'Alice', lastName: 'Johnson', roomNumber: '101', breakfastStatus: 'Pending' },
  { id: 'att2', seminarId: 'sem1', firstName: 'Bob', lastName: 'Smith', roomNumber: '102', breakfastStatus: 'Pending' },
  { id: 'att3', seminarId: 'sem1', firstName: 'Charlie', lastName: 'Brown', roomNumber: '103', breakfastStatus: 'Served' },
  { id: 'att4', seminarId: 'sem1', firstName: 'Diana', lastName: 'Prince', roomNumber: '201', breakfastStatus: 'Pending' },
  // Seminar 2
  { id: 'att5', seminarId: 'sem2', firstName: 'Eve', lastName: 'Adams', roomNumber: '301', breakfastStatus: 'Pending' },
  { id: 'att6', seminarId: 'sem2', firstName: 'Frank', lastName: 'Castle', roomNumber: '302', breakfastStatus: 'Served' },
  { id: 'att7', seminarId: 'sem2', firstName: 'Grace', lastName: 'Hopper', roomNumber: '305', breakfastStatus: 'Pending' },
  { id: 'att8', seminarId: 'sem2', firstName: 'Heidi', lastName: 'Klum', roomNumber: '404', breakfastStatus: 'Pending' },
];