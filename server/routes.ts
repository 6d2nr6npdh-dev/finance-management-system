import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import transactionsRouter from "./routes/transactions";
import authMiddleware from "./middleware/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // health endpoint (optional, handy for quick checks)
  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Protected API: transactions
  // All routes under /api/transactions require Authorization: Bearer <access_token>
  app.use("/api/transactions", authMiddleware, transactionsRouter);

  // You can add more routers here, e.g.:
  // import budgetsRouter from "./routes/budgets";
  // app.use("/api/budgets", authMiddleware, budgetsRouter);

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  return httpServer;
}
