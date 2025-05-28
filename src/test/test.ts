
import { clearTables } from "./utils/dynamodb";
import { clearRedis } from "./utils/redis";

const {
  DynamoDBClient,
  CreateTableCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://dynamodb:8000", // Changed from localhost to dynamodb
  credentials: {
    accessKeyId: "local", // Match your compose file
    secretAccessKey: "local", // Match your compose file
  },
});

async function createTables() {
  console.log("creating tables----");
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
    console.log("Error creating tables:", error);
  }
}

module.exports = async () => {
  // Global setup for tests
  await clearTables();
  await clearRedis();
  await createTables();
};
