import express from "express";

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

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.get("/bookings", getAllBookings);

router.put("/assign/:id", assignTechnician);
router.put("/status/:id", updateBookingStatus);

router.get("/technicians", getAllTechnicians);
router.post("/technicians", addTechnician);
router.put("/technicians/:id", updateTechnician);
router.delete("/technicians/:id", deleteTechnician);

export default router;