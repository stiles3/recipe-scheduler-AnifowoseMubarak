import { z } from "zod";

export const EventSchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  eventTime: z.string().datetime(),
  createdAt: z.string().datetime().optional(),
  reminderMinutes: z.number().int().min(0).default(30),
});

export type Event = z.infer<typeof EventSchema> & { id: string };
