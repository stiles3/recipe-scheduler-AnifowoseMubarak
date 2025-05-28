import { EventService } from "@modules/event/service.event";
import { docClient } from "../utils/dynamodb";
import { clearTables } from "../utils/dynamodb";
import { clearRedis } from "../utils/redis";

describe("EventService Integration Tests", () => {
  let eventService: EventService;
  const testUserId = "test-user-integration";

  beforeAll(async () => {
    await clearTables();
    await clearRedis();
    eventService = new EventService();
  });

  beforeEach(async () => {
    await clearTables();
    await clearRedis();
  });

  it("should create and retrieve an event", async () => {
    const eventData = {
      userId: testUserId,
      title: "Integration Test Event",
      eventTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      reminderMinutes: 0,
    };

    const createdEvent = await eventService.createEvent(eventData);
    expect(createdEvent).toHaveProperty("id");
    expect(createdEvent.title).toBe(eventData.title);

    // Retrieve events
    const { data: events } = await eventService.getEvents(testUserId);
    expect(events.length).toBe(1);
    expect(events[0].id).toBe(createdEvent.id);
  });

  it("should update an event", async () => {
    const eventData = {
      userId: testUserId,
      title: "Original Title",
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      reminderMinutes: 0,
    };

    const createdEvent = await eventService.createEvent(eventData);
    const updatedEvent = await eventService.updateEvent(createdEvent.id, {
      title: "Updated Title",
    });

    expect(updatedEvent.title).toBe("Updated Title");

    const { data: events } = await eventService.getEvents(testUserId);
    expect(events[0].title).toBe("Updated Title");
  });

  it("should delete an event", async () => {
    const eventData = {
      userId: testUserId,
      title: "Event to Delete",
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      reminderMinutes: 0,
    };

    const createdEvent = await eventService.createEvent(eventData);
    await eventService.deleteEvent(createdEvent.id);

    const { data: events } = await eventService.getEvents(testUserId);
    expect(events.length).toBe(0);
  });

  it("should only return upcoming events when requested", async () => {
    const pastEvent = {
      userId: testUserId,
      title: "Past Event",
      eventTime: new Date(Date.now() - 3600000).toISOString(),
      reminderMinutes: 0,
    };
    const futureEvent = {
      userId: testUserId,
      title: "Future Event",
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      reminderMinutes: 0,
    };

    await eventService.createEvent(pastEvent);

    await eventService.createEvent(futureEvent);

    // Get all events
    const allEvents = await eventService.getEvents(testUserId, false);
    expect(allEvents.data.length).toBe(2);

    // Get only upcoming events
    const upcomingEvents = await eventService.getEvents(testUserId, true);
    expect(upcomingEvents.data.length).toBe(1);
    expect(upcomingEvents.data[0].title).toBe("Future Event");
  });
});
