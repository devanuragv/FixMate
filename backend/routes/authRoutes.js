import express from "express";
import {
  registerUser,
  loginUser,
  googleLogin
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth Routes Working"
  });
});

export default router;