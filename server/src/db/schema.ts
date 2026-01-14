import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../discoverly.db");

let db: SqlJsDatabase;

async function getDB() {
  if (!db) {
    const SQL = await initSqlJs();
    
    // Try to load existing database
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }
  }
  return db;
}

export async function saveDB() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(dbPath, data);
  }
}

export async function initDB() {
  const database = await getDB();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT,
      bio TEXT,
      location TEXT,
      website TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS playlist_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlist_id INTEGER NOT NULL,
      track_id TEXT NOT NULL,
      track_title TEXT NOT NULL,
      track_artist TEXT NOT NULL,
      track_image_url TEXT,
      track_audio_url TEXT,
      track_duration TEXT,
      track_genre TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      track_id TEXT NOT NULL,
      track_title TEXT NOT NULL,
      track_artist TEXT NOT NULL,
      track_image_url TEXT,
      track_audio_url TEXT,
      track_duration TEXT,
      track_genre TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, track_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      track_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS listening_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      track_id TEXT NOT NULL,
      track_title TEXT,
      track_artist TEXT,
      track_image_url TEXT,
      track_audio_url TEXT,
      track_duration TEXT,
      track_genre TEXT,
      listened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      track_id TEXT NOT NULL,
      track_title TEXT NOT NULL,
      track_artist TEXT NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_likes_track_id ON likes(track_id);
    CREATE INDEX IF NOT EXISTS idx_comments_track_id ON comments(track_id);
    CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON playlist_tracks(playlist_id);
  `);

  await saveDB();
  console.log("Database initialized successfully");
}

export async function getDatabase() {
  return await getDB();
}

// Helper functions for easier querying
export async function run(sql: string, params: any[] = []) {
  const database = await getDB();
  database.run(sql, params);
  await saveDB();
}

export async function get(sql: string, params: any[] = []) {
  const database = await getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const result = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return result;
}

export async function all(sql: string, params: any[] = []) {
  const database = await getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export async function prepare(sql: string) {
  const database = await getDB();
  return database.prepare(sql);
}
