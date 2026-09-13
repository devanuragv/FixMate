import express from "express";

import {
  technicianLogin
} from "../controllers/technicianAuthController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Technician Auth Routes Working"
  });
});

router.post(
  "/login",
  technicianLogin
);

export default router;
