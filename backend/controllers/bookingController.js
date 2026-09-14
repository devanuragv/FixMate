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

      latitude,
  longitude,

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

          latitude,
        longitude,

        bookingDate,
        bookingTime,

        status:
    "Pending",

technician:
    null,

technicianSearchStatus:
    "Searching",

statusHistory: {
    pending: new Date()
},

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
        message: "Booking Not Found"
      });

    }


    const booking =
      bookingDoc.data();


    // ================================
    // CUSTOMER OWNERSHIP CHECK
    // ================================

    if (
      booking.userId !==
      req.user.userId
    ) {

      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this booking."
      });

    }


    // ================================
    // CUSTOMER CANCELLATION
    // ================================

    if (req.body.status === "Cancelled") {

      const cancellableStatuses = [
        "Pending",
        "Assigned",
        "On The Way"
      ];


      if (
        !cancellableStatuses.includes(
          booking.status
        )
      ) {

        return res.status(409).json({
          success: false,
          message:
            "This booking cannot be cancelled at its current stage."
        });

      }


      const now =
        new Date();


      await bookingRef.update({

        status:
          "Cancelled",

        technicianId:
          null,

        technician:
          null,

        technicianSearchStatus:
          "Cancelled",

        "statusHistory.cancelled":
          now,

        updatedAt:
          now

      });


      return res.status(200).json({

        success: true,

        message:
          "Booking cancelled successfully."

      });

    }


    // ================================
    // NORMAL BOOKING UPDATE
    // ================================

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };


    await bookingRef.update(
      updateData
    );


    return res.status(200).json({

      success: true,

      message:
        "Booking Updated Successfully"

    });


  } catch (error) {

    console.error(
      "Update booking error:",
      error
    );


    return res.status(500).json({

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

  // ================================
// Accept Job
// ================================
export const acceptJob = async (req, res) => {

    try {

        const technicianId =
            req.user.technicianId;

        const bookingId =
            req.params.id;


        if (!technicianId) {

            return res.status(403).json({

                success: false,

                message:
                    "Technician authentication required."

            });

        }


        // ================================
        // GET TECHNICIAN
        // ================================

        const technicianRef =
            db
                .collection("technicians")
                .doc(technicianId);

        const technicianDoc =
            await technicianRef.get();


        if (!technicianDoc.exists) {

            return res.status(404).json({

                success: false,

                message:
                    "Technician not found."

            });

        }


        const technician =
            technicianDoc.data();


        // ================================
        // TECHNICIAN MUST BE AVAILABLE
        // ================================

        if (
            technician.status !==
            "Available"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "You must be Available to accept jobs."

            });

        }


        // ================================
        // TECHNICIAN LOCATION REQUIRED
        // ================================

        const technicianLatitude =
            Number(
                technician.latitude
            );

        const technicianLongitude =
            Number(
                technician.longitude
            );


        if (
            !Number.isFinite(
                technicianLatitude
            ) ||
            !Number.isFinite(
                technicianLongitude
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Your current location is required to accept this job."

            });

        }


        // ================================
        // ATOMIC ACCEPT
        // ================================

        const bookingRef =
            db
                .collection("bookings")
                .doc(bookingId);


        await db.runTransaction(
            async (transaction) => {

                const bookingDoc =
                    await transaction.get(
                        bookingRef
                    );


                if (!bookingDoc.exists) {

                    throw new Error(
                        "BOOKING_NOT_FOUND"
                    );

                }


                const booking =
                    bookingDoc.data();


                // ================================
                // ALREADY ASSIGNED
                // ================================

                if (
                    booking.technicianId
                ) {

                    throw new Error(
                        "ALREADY_ASSIGNED"
                    );

                }


                // ================================
                // ONLY PENDING BOOKINGS
                // ================================

                if (
                    booking.status !==
                    "Pending"
                ) {

                    throw new Error(
                        "BOOKING_NOT_AVAILABLE"
                    );

                }


                // ================================
                // SERVICE MATCH
                // ================================

                if (
                    technician.serviceType !==
                    booking.service
                ) {

                    throw new Error(
                        "SERVICE_MISMATCH"
                    );

                }


                // ================================
                // CUSTOMER LOCATION
                // ================================

                const customerLatitude =
                    Number(
                        booking.latitude
                    );

                const customerLongitude =
                    Number(
                        booking.longitude
                    );


                if (
                    !Number.isFinite(
                        customerLatitude
                    ) ||
                    !Number.isFinite(
                        customerLongitude
                    )
                ) {

                    throw new Error(
                        "CUSTOMER_LOCATION_MISSING"
                    );

                }


                // ================================
                // DISTANCE
                // ================================

                const EARTH_RADIUS_KM =
                    6371;

                const MAX_DISTANCE_KM =
                    20;


                const lat1 =
                    customerLatitude *
                    Math.PI / 180;

                const lat2 =
                    technicianLatitude *
                    Math.PI / 180;

                const deltaLat =
                    (
                        technicianLatitude -
                        customerLatitude
                    ) *
                    Math.PI / 180;

                const deltaLon =
                    (
                        technicianLongitude -
                        customerLongitude
                    ) *
                    Math.PI / 180;


                const a =
                    Math.sin(deltaLat / 2) *
                    Math.sin(deltaLat / 2) +

                    Math.cos(lat1) *
                    Math.cos(lat2) *

                    Math.sin(deltaLon / 2) *
                    Math.sin(deltaLon / 2);


                const c =
                    2 *
                    Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                    );


                const distance =
                    EARTH_RADIUS_KM * c;


                if (
                    distance >
                    MAX_DISTANCE_KM
                ) {

                    throw new Error(
                        "OUTSIDE_RADIUS"
                    );

                }


                // ================================
                // ASSIGN TECHNICIAN
                // ================================

                transaction.update(
                    bookingRef,
                    {

                        technicianId:
                            technicianId,

                        technician:
                            technician.name ||
                            "",

                        status:
                            "Assigned",

                        statusHistory: {
                            ...(booking.statusHistory || {}),
                            assigned:
                                new Date()
                        },

                        updatedAt:
                            new Date()

                    }
                );

            }
        );


        // ================================
        // SUCCESS
        // ================================

        return res.status(200).json({

            success: true,

            message:
                "Job accepted successfully."

        });


    } catch (error) {

        console.error(
            "Accept job error:",
            error
        );


        // ================================
        // ERROR MESSAGES
        // ================================

        if (
            error.message ===
            "BOOKING_NOT_FOUND"
        ) {

            return res.status(404).json({

                success: false,

                message:
                    "Booking not found."

            });

        }


        if (
            error.message ===
            "ALREADY_ASSIGNED"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This job has already been accepted by another technician."

            });

        }


        if (
            error.message ===
            "BOOKING_NOT_AVAILABLE"
        ) {

            return res.status(409).json({

                success: false,

                message:
                    "This job is no longer available."

            });

        }


        if (
            error.message ===
            "SERVICE_MISMATCH"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "This job is for a different service."

            });

        }


        if (
            error.message ===
            "CUSTOMER_LOCATION_MISSING"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Customer location is missing."

            });

        }


        if (
            error.message ===
            "OUTSIDE_RADIUS"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "This job is outside your service radius."

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to accept this job."

        });

    }

};