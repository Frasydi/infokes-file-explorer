import { Pool } from "pg";

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/postgres";
  
  // Extract database name from connection string
  const dbName = connectionString.split('/').pop() || "asessment";
  
  // Create connection to postgres database (not the target database)
  const baseConnectionString = connectionString.replace(`/${dbName}`, '/postgres');
  const pool = new Pool({ connectionString: baseConnectionString });

  try {
    console.log("🔄 Setting up database...");

    // Check if database exists
    const dbCheckResult = await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheckResult.rows.length === 0) {
      // Create database
      await pool.query(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Database "${dbName}" created successfully`);
    } else {
      console.log(`✅ Database "${dbName}" already exists`);
    }

    await pool.end();
    
    // Now connect to the new database and run migrations
    const dbPool = new Pool({ connectionString });

    // Create tables
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS "folders" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "parent_id" integer,
        "path" varchar(1000) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS "files" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "folder_id" integer NOT NULL,
        "size" integer DEFAULT 0,
        "extension" varchar(10),
        "path" varchar(1000) NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `;

    await dbPool.query(createTablesSQL);
    console.log("✅ Tables created successfully");

    // Add foreign key constraints (if they don't exist)
    try {
      await dbPool.query(`
        ALTER TABLE "folders" 
        ADD CONSTRAINT "folders_parent_id_folders_id_fk" 
        FOREIGN KEY ("parent_id") REFERENCES "folders"("id") ON DELETE cascade ON UPDATE no action;
      `);
      console.log("✅ Folders foreign key constraint added");
    } catch (error) {
      // Constraint might already exist, that's fine
      console.log("ℹ️ Folders foreign key constraint already exists");
    }

    try {
      await dbPool.query(`
        ALTER TABLE "files" 
        ADD CONSTRAINT "files_folder_id_folders_id_fk" 
        FOREIGN KEY ("folder_id") REFERENCES "folders"("id") ON DELETE cascade ON UPDATE no action;
      `);
      console.log("✅ Files foreign key constraint added");
    } catch (error) {
      // Constraint might already exist, that's fine
      console.log("ℹ️ Files foreign key constraint already exists");
    }

    await dbPool.end();
    console.log("🎉 Database setup completed!");

  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();
