import bcrypt from "bcryptjs";
import { db } from "../firebase/firebaseAdmin.js";

// ================================
// Dashboard Stats
// ================================
export const getDashboardStats = async (req, res) => {
  try {

    const usersSnapshot =
      await db.collection("users").get();

    const bookingsSnapshot =
      await db.collection("bookings").get();

    const techniciansSnapshot =
      await db.collection("technicians").get();

    res.status(200).json({
      success: true,
      stats: {
        users: usersSnapshot.size,
        bookings: bookingsSnapshot.size,
        technicians: techniciansSnapshot.size
      }
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Get All Users
// ================================
export const getAllUsers = async (req, res) => {
  try {

    const snapshot =
      await db.collection("users").get();

    const users = [];

    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Get All Bookings
// ================================
export const getAllBookings = async (req, res) => {
  try {

    const snapshot =
      await db.collection("bookings").get();

    const bookings = [];

    snapshot.forEach((doc) => {
      bookings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      bookings
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Add Technician
// ================================
export const addTechnician = async (req, res) => {
  try {

    const {
  name,
  email,
  phone,
  serviceType,
  city,
  state,
  pincode,
  password
} = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !serviceType ||
      !city ||
      !state ||
      !pincode ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields Are Required"
      });
    }

    const existingTech =
      await db
        .collection("technicians")
        .where("email", "==", email)
        .get();

    if (!existingTech.empty) {

      return res.status(400).json({
        success: false,
        message: "Technician Already Exists"
      });

    }

    const hashedPassword =
  await bcrypt.hash(
    password,
    10
  );

    const technicianRef =
      await db
        .collection("technicians")
        .add({
          name,
          email,
          phone,
          serviceType,
          city,
          state,
          pincode,

          password:
            hashedPassword,

          role:
            "technician",

          rating:
            0,

          status:
            "Available",

          createdAt:
            new Date()
        });

    res.status(201).json({
      success: true,
      message:
        "Technician Added Successfully",
      technicianId:
        technicianRef.id
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Get All Technicians
// ================================
export const getAllTechnicians = async (req, res) => {
  try {

    const snapshot =
      await db.collection("technicians").get();

    const technicians = [];

    snapshot.forEach((doc) => {
      technicians.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      technicians
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Assign Technician
// ================================
export const assignTechnician = async (req, res) => {
  try {

    const bookingId =
      req.params.id;

    const {
      technicianId,
      technicianName
    } = req.body;

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({
        technicianId,
        technician: technicianName,
        status: "Assigned",
        assignedAt: new Date()
      });

    res.status(200).json({
      success: true,
      message:
        "Technician Assigned Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Update Booking Status
// ================================
export const updateBookingStatus = async (req, res) => {
  try {

    const bookingId =
      req.params.id;

    const { status } =
      req.body;

    await db
      .collection("bookings")
      .doc(bookingId)
      .update({
        status,
        updatedAt:
          new Date()
      });

    res.status(200).json({
      success: true,
      message:
        "Booking Status Updated"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// ================================
// Delete Technician
// ================================
export const deleteTechnician = async (req, res) => {
  try {

    const technicianId =
      req.params.id;

    await db
      .collection("technicians")
      .doc(technicianId)
      .delete();

    res.status(200).json({
      success: true,
      message:
        "Technician Deleted Successfully"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const updateTechnician = async (
req,
res
) => {

try{

const technicianId =
req.params.id;

await db
.collection("technicians")
.doc(technicianId)
.update(req.body);

res.status(200).json({
success:true,
message:
"Technician Updated Successfully"
});

}
catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};