import { Router } from "express";
import { run, get, all } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// Get comments for a track
router.get("/track/:trackId", async (req, res) => {
  try {
    const comments = await all(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.track_id = ? 
       ORDER BY c.created_at DESC`,
      [req.params.trackId]
    );
    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// Add a comment
router.post("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { track_id, content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }

    await run(
      "INSERT INTO comments (user_id, track_id, content) VALUES (?, ?, ?)",
      [req.userId, track_id, content]
    );

    // Get the created comment with user info
    const comment = await get(
      `SELECT c.*, u.username 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.user_id = ? AND c.track_id = ? AND c.content = ?
       ORDER BY c.id DESC LIMIT 1`,
      [req.userId, track_id, content]
    );

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// Delete a comment
router.delete("/:id", authMiddleware, async (req: AuthRequest, res) => {
  try {
    await run(
      "DELETE FROM comments WHERE id = ? AND user_id = ?",
      [req.params.id, req.userId]
    );
    res.status(204).send();
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
