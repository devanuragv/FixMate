import { db } from "../firebase/firebaseAdmin.js";


// =====================================================
// ADD REVIEW
// =====================================================

export const addReview = async (req, res) => {

    try {

        const {
            bookingId,
            technicianId,
            userId,
            rating,
            review
        } = req.body;


        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!bookingId || !technicianId || !userId) {

            return res.status(400).json({
                success: false,
                message: "Required review information is missing"
            });

        }


        const numericRating = Number(rating);


        if (
            !Number.isFinite(numericRating) ||
            numericRating < 1 ||
            numericRating > 5
        ) {

            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5"
            });

        }


        console.log("=================================");
        console.log("ADDING REVIEW");
        console.log("Booking ID:", bookingId);
        console.log("Technician ID:", technicianId);
        console.log("User ID:", userId);
        console.log("Rating:", numericRating);
        console.log("=================================");


        // -----------------------------------------
        // GET USER
        // -----------------------------------------

        const userDoc =
            await db
                .collection("users")
                .doc(userId)
                .get();


        const userData =
            userDoc.exists
                ? userDoc.data()
                : {};


        // -----------------------------------------
        // SAVE REVIEW
        // -----------------------------------------

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

                rating:
                    numericRating,

                review:
                    review || "",

                createdAt:
                    new Date()

            });


        // -----------------------------------------
        // UPDATE BOOKING
        // -----------------------------------------

        await db
            .collection("bookings")
            .doc(bookingId)
            .update({

                reviewSubmitted: true,

                userRating:
                    numericRating,

                review:
                    review || ""

            });


        // -----------------------------------------
        // GET ALL TECHNICIAN REVIEWS
        // -----------------------------------------

        const reviewSnapshot =
            await db
                .collection("reviews")
                .where(
                    "technicianId",
                    "==",
                    technicianId
                )
                .get();


        console.log(
            "Matching Reviews:",
            reviewSnapshot.size
        );


        // -----------------------------------------
        // CALCULATE AVERAGE
        // -----------------------------------------

        let totalRating = 0;


        reviewSnapshot.forEach(doc => {

            const reviewData =
                doc.data();

            totalRating +=
                Number(reviewData.rating || 0);

        });


        const totalReviews =
            reviewSnapshot.size;


        const avgRating =
            totalReviews > 0
                ? Number(
                    (
                        totalRating /
                        totalReviews
                    ).toFixed(1)
                )
                : 0;


        console.log(
            "Technician:",
            technicianId
        );

        console.log(
            "Total Rating:",
            totalRating
        );

        console.log(
            "Total Reviews:",
            totalReviews
        );

        console.log(
            "Average Rating:",
            avgRating
        );


        // -----------------------------------------
        // UPDATE TECHNICIAN
        // -----------------------------------------

        await db
            .collection("technicians")
            .doc(technicianId)
            .update({

                rating:
                    avgRating,

                totalReviews:
                    totalReviews

            });


        // -----------------------------------------
        // RESPONSE
        // -----------------------------------------

        res.status(200).json({

            success: true,

            message:
                "Review Added Successfully",

            rating:
                avgRating,

            totalReviews:
                totalReviews

        });

    }

    catch (error) {

        console.error(
            "REVIEW ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

};