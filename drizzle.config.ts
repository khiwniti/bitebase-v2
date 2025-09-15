import { defineConfig } from "drizzle-kit";
import { join } from 'path';

// Database file path - defaults to ./data/database.db
const DATABASE_PATH = process.env.DATABASE_URL || join(process.cwd(), 'data', 'database.db');

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_PATH,
  },
});
