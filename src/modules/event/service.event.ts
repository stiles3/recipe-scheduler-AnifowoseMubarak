import {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Event } from "./model.event";
import { docClient } from "../../core/config/database";
import { QueueService } from "../queue/service.queue";

export class EventService {
  private tableName = "event";
  private queueService = new QueueService();

  async createEvent(
    eventData: Omit<Event, "id" | "createdAt">
  ): Promise<Event> {
    const event: Event = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      ...eventData,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: event,
    });

    await docClient.send(command);

    // Schedule reminder
    await this.queueService.scheduleReminder(event);

    return event;
  }

  async getEvents(
    userId: string,
    upcomingOnly: boolean = true,
    limit: number = 10,
    exclusiveStartKey?: Record<string, any>
  ): Promise<{
    data: Event[];
    meta: {
      totalCount?: number; // Note: Getting total count requires a separate scan
      page: number; // This is conceptual since DynamoDB uses LastEvaluatedKey
      limit: number;
      hasMore: boolean;
      lastEvaluatedKey?: Record<string, any>;
    };
  }> {
    const params: {
      TableName: string;
      FilterExpression: string;
      ExpressionAttributeValues: Record<string, string>;
      Limit: number;
      ExclusiveStartKey?: Record<string, any>;
    } = {
      TableName: this.tableName,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
      Limit: limit,
    };

    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }

    if (upcomingOnly) {
      params.FilterExpression += " AND eventTime > :now";
      params.ExpressionAttributeValues[":now"] = new Date().toISOString();
    }

    const command = new ScanCommand(params);
    const result = await docClient.send(command);

    return {
      data: (result.Items as Event[]) || [],
      meta: {
        limit,
        hasMore: !!result.LastEvaluatedKey,
        lastEvaluatedKey: result.LastEvaluatedKey,
        page: 0,
      },
    };
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const updateExpression: string[] = [];
    const expressionAttributeValues: Record<string, unknown> = {};

    Object.entries(updates).forEach(([key, value]) => {
      updateExpression.push(`${key} = :${key}`);
      expressionAttributeValues[`:${key}`] = value;
    });

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(", ")}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await docClient.send(command);
    const updatedEvent = result.Attributes as Event;

    // Reschedule reminder if time changed
    if (updates.eventTime) {
      await this.queueService.scheduleReminder(updatedEvent);
    }

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await docClient.send(command);
    // TODO: Cancel any pending reminders
  }
}
