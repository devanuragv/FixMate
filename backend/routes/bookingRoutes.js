import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking
} from "../controllers/bookingController.js";

const router = express.Router();

// ================================
// Create Booking
// ================================
router.post(
  "/create",
  authMiddleware,
  createBooking
);

// ================================
// Get All User Bookings
// ================================
router.get(
  "/",
  authMiddleware,
  getBookings
);

// ================================
// Get Single Booking
// ================================
router.get(
  "/:id",
  authMiddleware,
  getBookingById
);

// ================================
// Update Booking
// ================================
router.put(
  "/:id",
  authMiddleware,
  updateBooking
);

// ================================
// Delete Booking
// ================================
router.delete(
  "/:id",
  authMiddleware,
  deleteBooking
);

export default router;
