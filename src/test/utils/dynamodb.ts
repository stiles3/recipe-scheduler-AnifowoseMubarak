import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

export const docClient = DynamoDBDocumentClient.from(client);

export async function clearTables() {
  try {
    // Clear events table
    const scanResult = await docClient.send(
      new ScanCommand({ TableName: 'event' })
    );
    
    if (scanResult.Items) {
      await Promise.all(scanResult.Items.map(async (item) => {
        await docClient.send(
          new DeleteCommand({
            TableName: 'event',
            Key: { id: item.id },
          })
        );
      }))
    }

    // Clear app table (if needed)
    const appScanResult = await docClient.send(
      new ScanCommand({ TableName: 'app' })
    );
    
    if (appScanResult.Items) {
      await Promise.all(appScanResult.Items.map(async (item) => {
        await docClient.send(
          new DeleteCommand({
            TableName: 'app',
            Key: { userId: item.userId },
          })
        );
      }))
    }
  } catch (error) {
    console.error('Error clearing tables:', error);
  }
}