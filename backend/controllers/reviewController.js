import { db } from "../firebase/firebaseAdmin.js";

export const addReview = async (req, res) => {

try {

const {
bookingId,
technicianId,
userId,
rating,
review
} = req.body;

await db
.collection("reviews")
.add({

bookingId,
technicianId,
userId,

rating,
review,

createdAt:
new Date()

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

console.log(error);

res.status(500).json({

success:false,
message:error.message

});

}

};