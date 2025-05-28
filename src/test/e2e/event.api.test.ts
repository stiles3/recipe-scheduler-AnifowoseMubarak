import request from "supertest";
import { API_URL } from "../utils/config";
import { clearTables } from "../utils/dynamodb";
import { clearRedis } from "../utils/redis";

describe("Event API End-to-End Tests", () => {
  const testUserId = "e2e-test-user";
  const testEvent = {
    userId: testUserId,
    title: "E2E Test Event",
    eventTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  };

  beforeAll(async () => {
    await clearTables();
    await clearRedis();
  });

  beforeEach(async () => {
    await clearTables();
    await clearRedis();
  });

  it("should create an event via POST /events", async () => {
    const response = await request(API_URL)
      .post("/events")
      .send(testEvent)
      .expect(201);

    expect(response.body).toMatchObject({
      userId: testEvent.userId,
      title: testEvent.title,
      eventTime: testEvent.eventTime,
    });
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("createdAt");
  });

  it("should retrieve events via GET /events", async () => {
    // First create an event
    const createResponse = await request(API_URL)
      .post("/events")
      .send(testEvent);

    // Then retrieve it
    const getResponse = await request(API_URL)
      .get("/events")
      .query({ userId: testUserId })
      .expect(200);

    expect(getResponse.body.data.length).toBe(1);
    expect(getResponse.body.data[0].id).toBe(createResponse.body.id);
  });

  it("should update an event via PATCH /events/:id", async () => {
    const createResponse = await request(API_URL)
      .post("/events")
      .send(testEvent);

    const updateResponse = await request(API_URL)
      .patch(`/events/${createResponse.body.id}`)
      .send({ title: "Updated Title" })
      .expect(200);

    expect(updateResponse.body.title).toBe("Updated Title");

    // Verify with GET
    const getResponse = await request(API_URL)
      .get("/events")
      .query({ userId: testUserId });
    expect(getResponse.body.data[0].title).toBe("Updated Title");
  });

  it("should delete an event via DELETE /events/:id", async () => {
    const createResponse = await request(API_URL)
      .post("/events")
      .send(testEvent);

    await request(API_URL)
      .delete(`/events/${createResponse.body.id}`)
      .expect(204);

    // Verify with GET
    const getResponse = await request(API_URL)
      .get("/events")
      .query({ userId: testUserId });
    expect(getResponse.body.data.length).toBe(0);
  });

  it("should return 400 for invalid event data", async () => {
    const invalidEvent = {
      userId: testUserId,
      title: "", // Invalid empty title
      eventTime: testEvent.eventTime,
    };

    await request(API_URL).post("/events").send(invalidEvent).expect(400);
  });
});
