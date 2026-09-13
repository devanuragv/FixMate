import express from "express";
import { db } from "../firebase/firebaseAdmin.js";

const router = express.Router();

// ================================
// Add Review
// ================================
router.post(
"/add",
async (req,res)=>{

try{

const {
bookingId,
technicianId,
userId,
rating,
review
}
=
req.body;

const userDoc =
await db
.collection("users")
.doc(userId)
.get();

const userData =
userDoc.data();

console.log("REQ BODY:", req.body);

await db
.collection("reviews")
.add({

bookingId,
technicianId,
userId,

customerName:
userData?.name || "Customer",

customerPhone:
userData?.phone || "",

rating,
review,

createdAt:
new Date()

});

await db
.collection("bookings")
.doc(bookingId)
.update({

reviewSubmitted:true,

userRating:rating,

review:review

});

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

reviewSnapshot.forEach(doc=>{

totalRating +=
doc.data().rating;

});

const avgRating =
totalRating /
reviewSnapshot.size;

await db
.collection("technicians")
.doc(technicianId)
.update({

rating:
Number(
avgRating.toFixed(1)
),

totalReviews:
reviewSnapshot.size

});

res.status(200).json({

success:true,
message:
"Review Added Successfully"

});

}
catch(error){

console.error("REVIEW ERROR:", error);

res.status(500).json({

success:false,
message:error.message

});

}

}
);

export default router;