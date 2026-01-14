import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDB } from "./db/schema.js";
import authRoutes from "./routes/auth.js";
import playlistRoutes from "./routes/playlists.js";
import likeRoutes from "./routes/likes.js";
import commentRoutes from "./routes/comments.js";
import recommendationRoutes from "./routes/recommendations.js";
import shareRoutes from "./routes/shares.js";
import profileRoutes from "./routes/profile.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" })); // Augmenter la limite pour les avatars en base64

// Initialize database
initDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/profile", profileRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
