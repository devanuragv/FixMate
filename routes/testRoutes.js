import express from "express";
import { db } from "../firebase/firebaseAdmin.js";

const router = express.Router();

router.get("/firebase-test", async (req, res) => {
  try {
    const testRef = db.collection("test").doc("connection");

    await testRef.set({
      status: "connected",
      timestamp: new Date()
    });

    const doc = await testRef.get();

    res.status(200).json({
      success: true,
      message: "Firebase Connected Successfully",
      data: doc.data()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;