import mysql from "mysql2/promise";
import { config } from "../config/index.js";

async function initializeDatabase() {
  let connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    port: config.database.port,
  });

  try {
    // Create database
    await connection.execute(
      `CREATE DATABASE IF NOT EXISTS ${config.database.database}`,
    );
    console.log(`✓ Database '${config.database.database}' created/exists`);

    // Close initial connection and create a new one with database selected
    await connection.end();
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      port: config.database.port,
      database: config.database.database,
    });

    // Create subscriptions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        cycle ENUM('MONTHLY', 'YEARLY') NOT NULL,
        billing_date INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        icon VARCHAR(100) NOT NULL,
        color VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_cycle (cycle),
        INDEX idx_billing_date (billing_date)
      )
    `);
    console.log('✓ Table "subscriptions" created/exists');

    // Insert sample data if table is empty
    const [rows]: any = await connection.execute(
      "SELECT COUNT(*) as count FROM subscriptions",
    );
    if (rows[0].count === 0) {
      const sampleData = [
        [
          "1",
          "Netflix",
          15.99,
          "MONTHLY",
          2,
          "Entertainment",
          "fa-brands fa-netflix",
          "#E50914",
        ],
        [
          "2",
          "Spotify",
          9.99,
          "MONTHLY",
          4,
          "Music",
          "fa-solid fa-music",
          "#1DB954",
        ],
        [
          "3",
          "Adobe CC",
          52.99,
          "MONTHLY",
          7,
          "Design",
          "fa-brands fa-adobe",
          "#FF0000",
        ],
        [
          "4",
          "iCloud+",
          0.99,
          "MONTHLY",
          12,
          "Storage",
          "fa-brands fa-apple",
          "#FFFFFF",
        ],
        [
          "5",
          "Dropbox",
          120.0,
          "YEARLY",
          10,
          "Storage",
          "fa-brands fa-dropbox",
          "#0061FF",
        ],
      ];

      for (const [
        id,
        name,
        amount,
        cycle,
        billingDate,
        category,
        icon,
        color,
      ] of sampleData) {
        await connection.execute(
          "INSERT INTO subscriptions (id, name, amount, cycle, billing_date, category, icon, color) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [id, name, amount, cycle, billingDate, category, icon, color],
        );
      }
      console.log("✓ Sample data inserted");
    }

    console.log("\n✓ Database initialization completed successfully!");
  } catch (error) {
    console.error("✗ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initializeDatabase();
