import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../../core/config/database";

export class AppService {
  private tableName = "app";

  async registerDevice(userId: string, token: string): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: { userId, token },
    });

    await docClient.send(command);
  }

  async getDeviceTokens(userId: string): Promise<string[]> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { userId },
    });

    const result = await docClient.send(command);
    return result.Item?.token ? [result.Item.token] : [];
  }
}
