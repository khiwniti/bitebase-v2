// SQLite database configuration
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";
import { join } from 'path';

// Database file path - defaults to ./data/database.db
const DATABASE_PATH = process.env.DATABASE_URL || join(process.cwd(), 'data', 'database.db');

// Ensure the data directory exists
import { mkdirSync } from 'fs';
import { dirname } from 'path';

try {
  mkdirSync(dirname(DATABASE_PATH), { recursive: true });
} catch (error) {
  // Directory might already exist, ignore
}

// Lazy initialization to speed up startup
let _sqlite: Database.Database | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

export function getSqlite() {
  if (!_sqlite) {
    console.log(`🔌 Initializing SQLite database at: ${DATABASE_PATH}`);
    _sqlite = new Database(DATABASE_PATH);
    _sqlite.pragma('journal_mode = WAL'); // Enable WAL mode for better performance
  }
  return _sqlite;
}

export function getDb() {
  if (!_db) {
    _db = drizzle(getSqlite(), { schema });
  }
  return _db;
}

// Backward compatibility exports
export const sqlite = getSqlite();
export const db = getDb();