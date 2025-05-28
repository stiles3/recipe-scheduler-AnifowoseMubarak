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
    const upcomingOnly = req.query.upcomingOnly !== "false";
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const lastEvaluatedKey = req.query.lastEvaluatedKey
      ? JSON.parse(req.query.lastEvaluatedKey as string)
      : undefined;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ error: "limit must be a positive number" });
    }

    const { data, meta } = await eventService.getEvents(
      userId,
      upcomingOnly,
      limit,
      lastEvaluatedKey
    );

    res.json({
      data,
      meta,
    });
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      return res.status(400).json({ error: "Invalid lastEvaluatedKey format" });
    }
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
