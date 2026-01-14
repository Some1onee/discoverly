import { Router } from "express";
import { run, get, all } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get user likes
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const likes = await all(
      "SELECT * FROM likes WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(likes);
  } catch (error) {
    console.error("Get likes error:", error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
});

// Like a track
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre } = req.body;

    // Check if already liked
    const existing = await get("SELECT id FROM likes WHERE user_id = ? AND track_id = ?", [req.userId, track_id]);
    if (existing) {
      return res.status(400).json({ error: "Track already liked" });
    }

    await run(
      `INSERT INTO likes 
       (user_id, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre || null]
    );

    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error("Like track error:", error);
    res.status(500).json({ error: "Failed to like track" });
  }
});

// Unlike a track
router.delete("/:trackId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await run(
      "DELETE FROM likes WHERE user_id = ? AND track_id = ?",
      [req.userId, req.params.trackId]
    );
    res.status(204).send();
  } catch (error) {
    console.error("Unlike track error:", error);
    res.status(500).json({ error: "Failed to unlike track" });
  }
});

// Check if track is liked
router.get("/check/:trackId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const like = await get(
      "SELECT id FROM likes WHERE user_id = ? AND track_id = ?",
      [req.userId, req.params.trackId]
    );
    res.json({ isLiked: !!like });
  } catch (error) {
    console.error("Check like error:", error);
    res.status(500).json({ error: "Failed to check like status" });
  }
});

export default router;
