import { QueueService } from "../../modules/queue/service.queue";
import { Event } from "../../modules/event/model.event";
import { NotificationService } from "../../modules/notification/service.notification";
import { clearRedis } from "../utils/redis";

jest.mock("../../src/modules/notification/service.notification");

describe("Worker Integration Tests", () => {
  let queueService: QueueService;
  let notificationService: jest.Mocked<NotificationService>;
  const mockEvent: Event = {
    id: "worker-test-event",
    userId: "worker-test-user",
    title: "Worker Test Event",
    eventTime: new Date(Date.now() + 5000).toISOString(), // 5 seconds from now
    createdAt: new Date().toISOString(),
    reminderMinutes: 1, // 1 minute before
  };

  beforeAll(async () => {
    await clearRedis();
    notificationService =
      new NotificationService() as jest.Mocked<NotificationService>;
    queueService = new QueueService();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearRedis();
  });

  it("should process a reminder job", async () => {
    notificationService.sendReminder.mockResolvedValue(undefined);

    // Schedule the job
    await queueService.scheduleReminder(mockEvent);

    // Normally BullMQ would process this automatically, but we'll simulate it
    const worker = require("../../src/modules/worker").worker;
    const jobs = await worker.queue.getJobs();
    await worker.process(jobs[0]);

    expect(notificationService.sendReminder).toHaveBeenCalledWith(mockEvent);
  });

  it("should handle notification failures", async () => {
    notificationService.sendReminder.mockRejectedValue(
      new Error("Notification failed")
    );

    await queueService.scheduleReminder(mockEvent);

    const worker = require("../../src/modules/worker").worker;
    const jobs = await worker.queue.getJobs();

    await expect(worker.process(jobs[0])).rejects.toThrow(
      "Notification failed"
    );
  });
});
