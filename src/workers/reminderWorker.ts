import { Worker } from "bullmq";
import IORedis from "ioredis";
import { NotificationService } from "../modules/notification/service.notification";

// Create Redis connection
const connection = new IORedis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
});

const notificationService = new NotificationService();

// Create worker to process jobs from the 'reminders' queue
const worker = new Worker(
  "reminders",
  async (job) => {
    try {
      console.log(`Processing reminder for event: ${job.data.event.id}`);
      await notificationService.sendReminder(job.data.event);
    } catch (error) {
      console.error(
        `Failed to process reminder for event ${job.data.event.id}:`,
        error,
      );
      throw error; // This will make BullMQ retry the job
    }
  },
  {
    connection,
    removeOnComplete: { count: 100 }, // Keep last 100 completed jobs
    removeOnFail: { count: 100 }, // Keep last 100 failed jobs
  },
);

worker.on("completed", (job) => {
  console.log(`Successfully sent reminder for event: ${job.data.event.id}`);
});

worker.on("failed", (job, err) => {
  console.error(
    `Failed to send reminder for event ${job?.data?.event?.id}:`,
    err,
  );
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Reminder worker started and waiting for jobs...");
