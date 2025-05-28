import { EventSchema } from "./model.event";

describe("EventSchema validation", () => {
  const validEvent = {
    userId: "user123",
    title: "Cook dinner",
    eventTime: "2023-12-31T19:00:00Z",
    reminderMinutes: 15,
  };

  it("should validate correct event data", () => {
    expect(() => EventSchema.parse(validEvent)).not.toThrow();
  });

  it("should require userId", () => {
    const invalidEvent = { ...validEvent, userId: undefined };
    expect(() => EventSchema.parse(invalidEvent)).toThrow();
  });

  it("should require title", () => {
    const invalidEvent = { ...validEvent, title: "" };
    expect(() => EventSchema.parse(invalidEvent)).toThrow();
  });

  it("should require valid ISO date", () => {
    const invalidEvent = { ...validEvent, eventTime: "invalid-date" };
    expect(() => EventSchema.parse(invalidEvent)).toThrow();
  });

  it("should reject past dates", () => {
    const invalidEvent = { ...validEvent, eventTime: "2020-01-01T00:00:00Z" };
    expect(() => EventSchema.parse(invalidEvent)).toThrow();
  });

  it("should validate reminderMinutes range", () => {
    const invalidEvent1 = { ...validEvent, reminderMinutes: -1 };
    const invalidEvent2 = { ...validEvent, reminderMinutes: 1441 };

    expect(() => EventSchema.parse(invalidEvent1)).toThrow();
    expect(() => EventSchema.parse(invalidEvent2)).toThrow();
  });

  it("should set default reminderMinutes if not provided", () => {
    const { ...eventWithoutReminder } = validEvent;
    const result = EventSchema.parse(eventWithoutReminder);
    expect(result.reminderMinutes).toBe(30);
  });
});
