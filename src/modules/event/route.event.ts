import express from "express";
import { EventService } from "./service.event";
import { EventSchema } from "./model.event";

const router = express.Router();
const eventService = new EventService();

router.post("/events", async (req, res) => {
  try {
    const validatedData = EventSchema.parse(req.body);
    const event = await eventService.createEvent(validatedData);
    res.status(201).json(event);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});
// @ts-ignore
router.get("/events", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const events = await eventService.getUpcomingEvents(userId);
    res.json(events);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = EventSchema.partial().parse(req.body);
    const updatedEvent = await eventService.updateEvent(id, updates);
    res.json(updatedEvent);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await eventService.deleteEvent(id);
    res.status(204).end();
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

export { router };
