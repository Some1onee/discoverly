import { Router } from "express";
import { run, get } from "../db/schema.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const updateProfileSchema = z.object({
  full_name: z.string().max(100).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url().max(200).optional().or(z.literal("")),
  avatar_url: z.string().optional(),
});

// Get user profile
router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await get(
      "SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users WHERE id = ?",
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.put("/", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    await run(
      `UPDATE users 
       SET full_name = ?, bio = ?, location = ?, website = ?, avatar_url = ?
       WHERE id = ?`,
      [
        data.full_name || null,
        data.bio || null,
        data.location || null,
        data.website || null,
        data.avatar_url || null,
        req.userId,
      ]
    );

    const updatedUser = await get(
      "SELECT id, username, email, full_name, bio, location, website, avatar_url, created_at FROM users WHERE id = ?",
      [req.userId]
    );

    res.json(updatedUser);
  } catch (error: any) {
    console.error("Update profile error:", error);
    res.status(400).json({ error: error.message || "Failed to update profile" });
  }
});

// Get user stats
router.get("/stats", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const stats = await get(
      `SELECT 
        (SELECT COUNT(*) FROM likes WHERE user_id = ?) as likes_count,
        (SELECT COUNT(*) FROM playlists WHERE user_id = ?) as playlists_count,
        (SELECT COUNT(*) FROM comments WHERE user_id = ?) as comments_count,
        (SELECT COUNT(*) FROM listening_history WHERE user_id = ?) as listens_count`,
      [req.userId, req.userId, req.userId, req.userId]
    );

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

export default router;
