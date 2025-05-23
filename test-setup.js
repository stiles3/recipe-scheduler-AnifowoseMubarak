// test-setup.ts
const { docClient } = require("./src/core/config/database");
const { createTables } = require("./src/scripts/createTable");

async function setup() {
  try {
    await createTables();

    // Optional: Seed test data
    await docClient
      .send({
        TableName: "app",
        Item: { userId: "test-user", token: "test-token" },
      })
      .promise();

    console.log("Test setup completed");
  } catch (err) {
    console.error("Test setup failed:", err);
    process.exit(1);
  }
}

setup();
