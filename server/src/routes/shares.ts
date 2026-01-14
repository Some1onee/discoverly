import { Router } from "express";
import { run, get } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();

// Create a share link for a track
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { track_id, track_title, track_artist } = req.body;

    const shareToken = crypto.randomBytes(16).toString("hex");

    await run(
      "INSERT INTO shares (user_id, track_id, track_title, track_artist, share_token) VALUES (?, ?, ?, ?, ?)",
      [req.userId, track_id, track_title, track_artist, shareToken]
    );

    res.status(201).json({
      share_token: shareToken,
      share_url: `${req.protocol}://${req.get("host")}/shared/${shareToken}`,
    });
  } catch (error) {
    console.error("Create share error:", error);
    res.status(500).json({ error: "Failed to create share link" });
  }
});

// Get shared track info
router.get("/:token", async (req, res) => {
  try {
    const share = await get(
      "SELECT * FROM shares WHERE share_token = ?",
      [req.params.token]
    );

    if (!share) {
      return res.status(404).json({ error: "Share not found" });
    }

    res.json(share);
  } catch (error) {
    console.error("Get share error:", error);
    res.status(500).json({ error: "Failed to fetch share" });
  }
});

export default router;
