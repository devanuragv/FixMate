import { db } from "../firebase/firebaseAdmin.js";
import bcrypt from "bcryptjs";
// ================================
// Get Assigned Jobs
// ================================
export const getAssignedJobs = async (
  req,
  res
) => {

  try {

    const technicianId =
      req.params.technicianId;

    if (!technicianId) {

      return res.status(400).json({
        success: false,
        message: "Technician ID Required"
      });

    }

    const snapshot =
      await db
        .collection("bookings")
        .where(
          "technicianId",
          "==",
          technicianId
        )
        .get();

    const jobs = [];

    snapshot.forEach((doc) => {

      jobs.push({
        id: doc.id,
        ...doc.data()
      });

    });

    res.status(200).json({
      success: true,
      totalJobs: jobs.length,
      jobs
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

// ================================
// Update Job Status
// ================================
export const updateJobStatus = async (
  req,
  res
) => {

  try {

    const bookingId = req.params.id;
    const { status, otp } = req.body;

    console.log("BOOKING ID:", bookingId);
    console.log("REQ USER:", req.user);
    console.log("REQUESTED STATUS:", status);

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID Required"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status Required"
      });
    }

    const bookingRef = db
      .collection("bookings")
      .doc(bookingId);

    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Booking Not Found"
      });
    }

    const bookingData = bookingDoc.data();

    const technicianId = req.user.technicianId;

    if (!technicianId) {
      return res.status(403).json({
        success: false,
        message: "Technician authentication required."
      });
    }

    // ================================
    // GET TECHNICIAN
    // ================================

    const techDoc = await db
      .collection("technicians")
      .doc(technicianId)
      .get();

    if (!techDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Technician Not Found"
      });
    }

    // ================================
    // OWNERSHIP CHECK
    // ================================

    if (bookingData.technicianId !== technicianId) {
      return res.status(403).json({
        success: false,
        message: "This job is not assigned to you"
      });
    }

    // ================================
    // TECHNICIAN OFFLINE CHECK
    // ================================

    if (techDoc.data().status === "Offline") {
      return res.status(403).json({
        success: false,
        message: "You are Offline"
      });
    }

    const statusTime = new Date();

    const statusKeyMap = {
      "Pending": "pending",
      "Assigned": "assigned",
      "On The Way": "on-the-way",
      "In Progress": "in-progress",
      "Completed": "completed"
    };

    const statusKey =
      statusKeyMap[status] ||
      String(status)
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");

    // ================================
    // STATUS TRANSITION VALIDATION
    // ================================

    if (
      status === "In Progress" &&
      bookingData.status !== "On The Way"
    ) {
      return res.status(409).json({
        success: false,
        message: "Job must be On The Way before starting."
      });
    }

    if (
      status === "Completed" &&
      bookingData.status !== "In Progress"
    ) {
      return res.status(409).json({
        success: false,
        message: "Job must be In Progress before completing."
      });
    }

    // ================================
    // BASE UPDATE
    // ================================

    const updateData = {
      status: status,
      updatedAt: statusTime,
      [`statusHistory.${statusKey}`]: statusTime
    };

    // =====================================================
    // OTP VERIFICATION
    // ON THE WAY → IN PROGRESS
    // =====================================================

    if (status === "In Progress") {

      // OTP is mandatory only when starting the job
      if (!otp) {
        return res.status(400).json({
          success: false,
          message: "Customer OTP Required"
        });
      }

      const customerId = bookingData.userId;

      if (!customerId) {
        return res.status(400).json({
          success: false,
          message: "Customer Account Not Found"
        });
      }

      const customerDoc = await db
        .collection("users")
        .doc(customerId)
        .get();

      if (!customerDoc.exists) {
        return res.status(404).json({
          success: false,
          message: "Customer Not Found"
        });
      }

      const customerData = customerDoc.data();

      const customerOtp =
        String(customerData.serviceOtp || "").trim();

      const enteredOtp =
        String(otp).trim();

      // ================================
      // VERIFY OTP
      // ================================

      if (
        !/^\d{4}$/.test(enteredOtp) ||
        enteredOtp !== customerOtp
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid Customer OTP"
        });
      }

      console.log("CUSTOMER OTP VERIFIED");
    }

    // =====================================================
    // IN PROGRESS → COMPLETED
    // NO OTP REQUIRED
    // =====================================================

    if (status === "Completed") {

      const SERVICE_PRICES = {
        "AC Repair": 700,
        "Electrical": 500,
        "Plumbing": 400,
        "Appliance Repair": 600,
        "Carpentry": 500,
        "Painting": 800,
        "Cleaning": 300,
        "Pest Control": 450
      };

      updateData.serviceCharge =
        SERVICE_PRICES[bookingData.service] || 0;

      updateData.completedAt =
        new Date().toLocaleDateString(
          "en-CA",
          {
            timeZone: "Asia/Kolkata"
          }
        );
    }

    // ================================
    // UPDATE BOOKING
    // ================================

    await bookingRef.update(updateData);

    return res.status(200).json({
      success: true,
      message: "Status Updated Successfully"
    });

  } catch (error) {

    console.error(
      "Update Job Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }

};

// ================================
// Toggle Availability
// ================================
export const toggleAvailability = async (
  req,
  res
) => {

  try {

    const technicianId =
      req.params.id;

    const { status } =
      req.body;

    if (!technicianId) {

      return res.status(400).json({
        success: false,
        message: "Technician ID Required"
      });

    }

    // =========================================
    // GET TECHNICIAN
    // =========================================

    const technicianRef =
      db
        .collection("technicians")
        .doc(technicianId);

    const technicianDoc =
      await technicianRef.get();

    if (!technicianDoc.exists) {

      return res.status(404).json({
        success: false,
        message: "Technician Not Found"
      });

    }

    const technician =
      technicianDoc.data();

    // =========================================
    // GOING OFFLINE
    // =========================================

    if (status === "Offline") {

      await technicianRef.update({

        status: "Offline",

        updatedAt:
          new Date()

      });

      return res.status(200).json({

        success: true,

        message:
          "You are now Offline"

      });

    }

    // =========================================
    // GOING AVAILABLE
    // =========================================

    if (status === "Available") {

      // Technician must have location
      // before becoming Available.

      const latitude =
        technician.latitude;

      const longitude =
        technician.longitude;

      if (
        latitude === null ||
        latitude === undefined ||
        longitude === null ||
        longitude === undefined
      ) {

        return res.status(400).json({

          success: false,

          locationRequired: true,

          message:
            "Location permission is required to become Available."

        });

      }

      await technicianRef.update({

        status: "Available",

        updatedAt:
          new Date()

      });

      return res.status(200).json({

        success: true,

        message:
          "You are now Available"

      });

    }

    // =========================================
    // INVALID STATUS
    // =========================================

    return res.status(400).json({

      success: false,

      message:
        "Invalid Availability Status"

    });

  } catch (error) {

    console.log(
      "Toggle Availability Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

// ================================
// Update Technician Location
// ================================
export const updateTechnicianLocation = async (
  req,
  res
) => {

  try {

    const technicianId =
      req.user.technicianId;

    const {
      latitude,
      longitude
    } = req.body;

    // =========================================
    // VALIDATE LOCATION
    // =========================================

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Latitude and Longitude are required"

      });

    }

    const lat =
      Number(latitude);

    const lng =
      Number(longitude);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid Location Coordinates"

      });

    }

    // =========================================
    // VALIDATE COORDINATE RANGE
    // =========================================

    if (
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid Latitude or Longitude"

      });

    }

    // =========================================
    // GET TECHNICIAN
    // =========================================

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
          "Technician Not Found"

      });

    }

    const technician =
      technicianDoc.data();


    // =========================================
    // SAVE LOCATION
    // =========================================

    await technicianRef.update({

      latitude:
        lat,

      longitude:
        lng,

      locationUpdatedAt:
        new Date(),

      updatedAt:
        new Date()

    });

    return res.status(200).json({

      success: true,

      message:
        "Location Updated Successfully"

    });

  } catch (error) {

    console.log(
      "Technician Location Error:",
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
// Get Technician Profile
// ================================
export const getTechnicianProfile =
async (
req,
res
) => {

try{

const technicianId =
req.params.id;

const doc =
await db
.collection(
"technicians"
)
.doc(
technicianId
)
.get();

if(
!doc.exists
){

return res.status(404).json({
success:false,
message:
"Technician Not Found"
});

}

res.status(200).json({

success:true,

technician:{
id:doc.id,
...doc.data()
}

});

}
catch(error){

res.status(500).json({

success:false,
message:error.message

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

try{

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
.collection(
"technicians"
)
.doc(
technicianId
)
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

success:true,

message:
"Profile Updated Successfully"

});

}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

// ================================
// Get Technician Reviews
// ================================

export const getTechnicianReviews =
async (
req,
res
)=>{

try{

const technicianId =
req.params.id;

const snapshot =
await db
.collection("reviews")
.where(
"technicianId",
"==",
technicianId
)
.get();

const reviews = [];

snapshot.forEach(doc=>{

reviews.push({
id:doc.id,
...doc.data()
});

});

res.status(200).json({

success:true,
reviews

});

}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

export const changePassword =
async (req,res)=>{

try{

const technicianId =
req.params.id;

const {
currentPassword,
newPassword
}
=
req.body;

const doc =
await db
.collection("technicians")
.doc(technicianId)
.get();

if(!doc.exists){

return res.status(404).json({
success:false,
message:"Technician Not Found"
});

}

const tech =
doc.data();

const match =
await bcrypt.compare(
currentPassword,
tech.password
);

if(!match){

return res.status(400).json({
success:false,
message:"Current Password Incorrect"
});

}

const hashedPassword =
await bcrypt.hash(
newPassword,
10
);

await db
.collection("technicians")
.doc(technicianId)
.update({

password:
hashedPassword

});

res.status(200).json({

success:true,
message:"Password Updated"

});

}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};

// ================================
// Get Public Technician Details
// For Customer Booking History
// ================================
// ================================
// Get Public Technician Details
// For Customer Booking History
// ================================

export const getPublicTechnicianProfile = async (
    req,
    res
) => {

    try {

        const technicianId =
            req.params.id;


        if (!technicianId) {

            return res.status(400).json({
                success: false,
                message: "Technician ID Required"
            });

        }


        // --------------------------------
        // GET TECHNICIAN
        // --------------------------------

        const techDoc =
            await db
                .collection("technicians")
                .doc(technicianId)
                .get();


        if (!techDoc.exists) {

            return res.status(404).json({
                success: false,
                message: "Technician Not Found"
            });

        }


        const tech =
            techDoc.data();


        // --------------------------------
        // GET ALL REVIEWS
        // --------------------------------

        const reviewSnapshot =
            await db
                .collection("reviews")
                .where(
                    "technicianId",
                    "==",
                    technicianId
                )
                .get();


        let totalRating = 0;


        reviewSnapshot.forEach(doc => {

            const reviewData =
                doc.data();

            totalRating +=
                Number(reviewData.rating || 0);

        });


        const reviewCount =
            reviewSnapshot.size;


        // --------------------------------
        // DETERMINE RATING
        // --------------------------------

        let finalRating =
            Number(tech.rating || 0);

        let finalTotalReviews =
            Number(tech.totalReviews || 0);


        // Reviews collection is the most accurate source
        if (reviewCount > 0) {

            finalRating =
                Number(
                    (
                        totalRating /
                        reviewCount
                    ).toFixed(1)
                );

            finalTotalReviews =
                reviewCount;

        }


        console.log(
            "================================="
        );

        console.log(
            "PUBLIC TECHNICIAN PROFILE"
        );

        console.log(
            "Technician ID:",
            technicianId
        );

        console.log(
            "Technician Name:",
            tech.name
        );

        console.log(
            "Stored Rating:",
            tech.rating
        );

        console.log(
            "Stored Reviews:",
            tech.totalReviews
        );

        console.log(
            "Matching Reviews:",
            reviewCount
        );

        console.log(
            "Final Rating:",
            finalRating
        );

        console.log(
            "Final Reviews:",
            finalTotalReviews
        );

        console.log(
            "================================="
        );


        // --------------------------------
        // RESPONSE
        // --------------------------------

        return res.status(200).json({

            success: true,

            technician: {

                id:
                    techDoc.id,

                name:
                    tech.name ||
                    "Technician",

                phone:
                    tech.phone ||
                    "",

                serviceType:
                    tech.serviceType ||
                    "",

                experience:
                    tech.experience ||
                    "",

                rating:
                    finalRating,

                totalReviews:
                    finalTotalReviews

            }

        });

    }

    catch (error) {

        console.error(
            "Public Technician Profile Error:",
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
// Find Nearby Technicians
// ================================
export const getNearbyTechnicians = async (req, res) => {

    try {

        const {
            latitude,
            longitude,
            service
        } = req.query;


        // ================================
        // VALIDATION
        // ================================

        const customerLatitude =
            Number(latitude);

        const customerLongitude =
            Number(longitude);


        if (
            !Number.isFinite(customerLatitude) ||
            !Number.isFinite(customerLongitude)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid customer location is required."

            });

        }


        if (
            customerLatitude < -90 ||
            customerLatitude > 90 ||
            customerLongitude < -180 ||
            customerLongitude > 180
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid customer coordinates."

            });

        }


        if (!service) {

            return res.status(400).json({

                success: false,

                message:
                    "Service type is required."

            });

        }


        // ================================
        // GET AVAILABLE TECHNICIANS
        // ================================

        const snapshot = await db
            .collection("technicians")
            .where(
                "status",
                "==",
                "Available"
            )
            .get();


        const nearbyTechnicians = [];


        // ================================
        // DISTANCE CALCULATION
        // ================================

        const EARTH_RADIUS_KM = 6371;

        const MAX_DISTANCE_KM = 20;


        snapshot.forEach((doc) => {

            const technician =
                doc.data();


            const technicianLatitude =
                Number(
                    technician.latitude
                );

            const technicianLongitude =
                Number(
                    technician.longitude
                );


            // Skip technicians
            // without valid location

            if (
                !Number.isFinite(
                    technicianLatitude
                ) ||
                !Number.isFinite(
                    technicianLongitude
                )
            ) {

                return;

            }


            // ================================
            // SERVICE MATCH
            // ================================

            if (
                technician.serviceType !==
                service
            ) {

                return;

            }


            // ================================
            // HAVERSINE FORMULA
            // ================================

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


            // ================================
            // WITHIN 20 KM
            // ================================

            if (
                distance <=
                MAX_DISTANCE_KM
            ) {

                nearbyTechnicians.push({

                    id:
                        doc.id,

                    name:
                        technician.name || "",

                    serviceType:
                        technician.serviceType || "",

                    phone:
                        technician.phone || "",

                    rating:
                        technician.rating || 0,

                    experience:
                        technician.experience || "",

                    city:
                        technician.city || "",

                    state:
                        technician.state || "",

                    latitude:
                        technicianLatitude,

                    longitude:
                        technicianLongitude,

                    distance:
                        Number(
                            distance.toFixed(2)
                        )

                });

            }

        });


        // ================================
        // CLOSEST FIRST
        // ================================

        nearbyTechnicians.sort(
            (a, b) =>
                a.distance -
                b.distance
        );


        // ================================
        // RESPONSE
        // ================================

        return res.status(200).json({

            success: true,

            count:
                nearbyTechnicians.length,

            technicians:
                nearbyTechnicians

        });


    } catch (error) {

        console.error(
            "Nearby technician error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to find nearby technicians."

        });

    }

};

// ================================
// Get New Nearby Service Requests
// ================================
export const getNewRequests = async (req, res) => {

    try {

        const technicianId =
            req.user.technicianId;


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
        // MUST BE AVAILABLE
        // ================================

        if (
            technician.status !==
            "Available"
        ) {

            return res.status(200).json({

                success: true,

                requests: []

            });

        }


        // ================================
        // TECHNICIAN LOCATION
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

            return res.status(200).json({

                success: true,

                requests: []

            });

        }


        // ================================
        // GET PENDING BOOKINGS
        // ================================

        const snapshot =
            await db
                .collection("bookings")
                .where(
                    "status",
                    "==",
                    "Pending"
                )
                .get();


        const requests = [];


        // ================================
        // CHECK EACH BOOKING
        // ================================

        snapshot.forEach((doc) => {

            const booking =
                doc.data();


            // ----------------------------
            // Already assigned?
            // ----------------------------

            if (
                booking.technicianId
            ) {

                return;

            }


            // ----------------------------
            // Service match
            // ----------------------------

            if (
                booking.service !==
                technician.serviceType
            ) {

                return;

            }


            // ----------------------------
            // Customer location
            // ----------------------------

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

                return;

            }


            // ================================
            // HAVERSINE DISTANCE
            // ================================

            const EARTH_RADIUS_KM =
                6371;

            const MAX_DISTANCE_KM =
                20;


            const lat1 =
                technicianLatitude *
                Math.PI / 180;

            const lat2 =
                customerLatitude *
                Math.PI / 180;

            const deltaLat =
                (
                    customerLatitude -
                    technicianLatitude
                ) *
                Math.PI / 180;

            const deltaLon =
                (
                    customerLongitude -
                    technicianLongitude
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


            // ----------------------------
            // Outside 20 KM
            // ----------------------------

            if (
                distance >
                MAX_DISTANCE_KM
            ) {

                return;

            }


            // ================================
            // ADD REQUEST
            // ================================

            requests.push({

                id:
                    doc.id,

                customerName:
                    booking.customerName ||
                    "",

                customerPhone:
                    booking.customerPhone ||
                    "",

                service:
                    booking.service ||
                    "",

                issue:
                    booking.issue ||
                    "",

                city:
                    booking.city ||
                    "",

                state:
                    booking.state ||
                    "",

                pincode:
                    booking.pincode ||
                    "",

                location:
                    booking.location ||
                    "",

                bookingDate:
                    booking.bookingDate ||
                    "",

                bookingTime:
                    booking.bookingTime ||
                    "",

                serviceCharge:
                    booking.serviceCharge ||
                    0,

                latitude:
                    customerLatitude,

                longitude:
                    customerLongitude,

                distance:
                    Number(
                        distance.toFixed(2)
                    ),

                createdAt:
                    booking.createdAt ||
                    null

            });

        });


        // ================================
        // NEWEST REQUEST FIRST
        // ================================

        requests.sort(
            (a, b) => {

                const getTime = (
                    value
                ) => {

                    if (
                        value &&
                        typeof value ===
                        "object"
                    ) {

                        const seconds =
                            value.seconds ??
                            value._seconds;

                        if (
                            seconds !==
                            undefined
                        ) {

                            return Number(
                                seconds
                            );

                        }

                    }

                    if (
                        typeof value ===
                        "string"
                    ) {

                        const time =
                            new Date(
                                value
                            ).getTime();

                        return isNaN(time)
                            ? 0
                            : time / 1000;

                    }

                    return 0;

                };


                return (
                    getTime(b.createdAt) -
                    getTime(a.createdAt)
                );

            }
        );


        // ================================
        // RESPONSE
        // ================================

        return res.status(200).json({

            success: true,

            count:
                requests.length,

            requests

        });


    } catch (error) {

        console.error(
            "Get new requests error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load nearby service requests."

        });

    }

};

// ================================
// Accept New Service Request
// ================================

export const acceptJob = async (req, res) => {

    try {

        const technicianId =
            req.user.technicianId;

        const bookingId =
            req.params.id;

        const bookingRef =
            db.collection("bookings").doc(bookingId);

        const technicianRef =
            db.collection("technicians").doc(technicianId);


        // ==================================
        // Check technician
        // ==================================

        const technicianDoc =
            await technicianRef.get();

        if (!technicianDoc.exists) {

            return res.status(404).json({
                success: false,
                message: "Technician not found."
            });

        }

        const technician =
            technicianDoc.data();


        // ==================================
        // Technician must be Available
        // ==================================

        if (
            technician.status !==
            "Available"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "You must be Available to accept a job."
            });

        }


        // ==================================
        // Technician must have location
        // ==================================

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
                    "Location is required to accept a job."
            });

        }

        const activeJobsSnapshot = await db
    .collection("bookings")
    .where("technicianId", "==", technicianId)
    .where("status", "in", ["Assigned", "In Progress"])
    .limit(1)
    .get();

if (!activeJobsSnapshot.empty) {
    return res.status(409).json({
        message: "You already have an active job. Complete it before accepting a new request."
    });
}


        // ==================================
        // ATOMIC ACCEPTANCE
        // ==================================

        const result =
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


                    // ==================================
                    // Already accepted
                    // ==================================

                    if (
                        booking.technicianId
                    ) {

                        throw new Error(
                            "ALREADY_ASSIGNED"
                        );

                    }


                    // ==================================
                    // Booking must still be Pending
                    // ==================================

                    if (
                        booking.status !==
                        "Pending"
                    ) {

                        throw new Error(
                            "NOT_AVAILABLE"
                        );

                    }


                    // ==================================
                    // Service must match
                    // ==================================

                    if (
                        booking.service !==
                        technician.serviceType
                    ) {

                        throw new Error(
                            "SERVICE_MISMATCH"
                        );

                    }


                    // ==================================
                    // Customer location
                    // ==================================

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


                    // ==================================
                    // Distance calculation
                    // ==================================

                    const EARTH_RADIUS_KM =
                        6371;

                    const MAX_DISTANCE_KM =
                        20;


                    const lat1 =
                        technicianLatitude *
                        Math.PI / 180;

                    const lat2 =
                        customerLatitude *
                        Math.PI / 180;


                    const deltaLat =
                        (
                            customerLatitude -
                            technicianLatitude
                        ) *
                        Math.PI / 180;


                    const deltaLon =
                        (
                            customerLongitude -
                            technicianLongitude
                        ) *
                        Math.PI / 180;


                    const a =
                        Math.sin(
                            deltaLat / 2
                        ) *
                        Math.sin(
                            deltaLat / 2
                        ) +

                        Math.cos(lat1) *
                        Math.cos(lat2) *

                        Math.sin(
                            deltaLon / 2
                        ) *
                        Math.sin(
                            deltaLon / 2
                        );


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
                            "TOO_FAR"
                        );

                    }


                    // ==================================
                    // Assign technician
                    // ==================================

                    transaction.update(
                        bookingRef,
                        {

                            technicianId:
                                technicianId,

                            technician: {
                                id:
                                    technicianId,

                                name:
                                    technician.name ||
                                    "",

                                serviceType:
                                    technician.serviceType ||
                                    "",

                                phone:
                                    technician.phone ||
                                    ""
                            },

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


                    return {
                        distance:
                            Number(
                                distance.toFixed(2)
                            )
                    };

                }
            );


        // ==================================
        // SUCCESS
        // ==================================

        return res.status(200).json({

            success: true,

            message:
                "Job accepted successfully.",

            bookingId:
                bookingId,

            distance:
                result.distance

        });


    } catch (error) {

        console.error(
            "Accept job error:",
            error
        );


        // ==================================
        // Specific errors
        // ==================================

        if (
            error.message ===
            "BOOKING_NOT_FOUND"
        ) {

            return res.status(404).json({
                success: false,
                message:
                    "Service request not found."
            });

        }


        if (
            error.message ===
            "ALREADY_ASSIGNED"
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "This service request has already been accepted by another technician."
            });

        }


        if (
            error.message ===
            "NOT_AVAILABLE"
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "This service request is no longer available."
            });

        }


        if (
            error.message ===
            "SERVICE_MISMATCH"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "This service does not match your service type."
            });

        }


        if (
            error.message ===
            "CUSTOMER_LOCATION_MISSING"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Customer location is unavailable."
            });

        }


        if (
            error.message ===
            "TOO_FAR"
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "This service request is outside your service area."
            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to accept service request."

        });

    }

};

// ================================
// Release / Cancel Assigned Job
// ================================
export const cancelAssignedJob = async (req, res) => {

    try {

        const technicianId =
            req.user.technicianId;

        const bookingId =
            req.params.id;


        if (!technicianId) {

            return res.status(403).json({
                success: false,
                message: "Technician authentication required."
            });

        }


        if (!bookingId) {

            return res.status(400).json({
                success: false,
                message: "Booking ID Required"
            });

        }


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


                // Only assigned technician can cancel
                if (
                    booking.technicianId !==
                    technicianId
                ) {

                    throw new Error(
                        "NOT_YOUR_JOB"
                    );

                }


                // Do not reopen completed/cancelled jobs
                if (
                    booking.status === "Completed" ||
                    booking.status === "Cancelled"
                ) {

                    throw new Error(
                        "JOB_CLOSED"
                    );

                }


                // Once service has started,
                // technician should not simply release it.
                if (
                    booking.status === "In Progress"
                ) {

                    throw new Error(
                        "JOB_ALREADY_STARTED"
                    );

                }


                const now =
                    new Date();


                transaction.update(
                    bookingRef,
                    {

                        status:
                            "Pending",

                        technicianId:
                            null,

                        technician:
                            null,

                        technicianSearchStatus:
                            "Searching",

                        "statusHistory.pending":
                            now,

                        "statusHistory.assigned":
                            null,

                        updatedAt:
                            now

                    }
                );

            }
        );


        return res.status(200).json({

            success: true,

            message:
                "Job released successfully. The request is available to nearby technicians again."

        });


    } catch (error) {

        console.error(
            "Cancel assigned job error:",
            error
        );


        if (
            error.message ===
            "BOOKING_NOT_FOUND"
        ) {

            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });

        }


        if (
            error.message ===
            "NOT_YOUR_JOB"
        ) {

            return res.status(403).json({
                success: false,
                message: "This job is not assigned to you."
            });

        }


        if (
            error.message ===
            "JOB_CLOSED"
        ) {

            return res.status(409).json({
                success: false,
                message: "This job is already closed."
            });

        }


        if (
            error.message ===
            "JOB_ALREADY_STARTED"
        ) {

            return res.status(409).json({
                success: false,
                message:
                    "An in-progress service cannot be released."
            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Unable to release this job."

        });

    }

};