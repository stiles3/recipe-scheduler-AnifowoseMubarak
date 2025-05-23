import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const isLocal = process.env.IS_LOCAL === "true";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: isLocal ? "http://dynamodb:8000" : undefined,
  credentials: isLocal
    ? {
        accessKeyId: "fakeMyKeyId",
        secretAccessKey: "fakeSecretAccessKey",
      }
    : undefined,
});

export const docClient = DynamoDBDocumentClient.from(dynamoClient);
