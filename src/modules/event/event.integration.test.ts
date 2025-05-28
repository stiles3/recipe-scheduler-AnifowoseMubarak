import request from "supertest";
import express from "express";
import { router as eventRouter } from "../event/route.event";
import { EventService } from "./service.event";

// Mock the entire EventService class
jest.mock("./service.event", () => {
  return {
    EventService: jest.fn().mockImplementation(() => ({
      createEvent: jest.fn(),
      getEvents: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
    })),
  };
});

const app = express();
app.use(express.json());
app.use("/events", eventRouter);

describe("Event API Integration Tests", () => {
  const mockEvent = {
    id: "event123",
    userId: "user123",
    title: "Cook dinner",
    eventTime: "2023-12-31T19:00:00Z",
    createdAt: "2023-12-30T10:00:00Z",
    reminderMinutes: 30,
  };

  let eventService: jest.Mocked<EventService>;

  beforeEach(() => {
    // Clear all mocks and get a fresh instance
    jest.clearAllMocks();

    // Get the mock instance
    eventService = new EventService() as jest.Mocked<EventService>;

    // Setup mock implementations
    eventService.createEvent.mockResolvedValue(mockEvent);

    //@ts-expect-error: dynamic data
    eventService.getEvents.mockResolvedValue([mockEvent]);
    eventService.updateEvent.mockResolvedValue({
      ...mockEvent,
      title: "Updated title",
    });
    eventService.deleteEvent.mockResolvedValue();
  });

  describe("POST /events", () => {
    it("should create an event and return 201", async () => {
      const response = await request(app).post("/events").send({
        userId: "user123",
        title: "Cook dinner",
        eventTime: "2023-12-31T19:00:00Z",
      });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockEvent);
    });

    it("should return 400 for invalid event data", async () => {
      const response = await request(app).post("/events").send({
        userId: "user123",
        title: "", // Invalid empty title
        eventTime: "2023-12-31T19:00:00Z",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("GET /events", () => {
    it("should return events for user", async () => {
      const response = await request(app).get("/events?userId=user123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([mockEvent]);
      expect(eventService.getEvents).toHaveBeenCalledWith("user123");
    });

    it("should return 400 when userId is missing", async () => {
      const response = await request(app).get("/events");
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH /events/:id", () => {
    it("should update an event", async () => {
      const response = await request(app)
        .patch("/events/event123")
        .send({ title: "Updated title" });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe("Updated title");
    });

    it("should return 404 for non-existent event", async () => {
      eventService.updateEvent.mockRejectedValue(new Error("Not found"));
      const response = await request(app)
        .patch("/events/nonexistent")
        .send({ title: "Updated title" });

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /events/:id", () => {
    it("should delete an event", async () => {
      const response = await request(app).delete("/events/event123");
      expect(response.status).toBe(204);
    });

    it("should return 404 for non-existent event", async () => {
      eventService.deleteEvent.mockRejectedValue(new Error("Not found"));
      const response = await request(app).delete("/events/nonexistent");
      expect(response.status).toBe(404);
    });
  });
});
