// src/test/integration/teardown.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteTableCommand } from "@aws-sdk/client-dynamodb";

// This should match your setup.ts container variable
let container: any;

export default async function () {
  // Get the container instance from global scope
  container = (global as any).__DYNAMODB_CONTAINER;

  const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: process.env.DYNAMODB_ENDPOINT,
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
  });

  try {
    // Clean up tables
    await client.send(new DeleteTableCommand({ TableName: "event" }));
    await client.send(new DeleteTableCommand({ TableName: "app" }));
  } catch (error) {
    console.log("Error deleting tables:", error);
  }

  // Stop the container
  if (container) {
    await container.stop();
  }
}
