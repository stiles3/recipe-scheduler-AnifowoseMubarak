import { AppService } from "../app/service.app";
import { Event } from "../event/model.event";

export class NotificationService {
  private appService = new AppService();

  async sendReminder(event: Event) {
    try {
      const deviceTokens = await this.appService.getDeviceTokens(event.userId);

      if (deviceTokens.length === 0) {
        console.log(`No device tokens found for user ${event.userId}`);
        return;
      }

      const axios = require("axios");
      let data = JSON.stringify({
        to: deviceTokens,
        sound: "default",
        title: "Cooking Reminder",
        body: `Don't forget to ${event.title} at ${new Date(
          event.eventTime
        ).toLocaleString()}`,
        data: { eventId: event.id },
      });

      let config = {
        method: "post",
        maxBodyLength: Infinity,
        url: "https://exp.host/--/api/v2/push/send",
        headers: {
          "Content-Type": "application/json",
        },
        data: data,
      };

      axios
        .request(config)
        .then((response: any) => {
          console.log(JSON.stringify(response.data));
        })
        .catch((error: any) => {
          console.log(error);
        });

      // In a real implementation, we would use Expo's push notification service
      console.log("Sending reminder:", {
        to: deviceTokens,
        title: "Cooking Reminder",
        body: `Don't forget to ${event.title} at ${new Date(
          event.eventTime
        ).toLocaleString()}`,
        data: { eventId: event.id },
      });

      // TODO: Implement actual Expo push notification
      // await sendPushNotifications(deviceTokens, {
      //   title: 'Cooking Reminder',
      //   body: `Don't forget to ${event.title} at ${new Date(event.eventTime).toLocaleString()}`,
      //   data: { eventId: event.id }
      // });
    } catch (error) {
      console.error("Failed to send reminder:", error);
    }
  }
}
