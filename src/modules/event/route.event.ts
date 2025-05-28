import express from "express";
import { EventService } from "./service.event";
import { EventSchema } from "./model.event";

const router = express.Router();
const eventService = new EventService();

//@ts-expect-error: unexpected error response
router.post("/events", async (req, res) => {
  try {
    const validatedData = EventSchema.parse(req.body);
    const eventTime = new Date(validatedData.eventTime);
    if (eventTime < new Date()) {
      return res
        .status(400)
        .json({ error: "Event time must be in the future" });
    }
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

//@ts-expect-error: unexpected error response
router.get("/events", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    console.log(req.query.upcomingOnly);
    const upcomingOnly = req.query.upcomingOnly !== "false";
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const events = await eventService.getEvents(userId, upcomingOnly);
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
