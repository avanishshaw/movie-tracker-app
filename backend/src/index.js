// src/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import mediaRoutes from "./routes/media.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = (
      process.env.FRONTEND_ORIGIN || "http://localhost:5173"
    ).split(",");
    // Allow requests with no origin like Postman or mobile apps
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight requests

app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("API is running..."));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/media", mediaRoutes);
app.use("/api/v1/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// Only start the server if this file is run directly (not imported)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export the app for testing
export default app;