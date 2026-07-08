import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import technicianMiddleware from "../middleware/technicianMiddleware.js";

import {
  getAssignedJobs,
  updateJobStatus,
  toggleAvailability,
  getTechnicianProfile,
  updateTechnicianProfile,
  getTechnicianReviews,
  changePassword
}
from
"../controllers/technicianController.js";

const router = express.Router();

// ================================
// Get Assigned Jobs
// ================================
router.get(
  "/jobs/:technicianId",
  authMiddleware,
  technicianMiddleware,
  getAssignedJobs
);

// ================================
// Update Job Status
// ================================
router.put(
  "/status/:id",
  authMiddleware,
  technicianMiddleware,
  updateJobStatus
);

router.get(
"/reviews/:id",
authMiddleware,
technicianMiddleware,
getTechnicianReviews
);

// ================================
// Toggle Availability
// ================================
router.put(
  "/availability/:id",
  authMiddleware,
  technicianMiddleware,
  toggleAvailability
);

// ================================
// Technician Profile
// ================================
router.get(
"/profile/:id",
authMiddleware,
technicianMiddleware,
getTechnicianProfile
);

router.put(
"/profile/:id",
authMiddleware,
technicianMiddleware,
updateTechnicianProfile
);

router.put(
"/change-password/:id",
authMiddleware,
technicianMiddleware,
changePassword
);

export default router;
