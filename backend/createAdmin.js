import bcrypt from "bcrypt";
import { db } from "./firebase/firebaseAdmin.js";

const email = "admin@fixmate.com";
const password = "Admin@123";

try {

    const snapshot = await db
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (!snapshot.empty) {
        console.log("Admin already exists.");
        process.exit(0);
    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    await db.collection("users").add({
        name: "FixMate Admin",
        email,
        phone: "",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date()
    });

    console.log("================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("================================");

} catch (error) {

    console.error("ERROR CREATING ADMIN:");
    console.error(error);

}