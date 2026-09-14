import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import technicianMiddleware from "../middleware/technicianMiddleware.js";

import {

    getAssignedJobs,

    updateJobStatus,

    toggleAvailability,

    updateTechnicianLocation,

    getNearbyTechnicians,

    acceptJob,

    getNewRequests,

    getTechnicianProfile,

    getPublicTechnicianProfile,

    updateTechnicianProfile,

    getTechnicianReviews,

    cancelAssignedJob,

    changePassword

}
from "../controllers/technicianController.js";

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
// New Nearby Service Requests
// ================================

router.get(
    "/new-requests/:technicianId",
    authMiddleware,
    technicianMiddleware,
    getNewRequests
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

router.put(
    "/accept/:id",
    authMiddleware,
    technicianMiddleware,
    acceptJob
);

router.get(
    "/nearby",
    authMiddleware,
    getNearbyTechnicians
);

// ================================
// Update Technician Location
// ================================

router.put(

  "/location",

  authMiddleware,

  technicianMiddleware,

  updateTechnicianLocation

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


// ================================
// Public Technician Profile
// Customer Booking History
// ================================

router.get(
    "/public-profile/:id",
    authMiddleware,
    getPublicTechnicianProfile
);


router.put(
    "/profile/:id",
    authMiddleware,
    technicianMiddleware,
    updateTechnicianProfile
);

// ================================
// Release / Cancel Assigned Job
// ================================

router.put(
    "/cancel-job/:id",
    authMiddleware,
    technicianMiddleware,
    cancelAssignedJob
);


router.put(
    "/change-password/:id",
    authMiddleware,
    technicianMiddleware,
    changePassword
);


export default router;
