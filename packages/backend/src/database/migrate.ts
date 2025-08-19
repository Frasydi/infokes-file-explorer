import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./connection";

async function runMigrations() {
  console.log("🔄 Running database migrations...");
  
  try {
    await migrate(db, { migrationsFolder: "./src/database/migrations" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
