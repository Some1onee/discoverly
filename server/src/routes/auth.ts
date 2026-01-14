import { Router } from "express";
import bcrypt from "bcrypt";
import { run, get, saveDB } from "../db/schema.js";
import { generateToken } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = signupSchema.parse(req.body);

    // Check if user exists
    const existing = await get("SELECT id FROM users WHERE email = ? OR username = ?", [email, username]);
    if (existing) {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await run(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword]
    );

    // Get the newly created user
    const user = await get("SELECT id, username, email FROM users WHERE email = ?", [email]) as any;

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    res.status(400).json({ error: error.message || "Signup failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await get("SELECT * FROM users WHERE email = ?", [email]) as any;

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(400).json({ error: error.message || "Login failed" });
  }
});

export default router;
