import { NotificationService } from "../modules/notification/service.notification";
import { Event } from "../modules/event/model.event";

jest.mock("../modules/notification/service.notification");

describe("Worker Integration Tests", () => {
  const mockEvent: Event = {
    id: "event123",
    userId: "user123",
    title: "Cook dinner",
    eventTime: "2023-12-31T19:00:00Z",
    createdAt: "2023-12-30T10:00:00Z",
    reminderMinutes: 30,
  };

  let notificationService: jest.Mocked<NotificationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    notificationService =
      new NotificationService() as jest.Mocked<NotificationService>;
  });

  it("should process a reminder job successfully", async () => {
    notificationService.sendReminder.mockResolvedValue(undefined);

    const processFn = require("./worker").worker.process;
    await processFn({
      data: { event: mockEvent, deviceToken: "valid-token" },
    });

    expect(notificationService.sendReminder).toHaveBeenCalledWith(
      mockEvent,
      "valid-token",
    );
  });

  it("should handle missing device token", async () => {
    const processFn = require("./worker").worker.process;
    await expect(
      processFn({
        data: { event: mockEvent }, // No device token
      }),
    ).rejects.toThrow("No device token provided");
  });

  it("should handle notification failure", async () => {
    notificationService.sendReminder.mockRejectedValue(
      new Error("Failed to send"),
    );

    const processFn = require("./worker").worker.process;
    await expect(
      processFn({
        data: { event: mockEvent, deviceToken: "valid-token" },
      }),
    ).rejects.toThrow("Failed to send");
  });
});
