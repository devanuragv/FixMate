import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../firebase/firebaseAdmin.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    const existingUser = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (!existingUser.empty) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userRef = await db.collection("users").add({
      name,
      email,
      phone: phone || "",
      password: hashedPassword,
      role: "customer",
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: userRef.id
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const snapshot = await db
      .collection("users")
      .where("email", "==", email)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userDoc = snapshot.docs[0];
    const user = userDoc.data();

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

const token = jwt.sign(
{
userId:userDoc.id,
email:user.email,
role:user.role
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}
);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: userDoc.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};