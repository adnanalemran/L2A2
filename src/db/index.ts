import { Pool } from "pg";
import config from "../config/index";

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

const refreshUpdatedAtTrigger = `
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
`;

const attachUpdatedAtTrigger = (table: string) => `
  DROP TRIGGER IF EXISTS ${table}_set_updated_at ON ${table};
  CREATE TRIGGER ${table}_set_updated_at
    BEFORE UPDATE ON ${table}
    FOR EACH ROW
    EXECUTE PROCEDURE set_updated_at();
`;

export const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20)
          DEFAULT 'contributor'
          CHECK (role IN ('contributor', 'maintainer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS issues (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL
          CHECK (LENGTH(description) >= 20),
        type VARCHAR(20) NOT NULL
          CHECK (type IN ('bug', 'feature_request')),
        status VARCHAR(20)
          DEFAULT 'open'
          CHECK (status IN ('open', 'in_progress', 'resolved')),
        reporter_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Drop legacy FK if the table was created with REFERENCES users(id)
    await pool.query(`
      DO $$
      DECLARE
        constraint_name TEXT;
      BEGIN
        SELECT tc.constraint_name INTO constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'issues'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'reporter_id'
        LIMIT 1;

        IF constraint_name IS NOT NULL THEN
          EXECUTE format('ALTER TABLE issues DROP CONSTRAINT %I', constraint_name);
        END IF;
      END $$;
    `);

    await pool.query(refreshUpdatedAtTrigger);
    await pool.query(attachUpdatedAtTrigger("users"));
    await pool.query(attachUpdatedAtTrigger("issues"));

    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  }
};