import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

import {
  getDashboardStats,
  getAllUsers,
  getAllBookings,
  addTechnician,
  getAllTechnicians,
  assignTechnician,
  updateBookingStatus,
  deleteTechnician,
  updateTechnician
} from "../controllers/adminController.js";

const router = express.Router();

// ================================
// Dashboard Stats
// ================================
router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);

// ================================
// Users
// ================================
router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

// ================================
// Bookings
// ================================
router.get(
  "/bookings",
  authMiddleware,
  adminMiddleware,
  getAllBookings
);

router.put(
  "/assign/:id",
  authMiddleware,
  adminMiddleware,
  assignTechnician
);

router.put(
  "/status/:id",
  authMiddleware,
  adminMiddleware,
  updateBookingStatus
);

// ================================
// Technicians
// ================================
router.get(
  "/technicians",
  authMiddleware,
  adminMiddleware,
  getAllTechnicians
);

router.post(
  "/technicians",
  authMiddleware,
  adminMiddleware,
  addTechnician
);

router.put(
  "/technicians/:id",
  authMiddleware,
  adminMiddleware,
  updateTechnician
);

router.delete(
  "/technicians/:id",
  authMiddleware,
  adminMiddleware,
  deleteTechnician
);

export default router;