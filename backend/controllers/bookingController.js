import { db } from "../firebase/firebaseAdmin.js";


// ================================
// Create Booking
// ================================
export const createBooking = async (req, res) => {

  try {

    const {

      customerName,
      customerPhone,
      customerEmail,

      service,
      issue,

      city,
      state,
      pincode,

      location,

      bookingDate,
      bookingTime

    } = req.body;


    // ================================
    // Create Booking
    // ================================

    const bookingRef = await db
      .collection("bookings")
      .add({

        userId:
          req.user.userId,

        customerName,
        customerPhone,
        customerEmail,

        service,
        issue,

        city,
        state,
        pincode,

        location,

        bookingDate,
        bookingTime,

        status:
          "Pending",

        technician:
          null,

        createdAt:
          new Date()

      });


    // ================================
    // SAVE ADDRESS TO CUSTOMER PROFILE
    // ================================

    await db
      .collection("users")
      .doc(req.user.userId)
      .update({

        location:
          location || "",

        city:
          city || "",

        state:
          state || "",

        pincode:
          pincode || "",

        updatedAt:
          new Date()

      });


    // ================================
    // RESPONSE
    // ================================

    res.status(201).json({

      success: true,

      message:
        "Booking Created Successfully",

      bookingId:
        bookingRef.id

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ================================
// Get All Bookings
// ================================
export const getBookings = async (req, res) => {

  try {

    const snapshot = await db
      .collection("bookings")
      .where(
        "userId",
        "==",
        req.user.userId
      )
      .get();


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

      message:
        error.message

    });

  }

};


// ================================
// Get Single Booking
// ================================
export const getBookingById = async (req, res) => {

  try {

    const doc = await db

      .collection("bookings")

      .doc(req.params.id)

      .get();


    if (!doc.exists) {

      return res.status(404).json({

        success: false,

        message:
          "Booking Not Found"

      });

    }


    res.status(200).json({

      success: true,

      booking: {

        id: doc.id,

        ...doc.data()

      }

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ================================
// Update Booking
// ================================
export const updateBooking = async (req, res) => {

  try {

    const bookingId =
      req.params.id;


    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingDoc =
      await bookingRef.get();


    if (!bookingDoc.exists) {

      return res.status(404).json({

        success: false,

        message:
          "Booking Not Found"

      });

    }


    await bookingRef.update({

      ...req.body,

      updatedAt:
        new Date()

    });


    res.status(200).json({

      success: true,

      message:
        "Booking Updated Successfully"

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ================================
// Delete Booking
// ================================
export const deleteBooking = async (req, res) => {

  try {

    const bookingId =
      req.params.id;


    const bookingRef =
      db
        .collection("bookings")
        .doc(bookingId);


    const bookingDoc =
      await bookingRef.get();


    if (!bookingDoc.exists) {

      return res.status(404).json({

        success: false,

        message:
          "Booking Not Found"

      });

    }


    await bookingRef.delete();


    res.status(200).json({

      success: true,

      message:
        "Booking Deleted Successfully"

    });


  } catch (error) {

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};


// ================================
// Get Technician Profile
// ================================
export const getTechnicianProfile =
  async (
    req,
    res
  ) => {

    try {

      const technicianId =
        req.params.id;


      const doc =
        await db
          .collection("technicians")
          .doc(technicianId)
          .get();


      if (!doc.exists) {

        return res.status(404).json({

          success: false,

          message:
            "Technician Not Found"

        });

      }


      res.status(200).json({

        success: true,

        technician: {

          id: doc.id,

          ...doc.data()

        }

      });


    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };


// ================================
// Update Technician Profile
// ================================
export const updateTechnicianProfile =
  async (
    req,
    res
  ) => {

    try {

      const technicianId =
        req.params.id;


      const {
        name,
        phone,
        city,
        state,
        pincode,
        experience
      } = req.body;


      await db
        .collection("technicians")
        .doc(technicianId)
        .update({

          name,

          phone,

          city,

          state,

          pincode,

          experience,

          updatedAt:
            new Date()

        });


      res.status(200).json({

        success: true,

        message:
          "Profile Updated Successfully"

      });


    } catch (error) {

      res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };