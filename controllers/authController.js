import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  admin,
  db
} from "../firebase/firebaseAdmin.js";

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

/* =====================================================
   GOOGLE LOGIN
   Firebase → FixMate JWT
===================================================== */

export const googleLogin = async (req, res) => {

  try {

    const { idToken } = req.body;

    if (!idToken) {

      return res.status(400).json({
        success: false,
        message: "Google ID token is required"
      });

    }

    /*
     * Verify Firebase ID token
     *
     * Firebase Admin is already initialized
     * in firebase/firebaseAdmin.js
     */
    const decodedToken =
      await admin.auth().verifyIdToken(idToken);

    /*
     * Make sure this is actually a
     * Google-authenticated account.
     */
    const provider =
      decodedToken.firebase?.sign_in_provider;

    if (provider !== "google.com") {

      return res.status(401).json({
        success: false,
        message: "Invalid Google authentication"
      });

    }

    const firebaseUid =
      decodedToken.uid;

    const email =
      decodedToken.email;

    const name =
      decodedToken.name ||
      email?.split("@")[0] ||
      "FixMate Customer";

    const picture =
      decodedToken.picture || "";

    /*
     * Google accounts should have a verified email.
     */
    if (
      !email ||
      decodedToken.email_verified !== true
    ) {

      return res.status(401).json({
        success: false,
        message: "Google email could not be verified"
      });

    }

    /*
     * -------------------------------------------------
     * FIRST: Look for Firebase UID
     * -------------------------------------------------
     */
    let snapshot =
      await db
        .collection("users")
        .where(
          "firebaseUid",
          "==",
          firebaseUid
        )
        .limit(1)
        .get();

    let userDoc;

    /*
     * -------------------------------------------------
     * If Firebase UID isn't found,
     * look for the same email.
     *
     * This lets an existing FixMate customer
     * connect their Google account.
     * -------------------------------------------------
     */
    if (snapshot.empty) {

      snapshot =
        await db
          .collection("users")
          .where(
            "email",
            "==",
            email
          )
          .limit(1)
          .get();

    }

    /*
     * -------------------------------------------------
     * EXISTING CUSTOMER
     * -------------------------------------------------
     */
    if (!snapshot.empty) {

      userDoc =
        snapshot.docs[0];

      const existingUser =
        userDoc.data();

      /*
       * Don't allow Google to silently
       * turn an admin/other role into a customer.
       */
      if (
        existingUser.role &&
        existingUser.role !== "customer"
      ) {

        return res.status(403).json({
          success: false,
          message:
            "Google login is available only for customer accounts."
        });

      }

      /*
       * Connect this Firebase account
       * to the existing FixMate customer.
       */
      await userDoc.ref.update({

        firebaseUid,

        authProvider: "google",

        profileImage:
          existingUser.profileImage ||
          picture,

        updatedAt: new Date()

      });

    }

    /*
     * -------------------------------------------------
     * NEW CUSTOMER
     * -------------------------------------------------
     */
    else {

      const userRef =
        db.collection("users").doc();

      await userRef.set({

        name,

        email,

        /*
         * Google users don't use the
         * existing bcrypt password login.
         */
        password: "",

        phone: "",

        role: "customer",

        firebaseUid,

        authProvider: "google",

        profileImage: picture,

        createdAt: new Date(),

        updatedAt: new Date()

      });

      userDoc =
        await userRef.get();

    }

    /*
     * Get the final user data
     */
    const user =
      userDoc.data();

    /*
     * -------------------------------------------------
     * CREATE THE SAME FIXMATE JWT
     * USED BY NORMAL LOGIN
     * -------------------------------------------------
     */
    const token =
      jwt.sign(
        {
          userId: userDoc.id,

          email: user.email,

          role: user.role

        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d"
        }
      );

    /*
     * Same response structure as normal login
     */
    return res.status(200).json({

      success: true,

      token,

      user: {

        id: userDoc.id,

        name: user.name,

        email: user.email,

        role: user.role

      }

    });

  } catch (error) {

    console.error(
      "Google login error:",
      error
    );

    return res.status(401).json({

      success: false,

      message:
        "Google authentication failed"

    });

  }

};