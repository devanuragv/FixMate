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

    const { status } =
      req.body;

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

    const bookingDoc =
      await bookingRef.get();

    const bookingData =
bookingDoc.data();

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

        let updateData = {

            status,

            updatedAt:
            new Date()

            };
if(
status === "Completed"
){

updateData.serviceCharge =

SERVICE_PRICES[
bookingData.service
] || 0;

updateData.completedAt =

new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kolkata"
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