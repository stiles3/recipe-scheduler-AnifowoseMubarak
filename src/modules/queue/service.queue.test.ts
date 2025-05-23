// queue.service.test.ts
import { QueueService } from "./service.queue";
import { Event } from "../event/model.event";

// Create a mock implementation of the Queue class
const mockQueue = {
  add: jest.fn(),
  getJobs: jest.fn(),
  close: jest.fn(),
  // Add other Queue methods if needed
};

// Properly type the mock
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
  });

  it("should schedule a reminder", async () => {
    // Setup mock implementations
    mockQueue.add.mockResolvedValue({});
    mockQueue.getJobs.mockResolvedValue([]);

    await queueService.scheduleReminder(mockEvent);

    expect(mockQueue.add).toHaveBeenCalledWith(
      "reminder",
      { event: mockEvent },
      expect.objectContaining({
        jobId: `event-${mockEvent.id}`,
      })
    );
  });

  it("should remove existing job before scheduling new one", async () => {
    const mockJob = {
      remove: jest.fn().mockResolvedValue(undefined),
      data: { event: { id: mockEvent.id } },
    };

    // Setup mock implementations
    mockQueue.add.mockResolvedValue({});
    mockQueue.getJobs.mockResolvedValue([mockJob]);

    await queueService.scheduleReminder(mockEvent);

    expect(mockJob.remove).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalled();
  });
});
