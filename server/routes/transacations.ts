import express from "express";
import supabaseAdmin from "../supabase.js";

const router = express.Router();

// GET /api/transactions
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    res.json({ transactions: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/transactions
router.post("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { amount, category, notes, date } = req.body;
    const payload = {
      user_id: userId,
      amount,
      category,
      notes,
      date: date ?? new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert(payload)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json({ transaction: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;