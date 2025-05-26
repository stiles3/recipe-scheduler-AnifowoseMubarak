import { QueueService } from "./service.queue";
import { Event } from "../event/model.event";

const mockQueue = {
  add: jest.fn(),
  getJobs: jest.fn(),
  close: jest.fn(),
  getJob: jest.fn(),
};

jest.mock("bullmq", () => ({
  ...jest.requireActual("bullmq"),
  Queue: jest.fn().mockImplementation(() => mockQueue),
}));

describe("QueueService", () => {
  let queueService: QueueService;
  const mockEvent: Event = {
    id: "event123",
    userId: "user123",
    title: "Cook dinner",
    eventTime: "2023-12-31T19:00:00Z",
    createdAt: "2023-12-30T10:00:00Z",
    reminderMinutes: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queueService = new QueueService();
    mockQueue.add.mockResolvedValue({});
    mockQueue.getJobs.mockResolvedValue([]);
  });

  describe("scheduleReminder", () => {
    it("should schedule a reminder", async () => {
      await queueService.scheduleReminder(mockEvent);

      expect(mockQueue.add).toHaveBeenCalledWith(
        "reminder",
        { event: mockEvent },
        expect.objectContaining({
          jobId: `event-${mockEvent.id}`,
          delay: expect.any(Number),
        })
      );
    });

    it("should remove existing job before scheduling new one", async () => {
      const mockJob = {
        remove: jest.fn().mockResolvedValue(undefined),
        data: { event: { id: mockEvent.id } },
      };
      mockQueue.getJobs.mockResolvedValue([mockJob]);

      await queueService.scheduleReminder(mockEvent);

      expect(mockJob.remove).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalled();
    });

    it("should handle queue add failure", async () => {
      mockQueue.add.mockRejectedValue(new Error("Queue error"));

      await expect(queueService.scheduleReminder(mockEvent)).rejects.toThrow(
        "Queue error"
      );
    });

    it("should calculate correct delay time", async () => {
      const now = new Date();
      const eventTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const eventWithTime = {
        ...mockEvent,
        eventTime: eventTime.toISOString(),
        reminderMinutes: 15, // 15 minutes before
      };

      await queueService.scheduleReminder(eventWithTime);

      const expectedDelay = 45 * 60 * 1000; // 45 minutes in ms (60 - 15)
      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({
          delay: expect.closeTo(expectedDelay, 1000), // Allow 1 second variance
        })
      );
    });
  });
});
