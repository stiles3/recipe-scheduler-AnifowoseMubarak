import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { Event } from "../event/model.event";
import { NotificationService } from "../notification/service.notification";

const REMINDER_LEAD_MINUTES = parseInt(
  process.env.REMINDER_LEAD_MINUTES || "30"
);

export class QueueService {
  private queue: Queue;
  private worker: Worker;
  private notificationService = new NotificationService();

  constructor() {
    const connection = new IORedis({
      host: process.env.REDIS_HOST || "redis",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      maxRetriesPerRequest: null,
    });

    this.queue = new Queue("reminders", { connection });

    this.worker = new Worker(
      "reminders",
      async (job) => {
        const { event } = job.data;
        await this.notificationService.sendReminder(event);
      },
      { connection }
    );

    this.worker.on("failed", (job, err) => {
      console.error(`Job failed for event ${job?.data?.event?.id}:`, err);
    });
  }

  async scheduleReminder(event: Event) {
    const reminderTime = new Date(event.eventTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - REMINDER_LEAD_MINUTES);

    // Remove any existing jobs for this event
    const jobs = await this.queue.getJobs();
    const existingJob = jobs.find((j) => j.data.event.id === event.id);
    if (existingJob) {
      await existingJob.remove();
    }

    // Schedule new reminder
    await this.queue.add(
      "reminder",
      { event },
      {
        delay: reminderTime.getTime() - Date.now(),
        jobId: `event-${event.id}`,
      }
    );
  }
}
