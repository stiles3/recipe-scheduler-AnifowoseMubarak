import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { router as eventRouter } from "./modules/event/route.event";
import { router as appRouter } from "./modules/app/route.app";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use("/api", eventRouter);
app.use("/api", appRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
