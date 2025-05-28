import { clearTables } from "../utils/dynamodb";
import { clearRedis } from "../utils/redis";

module.exports = async () => {
  // Global teardown for tests
  await clearTables();
  await clearRedis();
};
