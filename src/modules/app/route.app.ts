import express from "express";

import { z } from "zod";
import { AppService } from "./service.app";

const router = express.Router();
const appService = new AppService();

const AppSchema = z.object({
  userId: z.string(),
  token: z.string(),
});

router.post("/devices", async (req, res) => {
  try {
    const validatedData = AppSchema.parse(req.body);
    await appService.registerDevice(validatedData.userId, validatedData.token);
    res.status(201).end();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export { router };
