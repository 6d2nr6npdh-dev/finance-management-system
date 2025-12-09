import { Request, Response, NextFunction } from "express";
import supabaseAdmin from "../supabase.js";

interface SupabaseUser {
  id: string;
  email?: string | null;
  [k: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseUser;
    }
  }
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Missing Authorization header" });

    const parts = header.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ error: "Invalid Authorization format" });

    const token = parts[1];

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    req.user = data.user as SupabaseUser;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Internal auth error" });
  }
}