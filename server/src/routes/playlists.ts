import { Router } from "express";
import { run, get, all } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get user playlists
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const playlists = await all(
      "SELECT * FROM playlists WHERE user_id = ? ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(playlists);
  } catch (error) {
    console.error("Get playlists error:", error);
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// Create playlist
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, is_public } = req.body;

    await run(
      "INSERT INTO playlists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)",
      [req.userId, name, description || null, is_public ?? true]
    );

    const playlist = await get(
      "SELECT * FROM playlists WHERE user_id = ? AND name = ? ORDER BY id DESC LIMIT 1",
      [req.userId, name]
    );

    res.status(201).json(playlist);
  } catch (error) {
    console.error("Create playlist error:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// Get playlist tracks
router.get("/:id/tracks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const tracks = await all(
      "SELECT * FROM playlist_tracks WHERE playlist_id = ? ORDER BY added_at DESC",
      [req.params.id]
    );
    res.json(tracks);
  } catch (error) {
    console.error("Get playlist tracks error:", error);
    res.status(500).json({ error: "Failed to fetch playlist tracks" });
  }
});

// Add track to playlist
router.post("/:id/tracks", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre } = req.body;

    await run(
      `INSERT INTO playlist_tracks 
       (playlist_id, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, track_id, track_title, track_artist, track_image_url, track_audio_url, track_duration, track_genre || null]
    );

    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Add track to playlist error:", error);
    res.status(500).json({ error: "Failed to add track to playlist" });
  }
});

// Remove track from playlist
router.delete("/:playlistId/tracks/:trackId", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await run(
      "DELETE FROM playlist_tracks WHERE id = ? AND playlist_id IN (SELECT id FROM playlists WHERE user_id = ?)",
      [req.params.trackId, req.userId]
    );
    res.status(204).send();
  } catch (error) {
    console.error("Remove track from playlist error:", error);
    res.status(500).json({ error: "Failed to remove track from playlist" });
  }
});

// Delete playlist
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await run(
      "DELETE FROM playlists WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  } catch (error) {
    console.error("Delete playlist error:", error);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
});

export default router;
