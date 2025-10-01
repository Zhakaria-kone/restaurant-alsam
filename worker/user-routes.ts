import { Hono } from "hono";
import type { Env } from './core-utils';
import { SeminarEntity, AttendeeEntity } from "./entities";
import { ok, bad, notFound } from './core-utils';
import { seminarSchema, attendeeSchema } from '@shared/types';
import type { Attendee } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Ensure seed data is loaded on first request in dev
  app.use('/api/*', async (c, next) => {
    await SeminarEntity.ensureSeed(c.env);
    await AttendeeEntity.ensureSeed(c.env);
    await next();
  });
  // SEMINAR ROUTES
  app.get('/api/seminars', async (c) => {
    const { items } = await SeminarEntity.list(c.env);
    return ok(c, items);
  });
  app.post('/api/seminars', async (c) => {
    const body = await c.req.json();
    const parsed = seminarSchema.safeParse(body);
    if (!parsed.success) return bad(c, JSON.stringify(parsed.error.flatten().fieldErrors));
    const newSeminar = {
      id: crypto.randomUUID(),
      ...parsed.data,
      startDate: parsed.data.startDate.toISOString(),
      endDate: parsed.data.endDate.toISOString(),
    };
    await SeminarEntity.create(c.env, newSeminar);
    return ok(c, newSeminar);
  });
  app.get('/api/seminars/:id', async (c) => {
    const { id } = c.req.param();
    const seminar = new SeminarEntity(c.env, id);
    if (!(await seminar.exists())) return notFound(c, 'Seminar not found');
    return ok(c, await seminar.getState());
  });
  app.put('/api/seminars/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = seminarSchema.safeParse(body);
    if (!parsed.success) return bad(c, JSON.stringify(parsed.error.flatten().fieldErrors));
    const seminar = new SeminarEntity(c.env, id);
    if (!(await seminar.exists())) return notFound(c, 'Seminar not found');
    const updatedData = {
      ...parsed.data,
      startDate: parsed.data.startDate.toISOString(),
      endDate: parsed.data.endDate.toISOString(),
    };
    await seminar.patch(updatedData);
    return ok(c, { id, ...updatedData });
  });
  app.delete('/api/seminars/:id', async (c) => {
    const { id } = c.req.param();
    const existed = await SeminarEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'Seminar not found');
    // Also delete associated attendees
    const { items: allAttendees } = await AttendeeEntity.list(c.env);
    const attendeeIdsToDelete = allAttendees.filter(a => a.seminarId === id).map(a => a.id);
    await AttendeeEntity.deleteMany(c.env, attendeeIdsToDelete);
    return ok(c, { id });
  });
  // ATTENDEE ROUTES
  app.get('/api/attendees', async (c) => {
    const { items } = await AttendeeEntity.list(c.env);
    return ok(c, items);
  });

  app.get('/api/seminars/:id/attendees', async (c) => {
    const { id: seminarId } = c.req.param();
    const { items: allAttendees } = await AttendeeEntity.list(c.env);
    const seminarAttendees = allAttendees.filter(a => a.seminarId === seminarId);
    return ok(c, seminarAttendees);
  });
  app.post('/api/seminars/:seminarId/attendees', async (c) => {
    const { seminarId } = c.req.param();
    const body = await c.req.json();
    const parsed = attendeeSchema.safeParse(body);
    if (!parsed.success) return bad(c, JSON.stringify(parsed.error.flatten().fieldErrors));
    const newAttendee = {
      id: crypto.randomUUID(),
      seminarId,
      ...parsed.data,
      breakfastStatus: 'Pending' as const,
    };
    await AttendeeEntity.create(c.env, newAttendee);
    return ok(c, newAttendee);
  });
  app.post('/api/seminars/:seminarId/attendees/bulk', async (c) => {
    const { seminarId } = c.req.param();
    const body = await c.req.json();
    if (!Array.isArray(body)) return bad(c, 'Request body must be an array of attendees.');
    const newAttendees: Attendee[] = [];
    for (const item of body) {
      const parsed = attendeeSchema.safeParse(item);
      if (parsed.success) {
        newAttendees.push({
          id: crypto.randomUUID(),
          seminarId,
          ...parsed.data,
          breakfastStatus: 'Pending' as const,
        });
      } else {
        return bad(c, `Invalid attendee data: ${parsed.error.message}`);
      }
    }
    if (newAttendees.length > 0) {
      await AttendeeEntity.createMany(c.env, newAttendees);
    }
    return ok(c, { count: newAttendees.length });
  });
  app.put('/api/attendees/:id', async (c) => {
    const { id } = c.req.param();
    const body = await c.req.json();
    const parsed = attendeeSchema.safeParse(body);
    if (!parsed.success) return bad(c, JSON.stringify(parsed.error.flatten().fieldErrors));
    const attendee = new AttendeeEntity(c.env, id);
    if (!(await attendee.exists())) return notFound(c, 'Attendee not found');
    await attendee.patch(parsed.data);
    const updatedState = await attendee.getState();
    return ok(c, updatedState);
  });
  app.delete('/api/attendees/:id', async (c) => {
    const { id } = c.req.param();
    const existed = await AttendeeEntity.delete(c.env, id);
    if (!existed) return notFound(c, 'Attendee not found');
    return ok(c, { id });
  });
  app.post('/api/attendees/:id/confirm-breakfast', async (c) => {
    const { id } = c.req.param();
    const attendee = new AttendeeEntity(c.env, id);
    if (!(await attendee.exists())) return notFound(c, 'Attendee not found');
    const updatedAttendee = await attendee.confirmBreakfast();
    return ok(c, updatedAttendee);
  });
}