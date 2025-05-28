import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb";

export default async function () {
  // Connect to your existing DynamoDB container
  const client = new DynamoDBClient({
    region: "us-east-1",
    endpoint: "http://dynamodb-test:8000", // Use your compose service name
    credentials: {
      accessKeyId: "local",
      secretAccessKey: "local",
    },
  });

  console.log("Creating tables...");
  try {
    // Create CookingEvents table
    await client.send(
      new CreateTableCommand({
        TableName: "event",
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "userId", AttributeType: "S" },
          { AttributeName: "eventTime", AttributeType: "S" },
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "UserIdIndex",
            KeySchema: [
              { AttributeName: "userId", KeyType: "HASH" },
              { AttributeName: "eventTime", KeyType: "RANGE" },
            ],
            Projection: {
              ProjectionType: "ALL",
            },
          },
        ],
        BillingMode: "PAY_PER_REQUEST",
      })
    );

    // Create UserDevices table
    await client.send(
      new CreateTableCommand({
        TableName: "app",
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
        BillingMode: "PAY_PER_REQUEST",
      })
    );

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  }
}
