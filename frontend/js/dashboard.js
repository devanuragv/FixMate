const API_URL = "/api";

const token =
    localStorage.getItem("fixmateToken");

    
let customerServiceOtp = "";


if (!token) {
    window.location.href = "login.html";
}


/* =========================================
   LOAD USER PROFILE
========================================= */

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/users/profile`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Profile Response:",
            data
        );

        if (data.success) {

            const userName =
                document.getElementById(
                    "userName"
                );

            if (userName) {
                userName.innerText =
                    data.user.name;
            }

            customerServiceOtp =
            data.user.serviceOtp || "";

        } else {

            console.log(
                "Failed to load profile:",
                data.message
            );

        }

    } catch (error) {

        console.log(
            "Profile Error:",
            error
        );

    }

}


/* =========================================
   GET BOOKING CREATED TIME
========================================= */

function getCreatedTime(booking) {

    if (!booking.createdAt) {
        return 0;
    }

    if (booking.createdAt.seconds) {

        return (
            booking.createdAt.seconds *
            1000
        );

    }

    if (booking.createdAt._seconds) {

        return (
            booking.createdAt._seconds *
            1000
        );

    }

    const time =
        new Date(
            booking.createdAt
        ).getTime();

    return Number.isFinite(time)
        ? time
        : 0;

}


/* =========================================
   NORMALIZE STATUS
========================================= */

function normalizeStatus(status) {

    const value =
        String(status || "")
            .trim()
            .toLowerCase();

    if (
        value.includes("cancel")
    ) {
        return "cancelled";
    }

    if (
        value.includes("complete") ||
        value.includes("finish")
    ) {
        return "completed";
    }

    if (
        value.includes("progress") ||
        value.includes("started")
    ) {
        return "in-progress";
    }

    if (
        value.includes("way") ||
        value.includes("travel")
    ) {
        return "on-the-way";
    }

    if (
        value.includes("assign")
    ) {
        return "assigned";
    }

    return "pending";
}


/* =========================================
   DISTANCE CALCULATION
========================================= */

function getDistanceInKm(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const values = [
        lat1,
        lon1,
        lat2,
        lon2
    ].map(Number);

    if (
        values.some(
            value =>
                !Number.isFinite(value)
        )
    ) {
        return null;
    }

    const [
        latitude1,
        longitude1,
        latitude2,
        longitude2
    ] = values;

    const earthRadius = 6371;

    const dLat =
        (
            latitude2 -
            latitude1
        ) *
        Math.PI /
        180;

    const dLon =
        (
            longitude2 -
            longitude1
        ) *
        Math.PI /
        180;

    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(
            latitude1 *
            Math.PI /
            180
        ) *

        Math.cos(
            latitude2 *
            Math.PI /
            180
        ) *

        Math.sin(dLon / 2) ** 2;

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return earthRadius * c;

}


/* =========================================
   ETA
========================================= */

function calculateETA(
    technician,
    booking
) {

    if (
        !technician ||
        !booking
    ) {
        return null;
    }

    const distance =
        getDistanceInKm(

            technician.latitude,

            technician.longitude,

            booking.latitude,

            booking.longitude

        );

    if (
        distance === null
    ) {
        return null;
    }

    /*
        Lightweight urban ETA.
        Based on live GPS distance.
    */

    const averageSpeed = 25;

    let minutes =
        Math.ceil(
            (
                distance /
                averageSpeed
            ) *
            60
        );

    if (
        minutes < 1
    ) {
        minutes = 1;
    }

    if (
        minutes > 90
    ) {
        minutes = 90;
    }

    return {

        minutes,

        distance

    };

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================
   GET LATEST BOOKING
========================================= */

function getLatestBooking(
    bookings
) {

    if (
        !bookings.length
    ) {
        return null;
    }

    const sorted =
        [...bookings].sort(
            (a, b) =>
                getCreatedTime(b) -
                getCreatedTime(a)
        );

    const active =
        sorted.filter(
            booking => {

                const status =
                    normalizeStatus(
                        booking.status
                    );

                return (
                    status !== "completed" &&
                    status !== "cancelled"
                );

            }
        );

    return (
        active[0] ||
        sorted[0]
    );

}


/* =========================================
   GET BOOKING TIMESTAMP
========================================= */

function getBookingTime(booking) {

    try {

        if (booking.createdAt) {

            if (
                booking.createdAt.seconds
            ) {

                return (
                    booking.createdAt.seconds *
                    1000
                );

            }

            if (
                booking.createdAt._seconds
            ) {

                return (
                    booking.createdAt._seconds *
                    1000
                );

            }

            const parsed =
                new Date(
                    booking.createdAt
                ).getTime();

            if (!isNaN(parsed)) {
                return parsed;
            }

        }

    } catch (error) {

        console.log(
            "Booking date parse error:",
            error
        );

    }

    return 0;

}


/* =========================================
   RENDER CURRENT BOOKING
========================================= */

function renderCurrentBooking(bookings) {

    const section =
        document.getElementById(
            "currentBookingSection"
        );

    const card =
        document.getElementById(
            "currentBookingCard"
        );

    if (!section || !card) {
        return;
    }


    /* =========================================
       NO BOOKINGS
    ========================================= */

    if (
        !bookings ||
        bookings.length === 0
    ) {

        section.style.display = "block";

        card.innerHTML = `

            <div class="no-current-booking">

                <div class="no-booking-icon">
                    +
                </div>

                <div>
                    <h3>No active booking</h3>

                    <p>
                        Book a service to see updates here.
                    </p>
                </div>

                <a
                    href="booking.html"
                    class="book-now-link"
                >
                    Book Service
                </a>

            </div>

        `;

        return;
    }


    /* =========================================
       FIND LATEST ACTIVE BOOKING
    ========================================= */

    const latestBooking =
        getLatestBooking(bookings);

    if (!latestBooking) {
        return;
    }


    /* =========================================
       BOOKING DATA
    ========================================= */

    const status =
        normalizeStatus(
            latestBooking.status
        );

    const technician =
        latestBooking.technician || {};

        

    const bookingId =
        latestBooking.id ||
        latestBooking.bookingId ||
        "";


        const serviceOtp =
    customerServiceOtp || "";


    /* =========================================
       LIVE ETA
       ONLY AFTER START TRAVEL
    ========================================= */

    const eta =
        status === "on-the-way"
            ? calculateETA(
                technician,
                latestBooking
            )
            : null;


    /* =========================================
       TOP STATUS
       SAME STYLE FOR EVERY STATUS
    ========================================= */

    let topLabel = "BOOKING";
    let topValue = "CONFIRMED";

    let statusText =
        "BOOKING CONFIRMED";


    if (
        status === "assigned"
    ) {

        topLabel = "TECHNICIAN";
        topValue = "ACCEPTED";

        statusText =
            "TECHNICIAN ACCEPTED THE REQUEST";

    }


    else if (
        status === "on-the-way"
    ) {

        topLabel = "ARRIVING IN";

        topValue =
            `${eta ? eta.minutes : 1} ${
                eta && eta.minutes === 1
                    ? "MIN"
                    : "MINS"
            }`;

        statusText =
            "TECHNICIAN ON THE WAY";

    }


    else if (
        status === "in-progress"
    ) {

        topLabel = "TECHNICIAN";
        topValue = "ARRIVED";

        statusText =
            "TECHNICIAN ARRIVED";

    }


    else if (
        status === "completed"
    ) {

        topLabel = "SERVICE";
        topValue = "COMPLETED";

        statusText =
            "SERVICE COMPLETED";

    }


    else if (
        status === "cancelled"
    ) {

        topLabel = "BOOKING";
        topValue = "CANCELLED";

        statusText =
            "BOOKING CANCELLED";

    }


    /* =========================================
       ROUTE
       ALWAYS VISIBLE
    ========================================= */

    let progress = 0.06;


    if (
        status === "assigned"
    ) {

        progress = 0.20;

    }


    else if (
        status === "on-the-way"
    ) {

        if (
            eta &&
            Number.isFinite(
                eta.distance
            )
        ) {

            const MAX_VISUAL_DISTANCE_KM = 10;

            progress =
                1 -
                Math.min(
                    Math.max(
                        eta.distance /
                        MAX_VISUAL_DISTANCE_KM,
                        0
                    ),
                    1
                );

            progress =
                Math.max(
                    0.20,
                    Math.min(
                        0.90,
                        progress
                    )
                );

        } else {

            progress = 0.55;

        }

    }


    else if (
    status === "in-progress"
) {

    // Technician reached the destination
    progress = 1;

}


else if (
    status === "completed"
) {

    // Destination remains the final stop
    progress = 1;

}


    else if (
        status === "cancelled"
    ) {

        progress = 0.06;

    }


    const progressPercent =
        Math.round(
            progress * 100
        );


    /* =========================================
       VIEW DETAILS
    ========================================= */

    const detailsLink =
        bookingId
            ? `history.html?bookingId=${encodeURIComponent(
                bookingId
            )}`
            : "history.html";


    /* =========================================
       RENDER
    ========================================= */

    section.style.display = "block";

    card.innerHTML = `

        <!-- =====================================
             SERVICE
        ====================================== -->

        <div class="current-booking-main">

            <div class="current-booking-service">

                <div class="service-info">

                    <h3 class="service-title">

                        <span class="service-title-icon">
                            🔧
                        </span>

                        ${escapeHTML(
                            latestBooking.service ||
                            "Service"
                        )}

                    </h3>

                </div>

            </div>


           <!-- OTP -->

${
    serviceOtp &&
    status !== "completed" &&
    status !== "cancelled"
        ? `
            <div class="current-booking-otp">
                <span class="otp-label">SERVICE OTP</span>
                <strong>${escapeHTML(serviceOtp)}</strong>
            </div>
          `
        : ""
}



<div class="current-booking-action">

    <a
        href="${detailsLink}"
        class="view-details-link"
    >
        View Details
        <span>→</span>
    </a>

</div>
</div>


        <!-- =====================================
             TRACKING
        ====================================== -->

        <div class="booking-route">


            <!-- TOP STATUS -->

            <div class="arriving-eta">

                <span class="arriving-label">
                    ${topLabel}
                </span>

                <span class="arriving-value">
                    ${topValue}
                </span>

            </div>


            <!-- ROUTE LINE -->

            <div class="route-track">

                <div
                    class="route-filled"
                    style="width:${progressPercent}%"
                ></div>


                <div
                    class="
                        route-scooter
                        ${
                            status === "in-progress" ||
                            status === "completed"
                                ? "arrived"
                                : ""
                        }
                    "
                    style="left:${progressPercent}%"
                >

                    <span class="scooter-icon"></span>

                </div>


                <div class="route-endpoint"></div>

            </div>


            <!-- ROUTE LABELS -->

            <div class="route-labels">

                <span>
                    Technician
                </span>

                <span>
                    Destination
                </span>

            </div>


            <!-- BOTTOM STATUS -->

            <div class="tracking-status">

                <span class="tracking-status-dot"></span>

                <span>
                    ${statusText}
                </span>

            </div>


        </div>

    `;

}


/* =========================================
   LOAD BOOKINGS
========================================= */

async function loadBookings() {

    try {

        const response =
            await fetch(
                `${API_URL}/bookings`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "Bookings Response:",
            data
        );


        if (data.success) {

            const bookings =
                data.bookings || [];


            /* =================================
               TOTAL BOOKINGS
            ================================= */

            const totalBookings =
                document.getElementById(
                    "totalBookings"
                );

            if (totalBookings) {

                totalBookings.innerText =
                    bookings.length;

            }


            /* =================================
               PENDING BOOKINGS
            ================================= */

            const pending =
                bookings.filter(
                    booking =>
                        normalizeStatus(
                            booking.status
                        ) === "pending"
                ).length;


            const pendingBookings =
                document.getElementById(
                    "pendingBookings"
                );


            if (pendingBookings) {

                pendingBookings.innerText =
                    pending;

            }


            /* =================================
               COMPLETED BOOKINGS
            ================================= */

            const completed =
                bookings.filter(
                    booking =>
                        normalizeStatus(
                            booking.status
                        ) === "completed"
                ).length;


            const completedBookings =
                document.getElementById(
                    "completedBookings"
                );


            if (completedBookings) {

                completedBookings.innerText =
                    completed;

            }


            /* =================================
               CURRENT BOOKING
            ================================= */

            renderCurrentBooking(
                bookings
            );

        } else {

            console.log(
                "Failed to load bookings:",
                data.message
            );

        }

    } catch (error) {

        console.log(
            "Bookings Error:",
            error
        );

    }

}


/* =========================================
   CUSTOMER SUPPORT
========================================= */

function openCustomerSupport() {

    window.location.href =
        "customer-support.html";

}


/* =========================================
   LOGOUT
========================================= */

function logout() {

    localStorage.removeItem(
        "fixmateToken"
    );

    localStorage.removeItem(
        "user"
    );

    window.location.href =
        "login.html";

}


/* =========================================
   INITIAL LOAD
========================================= */

loadProfile();

loadBookings();


/* =========================================
   LIVE BOOKING UPDATE
========================================= */

setInterval(
    () => {

        loadBookings();

    },
    10000
);