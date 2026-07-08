import technicianAuthRoutes from "./routes/technicianAuthRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import technicianRoutes from "./routes/technicianRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";


dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================================
// Global Middleware
// ================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// ================================
// Frontend Static Files
// ================================
app.use(
  express.static(
    path.join(__dirname, "../frontend")
  )
);

// ================================
// Home Route
// ================================
app.get("/", (req, res) => {
  res.sendFile(
    path.join(
      __dirname,
      "../frontend/index.html"
    )
  );
});

// ================================
// API Routes
// ================================
app.use("/api", testRoutes);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
"/api/reviews",
reviewRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/technician",
  technicianRoutes
);

app.use(
  "/api/technician-auth",
  technicianAuthRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);
// ================================
// 404 Handler
// ================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

// ================================
// Global Error Handler
// ================================
app.use((err, req, res, next) => {
  console.error(
    "Server Error:",
    err
  );

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

// ================================
// Server Start
// ================================
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 FixMate Server Running on Port ${PORT}`
  );
});