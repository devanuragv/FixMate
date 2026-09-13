import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../firebase/firebaseAdmin.js";

export const technicianLogin = async (req, res) => {

  try {

    const { email, password } = req.body;

    const snapshot = await db
      .collection("technicians")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "Technician Not Found"
      });
    }

    const techDoc = snapshot.docs[0];
    const tech = techDoc.data();

    const match = await bcrypt.compare(
      password,
      tech.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
    {
    technicianId: techDoc.id,
    email: tech.email,
    role: "technician"
    },
    process.env.JWT_SECRET,
    {
    expiresIn: "7d"
    }
    );

    res.status(200).json({
      success: true,
      token,
      technician: {
        id: techDoc.id,
        name: tech.name,
        email: tech.email,
        serviceType: tech.serviceType,
        status: tech.status || "Available"
}
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};
