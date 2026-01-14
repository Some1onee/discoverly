import { Router } from "express";
import { run, all } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Track listening history
router.post("/listen", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre } = req.body;

    await run(
      `INSERT INTO listening_history (user_id, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, track_id, track_title || null, track_artist || null, track_image_url || null, track_audio_url || null, track_duration || null, track_genre || null]
    );
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Track listen error:", error);
    res.status(500).json({ error: "Failed to track listening" });
  }
});

// Get user's favorite genres (based on listening history)
router.get("/genres", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const genres = await all(
      `SELECT track_genre, COUNT(*) as count 
       FROM listening_history 
       WHERE user_id = ? AND track_genre IS NOT NULL
       GROUP BY track_genre 
       ORDER BY count DESC 
       LIMIT 5`,
      [req.userId]
    );
    res.json(genres);
  } catch (error) {
    console.error("Get favorite genres error:", error);
    res.status(500).json({ error: "Failed to fetch favorite genres" });
  }
});

// Get recommended tracks (based on liked tracks genres)
router.get("/tracks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get user's favorite genres from likes
    const favoriteGenres = await all(
      `SELECT DISTINCT track_genre 
       FROM likes 
       WHERE user_id = ? AND track_genre IS NOT NULL
       LIMIT 3`,
      [req.userId]
    ) as { track_genre: string }[];

    if (favoriteGenres.length === 0) {
      return res.json({ genres: [], message: "Start liking tracks to get recommendations!" });
    }

    res.json({ genres: favoriteGenres.map(g => g.track_genre) });
  } catch (error) {
    console.error("Get recommendations error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Get listening history
router.get("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const history = await all(
      `SELECT id, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre, listened_at
       FROM listening_history
       WHERE user_id = ?
       ORDER BY listened_at DESC
       LIMIT 100`,
      [req.userId]
    );
    res.json(history);
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ error: "Failed to fetch listening history" });
  }
});

// Clear listening history
router.delete("/history", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await run(
      "DELETE FROM listening_history WHERE user_id = ?",
      [req.userId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Clear history error:", error);
    res.status(500).json({ error: "Failed to clear listening history" });
  }
});

export default router;
