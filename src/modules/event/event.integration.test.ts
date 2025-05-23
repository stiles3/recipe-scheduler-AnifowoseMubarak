// events.integration.test.ts
import request from "supertest";
import express from "express";
import { router as eventRouter } from "../event/route.event";
import { EventService } from "./service.event";

jest.mock("./service.event");

const app = express();
app.use(express.json());
app.use("/events", eventRouter);

describe("POST /events", () => {
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
      mockEvent
    );
  });

  it("should create an event and return 201", async () => {
    const response = await request(app).post("/events").send({
      userId: "user123",
      title: "Cook dinner",
      eventTime: "2023-12-31T19:00:00Z",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockEvent);
    expect(EventService.prototype.createEvent).toHaveBeenCalledWith({
      userId: "user123",
      title: "Cook dinner",
      eventTime: "2023-12-31T19:00:00Z",
      reminderMinutes: 30,
    });
  });
});
