"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.docClient = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const isLocal = process.env.IS_LOCAL === "true";
const dynamoClient = new client_dynamodb_1.DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: isLocal ? "http://dynamodb:8000" : undefined,
    credentials: isLocal
        ? {
            accessKeyId: "fakeMyKeyId",
            secretAccessKey: "fakeSecretAccessKey",
        }
        : undefined,
});
exports.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(dynamoClient);
