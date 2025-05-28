import { AppService } from "../app/service.app";
import { Event } from "../event/model.event";
import axios from "axios"; // Import at top level

export class NotificationService {
  private appService = new AppService();

  async sendReminder(event: Event) {
    try {
      const deviceTokens = await this.appService.getDeviceTokens(event.userId);

      if (deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${event.userId}`);
        return;
      }

      const notificationPayload = {
        to: deviceTokens,
        sound: "default",
        title: "Cooking Reminder",
        body: `Don't forget to ${event.title} at ${new Date(
          event.eventTime,
        ).toLocaleString()}`,
        data: { eventId: event.id },
      };

      console.log("Sending notification:", notificationPayload);

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://exp.host/--/api/v2/push/send",
        headers: {
          "Content-Type": "application/json",
        },
        data: notificationPayload,
      };

      const response = await axios.request(config);
      console.log("Notification sent successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Failed to send reminder:", error);
      throw error; // Re-throw if you want calling code to handle it
    }
  }
}
