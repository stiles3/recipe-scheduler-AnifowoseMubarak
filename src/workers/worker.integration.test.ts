// worker.integration.test.ts
import { NotificationService } from "../modules/notification/service.notification";
import { Worker } from "bullmq";
import { Event } from "../modules/event/model.event";

jest.mock("./service.notification");

describe("Worker", () => {
  const mockEvent: Event = {
    id: "event123",
    userId: "user123",
    title: "Cook dinner",
    eventTime: "2023-12-31T19:00:00Z",
    createdAt: "2023-12-30T10:00:00Z",
    reminderMinutes: 30,
  };

  let notificationService: jest.Mocked<NotificationService>;
  let worker: Worker;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService =
      new NotificationService() as jest.Mocked<NotificationService>;
    notificationService.sendReminder.mockResolvedValue(undefined);
  });

  it("should process a reminder job successfully", async () => {
    // Simulate worker processing a job
    const processFn = require("./worker").worker.process;
    await processFn({
      data: { event: mockEvent },
    });

    expect(notificationService.sendReminder).toHaveBeenCalledWith(mockEvent);
  });

  it("should handle job failure", async () => {
    notificationService.sendReminder.mockRejectedValue(
      new Error("Failed to send")
    );

    const processFn = require("./worker").worker.process;
    await expect(
      processFn({
        data: { event: mockEvent },
      })
    ).rejects.toThrow("Failed to send");
  });
});
