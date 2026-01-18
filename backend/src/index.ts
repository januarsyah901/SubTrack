import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database/connection.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { config } from "./config/index.js";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: config.api.frontendUrl,
    credentials: true,
  }),
);

// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabase();

    app.listen(config.api.port, () => {
      console.log(`\n✓ Server running at http://localhost:${config.api.port}`);
      console.log(
        `✓ API documentation: http://localhost:${config.api.port}/api`,
      );
      console.log(`✓ Environment: ${config.api.nodeEnv}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
