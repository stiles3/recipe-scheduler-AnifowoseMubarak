import request from "supertest";
import express from "express";
import { router as eventRouter } from "../event/route.event";
import { EventService } from "./service.event";

jest.mock("./service.event");

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

  beforeEach(() => {
    jest.clearAllMocks();
    (EventService.prototype.createEvent as jest.Mock).mockResolvedValue(
      mockEvent,
    );
    (EventService.prototype.getEvents as jest.Mock).mockResolvedValue([
      mockEvent,
    ]);
    (EventService.prototype.updateEvent as jest.Mock).mockResolvedValue({
      ...mockEvent,
      title: "Updated title",
    });
    (EventService.prototype.deleteEvent as jest.Mock).mockResolvedValue(true);
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
      expect(EventService.prototype.getEvents).toHaveBeenCalledWith("user123");
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
      (EventService.prototype.updateEvent as jest.Mock).mockRejectedValue(
        new Error("Not found"),
      );
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
      (EventService.prototype.deleteEvent as jest.Mock).mockRejectedValue(
        new Error("Not found"),
      );
      const response = await request(app).delete("/events/nonexistent");
      expect(response.status).toBe(404);
    });
  });
});
