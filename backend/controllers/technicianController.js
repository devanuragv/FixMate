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

    console.log("REQ PARAMS:", req.params);
    console.log("BOOKING ID:", req.params.id);
    console.log("REQ USER:", req.user);

    const bookingId =
      req.params.id;
    
    console.log("BOOKING ID:", bookingId);
    console.log("PARAMS:", req.params);

    const { status, otp } = req.body;

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

    const bookingRef =
      db
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

const SERVICE_PRICES = {

"AC Repair":700,

"Electrical":500,

"Plumbing":400,

"Appliance Repair":600,

"Carpentry":500,

"Painting":800,

"Cleaning":300,

"Pest Control":450

};

    if (!bookingDoc.exists) {

      return res.status(404).json({
        success: false,
        message: "Booking Not Found"
      });

    }
    const technicianId =
    req.user.technicianId;
        console.log(
        "TECHNICIAN ID:",
        technicianId
        );

        console.log(
        "CHECKING TECH DOC:",
        technicianId
        );

        const techDoc =
        await db
        .collection(
        "technicians"
        )
        .doc(
        technicianId
        )
        .get();

        if(
        !techDoc.exists
        ){

        return res.status(404).json({
        success:false,
        message:"Technician Not Found"
        });

        }

        if (
    bookingData.technicianId !== technicianId
) {
    return res.status(403).json({
        success: false,
        message: "This job is not assigned to you"
    });
}

        if(
        techDoc.data().status ===
        "Offline"
        ){

        return res.status(403).json({
        success:false,
        message:
        "You are Offline"
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

let updateData = {

    status,

    updatedAt:
        statusTime,

    [`statusHistory.${statusKey}`]:
        statusTime

};


if (status === "Completed") {

    // =========================================
    // CUSTOMER OTP VERIFICATION
    // =========================================

    if (!otp) {
        return res.status(400).json({
            success: false,
            message: "Customer OTP Required"
        });
    }

    // Get customer account
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

    // Verify OTP
    if (
        !/^\d{4}$/.test(enteredOtp) ||
        enteredOtp !== customerOtp
    ) {
        return res.status(401).json({
            success: false,
            message: "Invalid Customer OTP"
        });
    }

    // =========================================
    // OTP CORRECT → COMPLETE JOB
    // =========================================

    updateData.serviceCharge =
        SERVICE_PRICES[
            bookingData.service
        ] || 0;

    updateData.completedAt =
        new Date().toLocaleDateString(
            "en-CA",
            {
                timeZone: "Asia/Kolkata"
            }
        );
}

        await bookingRef.update(
        updateData
        );

    res.status(200).json({
      success: true,
      message:
        "Status Updated Successfully"
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

    await db
      .collection("technicians")
      .doc(technicianId)
      .update({

        status,

        updatedAt:
          new Date()

      });

    res.status(200).json({

      success: true,

      message:
        "Availability Updated"

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