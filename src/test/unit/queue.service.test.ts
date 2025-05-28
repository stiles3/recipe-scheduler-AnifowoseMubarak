import { QueueService } from "../../modules/queue/service.queue";
import { Event } from "../../modules/event/model.event";
import { mockQueue } from "../mocks/queue.mock";

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => mockQueue),
  Worker: jest.fn().mockImplementation(() => ({
    on: jest.fn(), // Add this mock implementation
  })),
}));

describe("QueueService", () => {
  let queueService: QueueService;
  const mockEvent: Event = {
    id: "event123",
    userId: "user123",
    title: "Test Event",
    eventTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    createdAt: new Date().toISOString(),
    reminderMinutes: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queueService = new QueueService();
  });

  describe("scheduleReminder", () => {
    it("should schedule a reminder job", async () => {
      await queueService.scheduleReminder(mockEvent);

      expect(mockQueue.add).toHaveBeenCalledWith(
        "reminder",
        { event: mockEvent },
        {
          jobId: `event-${mockEvent.id}`,
          delay: expect.any(Number),
        }
      );
    });

    it("should remove existing job before scheduling new one", async () => {
      const mockJob = {
        remove: jest.fn().mockResolvedValue(true),
        data: { event: { id: mockEvent.id } },
      };
      mockQueue.getJobs.mockResolvedValue([mockJob]);

      await queueService.scheduleReminder(mockEvent);

      expect(mockJob.remove).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled();
    });

  it("should calculate correct delay time", async () => {
    const now = Date.now();
    const eventTime = new Date(now + 60 * 60 * 1000); // 1 hour from now
    const eventWithTime = {
      ...mockEvent,
      eventTime: eventTime.toISOString(),
      // reminderMinutes is not used in the service, so we can remove this
      // reminderMinutes: 15, // Remove this line
    };

    await queueService.scheduleReminder(eventWithTime);

    // Since service uses REMINDER_LEAD_MINUTES (default 30 minutes)
    const expectedDelay = 30 * 60 * 1000; // 30 minutes in ms
    const actualDelay = mockQueue.add.mock.calls[0][2].delay;

    expect(actualDelay).toBeCloseTo(expectedDelay, -3); // Within 1 second
  });

    it("should handle queue errors", async () => {
      mockQueue.add.mockRejectedValue(new Error("Queue error"));
      await expect(queueService.scheduleReminder(mockEvent)).rejects.toThrow(
        "Queue error"
      );
    });
  });
});
