import mysql from "mysql2/promise";
import { config } from "../config/index.js";

let connectionPool: mysql.Pool;

export async function initializeDatabase() {
  try {
    connectionPool = mysql.createPool(config.database);
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();
    console.log("✓ Database connected successfully");
    return connectionPool;
  } catch (error) {
    console.error("✗ Database connection failed:", error);
    process.exit(1);
  }
}

export function getPool() {
  if (!connectionPool) {
    throw new Error(
      "Database pool not initialized. Call initializeDatabase first.",
    );
  }
  return connectionPool;
}

export async function closeDatabase() {
  if (connectionPool) {
    await connectionPool.end();
    console.log("✓ Database connection closed");
  }
}
