// event.validation.test.ts
import { EventSchema } from "./model.event";

describe("EventSchema validation", () => {
  it("should validate correct event data", () => {
    const validEvent = {
      userId: "user123",
      title: "Cook dinner",
      eventTime: "2023-12-31T19:00:00Z",
      reminderMinutes: 15,
    };

    expect(() => EventSchema.parse(validEvent)).not.toThrow();
  });

  it("should reject invalid event data", () => {
    const invalidEvent = {
      userId: "user123",
      title: "",
      eventTime: "invalid-date",
    };

    expect(() => EventSchema.parse(invalidEvent)).toThrow();
  });
});
