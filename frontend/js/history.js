const API_URL = "http://localhost:5000/api";

const token = localStorage.getItem("fixmateToken");

if (!token) {
    window.location.href = "login.html";
}

// =====================================================
// GET BOOKING CREATED TIME
// =====================================================

function getBookingCreatedTime(booking) {

    if (!booking) {
        return 0;
    }

    const createdAt =
        booking.createdAt;

    // Firestore Timestamp object
    if (
        createdAt &&
        typeof createdAt === "object" &&
        createdAt.seconds
    ) {

        return Number(createdAt.seconds) * 1000;
    }

    // Normal date / ISO string
    if (createdAt) {

        const time =
            new Date(createdAt).getTime();

        if (!isNaN(time)) {
            return time;
        }
    }

    // Fallback to service appointment date/time
    if (booking.bookingDate) {

        const dateTime =
            `${booking.bookingDate} ${
                booking.bookingTime || "00:00"
            }`;

        const time =
            new Date(dateTime).getTime();

        if (!isNaN(time)) {
            return time;
        }
    }

    return 0;
}


// =====================================================
// FORMAT BOOKED ON DATE + TIME
// =====================================================

function formatBookingDateTime(value) {

    if (!value) {
        return "Not available";
    }

    let date;

    // Firestore Timestamp
    if (
        typeof value === "object" &&
        value.seconds
    ) {

        date =
            new Date(
                Number(value.seconds) * 1000
            );

    }
    else {

        date =
            new Date(value);

    }

    if (isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }
    );

}

// =====================================================
// SERVICE ICONS
// =====================================================

const SERVICE_ICONS = {
    Electrician: "⚡",
    Plumber: "🔧",
    Carpenter: "🪚",
    Painter: "🎨",
    "AC Repair": "❄️",
    "Appliance Repair": "🔌",
    Cleaner: "🧹",
    Mechanic: "🔩",
    "Pest Control": "🐜"
};


// =====================================================
// STORE BOOKINGS
// =====================================================

let allBookings = [];


// =====================================================
// LOAD BOOKINGS
// =====================================================

async function loadBookings() {

    try {

        const response = await fetch(
            `${API_URL}/bookings`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.log("Bookings error:", data);
            return;
        }

        if (data.success) {

            allBookings = data.bookings || [];

            console.log("🔥 FIXMATE BOOKINGS FROM BACKEND:", allBookings);

allBookings.forEach((booking) => {
    console.log(
        "📌 BOOKING:",
        booking.id,
        "STATUS:",
        booking.status,
        "STATUS HISTORY:",
        booking.statusHistory
    );
});

// Newest booking first
allBookings.sort((a, b) => {

    const dateA =
        getBookingCreatedTime(a);

    const dateB =
        getBookingCreatedTime(b);

    return dateB - dateA;

});

            const container =
                document.getElementById("bookingContainer");


            // -----------------------------------------
            // NO BOOKINGS
            // -----------------------------------------

            if (allBookings.length === 0) {

                container.innerHTML = `
                    <div class="no-bookings">
                        <h2>No Bookings Found</h2>
                        <p>You haven't booked any service yet.</p>
                    </div>
                `;

                return;
            }


            // -----------------------------------------
            // CREATE CLEAN BOOKING CARDS
            // -----------------------------------------

            let html = "";

            allBookings.forEach((booking, index) => {

                const icon =
                    SERVICE_ICONS[booking.service] || "🛠️";

                const date =
                    formatBookingDate(booking.bookingDate);

                const issue =
                    booking.issue || "Service request";


                html += `
                    <div
                        class="booking-card"
                        onclick="openBookingDetails('${booking.id}')"
                        role="button"
                        tabindex="0"
                        data-booking-id="${booking.id}"
                    >

                        <div class="history-card-top">

                            <div class="history-service">

                                <div class="service-icon">
                                    ${icon}
                                </div>

                                <h3>
                                    ${escapeHTML(booking.service || "Service")}
                                </h3>

                            </div>


                            <div class="history-date">
                                ${escapeHTML(date)}
                            </div>

                        </div>


                        <div class="history-issue">
                            ${escapeHTML(issue)}
                        </div>

                    </div>
                `;
            });


            container.innerHTML = html;


            // -----------------------------------------
            // KEYBOARD ACCESSIBILITY
            // -----------------------------------------

            document
                .querySelectorAll(".booking-card")
                .forEach(card => {

                    card.addEventListener("keydown", event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            const bookingId =
                                card.dataset.bookingId;

                            openBookingDetails(bookingId);
                        }

                    });

                });

        }

    }

    catch (error) {

        console.log(
            "Load bookings error:",
            error
        );

    }

}


// =====================================================
// FORMAT DATE
// =====================================================

function formatBookingDate(dateString) {

    if (!dateString) {
        return "Date not available";
    }

    try {

        const date = new Date(dateString);

        if (isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }

    catch (error) {

        return dateString;

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================================
// OPEN BOOKING DETAILS
// =====================================================

async function openBookingDetails(bookingId) {

    const booking =
        allBookings.find(
            item => String(item.id) === String(bookingId)
        );


    if (!booking) {

        console.log(
            "Booking not found:",
            bookingId
        );

        return;
    }


    const existing =
        document.getElementById("bookingDetailsOverlay");

    if (existing) {
        existing.remove();
    }


    const icon =
        SERVICE_ICONS[booking.service] || "🛠️";


    const status =
        normalizeStatus(booking.status);


    const statusLabel =
        getStatusLabel(status);


    const statusClass =
        getStatusClass(status);


    const timeline =
    createBookingTimeline(
        status,
        booking
    );


    let technicianName =
    booking.technician ||
    "Technician not assigned";

let technicianPhone = "";
let technicianRating = null;
let totalReviews = null;
let technicianService = "";
let technicianExperience = "";


// =========================================
// LOAD PUBLIC TECHNICIAN PROFILE
// =========================================

if (booking.technicianId) {

    try {

        const technicianResponse = await fetch(
            `${API_URL}/technician/public-profile/${booking.technicianId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const technicianData =
            await technicianResponse.json();

        if (
            technicianResponse.ok &&
            technicianData.success &&
            technicianData.technician
        ) {

            const technician =
                technicianData.technician;

            technicianName =
                technician.name ||
                technicianName;

            technicianPhone =
                technician.phone ||
                "";

            technicianRating =
                technician.rating ??
                null;

            totalReviews =
                technician.totalReviews ??
                null;

            technicianService =
                technician.serviceType ||
                "";

            technicianExperience =
                technician.experience ||
                "";
        }

    }
    catch (error) {

        console.log(
            "Technician profile error:",
            error
        );

    }

}


// =========================================
// CREATE TECHNICIAN SECTION
// =========================================

const technicianSection =
    createTechnicianSection(
        booking,
        technicianName,
        technicianPhone,
        technicianRating,
        totalReviews,
        technicianService,
        technicianExperience
    );


    const reviewSection =
        createReviewSection(booking);


    const overlay =
        document.createElement("div");

    overlay.id =
        "bookingDetailsOverlay";

    overlay.className =
        "booking-details-overlay";


    overlay.innerHTML = `

        <div
            class="booking-details-modal"
            onclick="event.stopPropagation()"
        >

            <!-- =====================================
                 DETAILS HEADER
            ====================================== -->

            <div class="details-header">

                <button
                    type="button"
                    class="details-back-btn"
                    onclick="closeBookingDetails()"
                >
                    ←
                    <span>My Bookings</span>
                </button>


                <button
                    type="button"
                    class="details-close-btn"
                    onclick="closeBookingDetails()"
                    aria-label="Close"
                >
                    ×
                </button>

            </div>


            <!-- =====================================
                 ORDER / BOOKING HERO
            ====================================== -->

            <div class="booking-detail-hero">

                <div class="detail-service-icon">
                    ${icon}
                </div>


                <div class="detail-service-info">

                    <span class="detail-label">
                        FIXMATE SERVICE
                    </span>

                    <h2>
                        ${escapeHTML(
                            booking.service || "Service"
                        )}
                    </h2>

                    <p>
                        ${escapeHTML(
                            booking.issue || "Service request"
                        )}
                    </p>

                </div>

            </div>


            <!-- =====================================
                 STATUS
            ====================================== -->

            <section class="detail-section">

                <div class="section-heading">

                    <span class="section-line"></span>

                    <h3>
                        Booking Status
                    </h3>

                </div>


                <div class="
                    current-status
                    ${statusClass}
                ">

                    <span class="status-dot"></span>

                    <span>
                        ${escapeHTML(statusLabel)}
                    </span>

                </div>


                <div class="booking-timeline">

                    ${timeline}

                </div>

            </section>


            <!-- =====================================
                 TECHNICIAN
            ====================================== -->

            ${technicianSection}


            <!-- =====================================
                 SERVICE DETAILS
            ====================================== -->

            <section class="detail-section">

                <div class="section-heading">

                    <span class="section-line"></span>

                    <h3>
                        Service Details
                    </h3>

                </div>


                <div class="details-grid">

                    <div class="detail-box">

                        <span class="detail-box-icon">
                            🔧
                        </span>

                        <div>

                            <small>
                                Service
                            </small>

                            <strong>
                                ${escapeHTML(
                                    booking.service || "N/A"
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="detail-box">

                        <span class="detail-box-icon">
                            📝
                        </span>

                        <div>

                            <small>
                                Issue
                            </small>

                            <strong>
                                ${escapeHTML(
                                    booking.issue || "N/A"
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="detail-box">

                        <span class="detail-box-icon">
                            📅
                        </span>

                        <div>

                            <small>
                                Date
                            </small>

                            <strong>
                                ${escapeHTML(
                                    formatBookingDate(
                                        booking.bookingDate
                                    )
                                )}
                            </strong>

                        </div>

                    </div>


                    <div class="detail-box">

                        <span class="detail-box-icon">
                            ⏰
                        </span>

                        <div>

                            <small>
                                Time
                            </small>

                            <strong>
                                ${escapeHTML(
                                    booking.bookingTime || "N/A"
                                )}
                            </strong>

                        </div>

                    </div>


                    ${
                        booking.visitingFee ||
                        booking.serviceFee ||
                        booking.amount
                        ?
                        `
                        <div class="detail-box">

                            <span class="detail-box-icon">
                                💰
                            </span>

                            <div>

                                <small>
                                    Visiting Fee
                                </small>

                                <strong>
                                    ₹${escapeHTML(
                                        booking.visitingFee ||
                                        booking.serviceFee ||
                                        booking.amount
                                    )}
                                </strong>

                            </div>

                        </div>
                        `
                        :
                        ""
                    }

                </div>

            </section>


            <!-- =====================================
                 ADDRESS
            ====================================== -->

            <section class="detail-section">

                <div class="section-heading">

                    <span class="section-line"></span>

                    <h3>
                        Service Address
                    </h3>

                </div>


                <div class="address-card">

                    <div class="address-icon">
                        📍
                    </div>

                    <div class="address-content">

                        <strong>
                            ${escapeHTML(
                                booking.location ||
                                "Address not available"
                            )}
                        </strong>

                        ${
                            booking.city ||
                            booking.state ||
                            booking.pincode
                            ?
                            `
                            <p>
                                ${escapeHTML(
                                    [
                                        booking.city,
                                        booking.state,
                                        booking.pincode
                                    ]
                                    .filter(Boolean)
                                    .join(", ")
                                )}
                            </p>
                            `
                            :
                            ""
                        }

                    </div>

                </div>

            </section>


            <!-- =====================================
                 CUSTOMER DETAILS
            ====================================== -->

            <section class="detail-section">

                <div class="section-heading">

                    <span class="section-line"></span>

                    <h3>
                        Customer Details
                    </h3>

                </div>


                <div class="customer-detail-card">

                    <div class="customer-detail-row">

                        <span>
                            Name
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking.customerName ||
                                booking.name ||
                                "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="customer-detail-row">

                        <span>
                            Phone
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking.customerPhone ||
                                booking.phone ||
                                "N/A"
                            )}
                        </strong>

                    </div>


                    <div class="customer-detail-row">

                        <span>
                            Email
                        </span>

                        <strong>
                            ${escapeHTML(
                                booking.customerEmail ||
                                booking.email ||
                                "N/A"
                            )}
                        </strong>

                    </div>

                </div>

            </section>


            <!-- =====================================
                 REVIEW
            ====================================== -->

            ${reviewSection}


            <!-- =====================================
                 BOOKING ACTIONS
            ====================================== -->

            <section class="detail-actions">

                ${
                    status !== "completed" &&
                    status !== "cancelled"
                    ?
                    `
                    <button
                        type="button"
                        class="detail-edit-btn"
                        onclick="editBooking('${booking.id}')"
                    >
                        ✏️ Edit Booking
                    </button>

                    <button
                        type="button"
                        class="detail-delete-btn"
                        onclick="deleteBooking('${booking.id}')"
                    >
                        Cancel Booking
                    </button>
                    `
                    :
                    ""
                }

            </section>


            <div class="booking-detail-footer">

                <span>
                    FixMate
                </span>

                <span>
                    Reliable service. Every fix.
                </span>

            </div>

        </div>

    `;


    // -----------------------------------------
    // ADD TO BODY
    // -----------------------------------------

    document.body.appendChild(overlay);


    // -----------------------------------------
    // OPEN ANIMATION
    // -----------------------------------------

    requestAnimationFrame(() => {

        overlay.classList.add("show");

    });


    // -----------------------------------------
    // PREVENT BACKGROUND SCROLL
    // -----------------------------------------

    document.body.classList.add(
        "booking-details-open"
    );


    // -----------------------------------------
    // CLICK OUTSIDE TO CLOSE
    // -----------------------------------------

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay
            ) {

                closeBookingDetails();

            }

        }
    );


    // -----------------------------------------
    // ESC TO CLOSE
    // -----------------------------------------

    document.addEventListener(
        "keydown",
        handleDetailsEscape
    );

}


// =====================================================
// CLOSE BOOKING DETAILS
// =====================================================

function closeBookingDetails() {

    const overlay =
        document.getElementById(
            "bookingDetailsOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove("show");


    setTimeout(() => {

        overlay.remove();

    }, 250);


    document.body.classList.remove(
        "booking-details-open"
    );


    document.removeEventListener(
        "keydown",
        handleDetailsEscape
    );

}


// =====================================================
// ESCAPE KEY
// =====================================================

function handleDetailsEscape(event) {

    if (event.key === "Escape") {

        closeBookingDetails();

    }

}


// =====================================================
// NORMALIZE STATUS
// =====================================================

function normalizeStatus(status) {

    if (!status) {
        return "pending";
    }


    const value =
        String(status)
            .toLowerCase()
            .trim();


    if (
        value.includes("cancel")
    ) {
        return "cancelled";
    }


    if (
        value.includes("complete") ||
        value.includes("finished")
    ) {
        return "completed";
    }


    if (
        value.includes("progress") ||
        value.includes("started") ||
        value.includes("ongoing")
    ) {
        return "in-progress";
    }


    if (
        value.includes("assigned")
    ) {
        return "assigned";
    }


    if (
        value.includes("way") ||
        value.includes("travel")
    ) {
        return "on-the-way";
    }


    return "pending";

}


// =====================================================
// STATUS LABEL
// =====================================================

function getStatusLabel(status) {

    const labels = {

        pending:
            "Booking Confirmed",

        assigned:
            "Technician Assigned",

        "on-the-way":
            "Technician On The Way",

        "in-progress":
            "Service In Progress",

        completed:
            "Service Completed",

        cancelled:
            "Booking Cancelled"

    };


    return (
        labels[status] ||
        "Booking Confirmed"
    );

}


// =====================================================
// STATUS CLASS
// =====================================================

function getStatusClass(status) {

    if (status === "completed") {
        return "status-completed";
    }


    if (status === "cancelled") {
        return "status-cancelled";
    }


    if (status === "assigned") {
        return "status-assigned";
    }


    if (status === "on-the-way") {
        return "status-on-the-way";
    }


    if (status === "in-progress") {
        return "status-progress";
    }


    return "status-pending";

}


// =====================================================
// CREATE TIMELINE
// =====================================================
function createBookingTimeline(status, booking) {

    // =========================================
    // GET STATUS TIME
    // =========================================

    function getStatusTime(key) {

    const history =
        booking?.statusHistory;

    if (!history) {
        return null;
    }

    const value =
        history[key];

    if (!value) {
        return null;
    }

    // =========================================
    // FIRESTORE TIMESTAMP
    // Supports both:
    // seconds
    // _seconds
    // =========================================

    if (typeof value === "object") {

        const seconds =
            value.seconds ??
            value._seconds;

        const nanoseconds =
            value.nanoseconds ??
            value._nanoseconds ??
            0;

        if (seconds !== undefined) {

            return new Date(
                Number(seconds) * 1000 +
                Number(nanoseconds) / 1000000
            );
        }
    }

    // =========================================
    // NORMAL DATE / ISO STRING
    // =========================================

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return null;
    }

    return date;
}

    // =========================================
    // FORMAT STATUS TIME
    // =========================================

    function formatStatusTime(date) {

        if (!date) {
            return "";
        }

        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            }
        );

    }


    // =========================================
    // CANCELLED
    // =========================================

    if (status === "cancelled") {

        const pendingTime =
            getStatusTime("pending");

        const cancelledTime =
            getStatusTime("cancelled");

        return `

            <div class="timeline-item done">

                <div class="timeline-marker">
                    ✓
                </div>

                <div class="timeline-content">

                    <strong>
                        Booking Created
                    </strong>

                    <span>
                        Your booking was received
                    </span>

                    ${
                        pendingTime
                            ?
                            `
                            <small class="timeline-time">
                                🕐 ${formatStatusTime(pendingTime)}
                            </small>
                            `
                            :
                            ""
                    }

                </div>

            </div>


            <div class="timeline-item cancelled">

                <div class="timeline-marker">
                    ×
                </div>

                <div class="timeline-content">

                    <strong>
                        Booking Cancelled
                    </strong>

                    <span>
                        This booking has been cancelled
                    </span>

                    ${
                        cancelledTime
                            ?
                            `
                            <small class="timeline-time">
                                🕐 ${formatStatusTime(cancelledTime)}
                            </small>
                            `
                            :
                            ""
                    }

                </div>

            </div>

        `;

    }


    // =========================================
    // TIMELINE STEPS
    // =========================================

    const steps = [

        {
            key: "pending",

            title:
                "Booking Confirmed",

            description:
                "Your service request has been received"
        },

        {
            key: "assigned",

            title:
                "Technician Assigned",

            description:
                "A technician has been assigned to your booking"
        },

        {
            key: "on-the-way",

            title:
                "Technician On The Way",

            description:
                "Your technician is heading to the service location"
        },

        {
            key: "in-progress",

            title:
                "Service Started",

            description:
                "Your service is currently in progress"
        },

        {
            key: "completed",

            title:
                "Service Completed",

            description:
                "Your service has been successfully completed"
        }

    ];


    // =========================================
    // STATUS ORDER
    // =========================================

    const order = [

        "pending",
        "assigned",
        "on-the-way",
        "in-progress",
        "completed"

    ];


    let currentIndex =
        order.indexOf(status);


    if (currentIndex < 0) {

        currentIndex = 0;

    }


    // =========================================
    // CREATE TIMELINE
    // =========================================

    return steps
        .map((step, index) => {

            let itemClass = "";


            if (index < currentIndex) {

                itemClass = "done";

            }

            else if (index === currentIndex) {

                if (
                    status === "completed"
                ) {

                    itemClass = "done";

                }

                else {

                    itemClass = "active";

                }

            }


            const statusTime =
                getStatusTime(
                    step.key
                );


            const formattedTime =
                formatStatusTime(
                    statusTime
                );


            return `

                <div class="
                    timeline-item
                    ${itemClass}
                ">

                    <div class="timeline-marker">

                        ${
                            index < currentIndex
                                ?
                                "✓"

                                :

                            index === currentIndex &&
                            status === "completed"
                                ?
                                "✓"

                                :

                            index === currentIndex
                                ?
                                "●"

                                :
                                ""
                        }

                    </div>


                    <div class="timeline-content">

                        <strong>
                            ${step.title}
                        </strong>

                        <span>
                            ${step.description}
                        </span>


                        ${
                            formattedTime
                                ?
                                `
                                <small class="timeline-time">
                                    🕐 ${formattedTime}
                                </small>
                                `
                                :
                                ""
                        }

                    </div>

                </div>

            `;

        })
        .join("");

}

// =====================================================
// TECHNICIAN SECTION
// =====================================================
// =====================================================
// TECHNICIAN SECTION
// =====================================================

function createTechnicianSection(
    booking,
    technicianName,
    technicianPhone,
    technicianRating,
    totalReviews,
    technicianService,
    technicianExperience
) {

    const assigned =
        booking.technician ||
        booking.technicianId;

    // =========================================
    // NOT ASSIGNED
    // =========================================

    if (!assigned) {
        return `
            <section class="detail-section technician-section">

                <div class="section-heading">
                    <span class="section-line"></span>
                    <h3>Assigned Technician</h3>
                </div>

                <div class="technician-card not-assigned">

                    <div class="technician-avatar">
                        👨‍🔧
                    </div>

                    <div class="technician-info">
                        <span class="technician-label">
                            YOUR TECHNICIAN
                        </span>

                        <h4>Technician Not Assigned</h4>

                        <div class="technician-designation">
                            Technician will appear here once assigned.
                        </div>
                    </div>

                </div>

            </section>
        `;
    }

    // =========================================
    // RATING
    // =========================================

    const hasRating =
        technicianRating !== null &&
        technicianRating !== undefined &&
        technicianRating !== "";

    const ratingValue =
        hasRating
            ? Number(technicianRating)
            : 0;

    const reviewCount =
        totalReviews !== null &&
        totalReviews !== undefined &&
        totalReviews !== ""
            ? Number(totalReviews)
            : 0;

    // =========================================
    // EXPERIENCE
    // =========================================

    const hasExperience =
        technicianExperience !== null &&
        technicianExperience !== undefined &&
        technicianExperience !== "";

    // =========================================
    // PHONE
    // =========================================

    const hasPhone =
        technicianPhone !== null &&
        technicianPhone !== undefined &&
        technicianPhone !== "";

    // =========================================
    // FINAL CARD
    // =========================================

    return `
        <section class="detail-section technician-section">

            <div class="section-heading">
                <span class="section-line"></span>
                <h3>Assigned Technician</h3>
            </div>


            <div class="technician-card">

                <!-- LEFT SIDE -->

                <div class="technician-main">

                    <div class="technician-avatar">
                        👨‍🔧
                    </div>


                    <div class="technician-info">

                        <span class="technician-label">
                            YOUR TECHNICIAN
                        </span>

                        <h4>
                            ${escapeHTML(
                                technicianName || "Technician"
                            )}
                        </h4>


                        ${
                            technicianService
                                ?
                                `
                                <div class="technician-designation">
                                    🔧 ${escapeHTML(
                                        technicianService
                                    )}
                                </div>
                                `
                                :
                                ""
                        }

                    </div>

                </div>


                <!-- RIGHT SIDE : RATING + EXPERIENCE -->

                <div class="technician-stats">

                    ${
                        hasRating
                            ?
                            `
                            <div class="technician-stat">

                                <span class="stat-label">
                                    RATING
                                </span>

                                <div class="stat-value rating-value">

                                    <span>★</span>

                                    ${ratingValue.toFixed(1)}

                                    <small>
                                        (${reviewCount} ratings)
                                    </small>

                                </div>

                            </div>
                            `
                            :
                            ""
                    }


                    ${
                        hasExperience
                            ?
                            `
                            <div class="technician-stat">

                                <span class="stat-label">
                                    EXPERIENCE
                                </span>

                                <div class="stat-value">
                                    Exp : ${escapeHTML(
                                        technicianExperience
                                    )} yrs
                                </div>

                            </div>
                            `
                            :
                            ""
                    }

                </div>


                <!-- CALL BUTTON -->

                ${
                    hasPhone
                        ?
                        `
                        <a
                            href="tel:${escapeHTML(
                                technicianPhone
                            )}"
                            class="technician-call"
                            title="Call ${escapeHTML(
                                technicianName || "Technician"
                            )}"
                        >

                            <span class="call-icon">
                                📞
                            </span>

                            <span>

                                <small>
                                    CALL TECHNICIAN
                                </small>

                                ${escapeHTML(
                                    technicianPhone
                                )}

                            </span>

                        </a>
                        `
                        :
                        ""
                }

            </div>

        </section>
    `;
}

// =====================================================
// REVIEW SECTION
// =====================================================

function createReviewSection(booking) {

    if (
        normalizeStatus(booking.status) !==
        "completed"
    ) {

        return "";

    }


    // -----------------------------------------
    // ALREADY REVIEWED
    // -----------------------------------------

    if (booking.reviewSubmitted) {

        const rating =
            Number(
                booking.userRating || 0
            );


        const stars =
            [1, 2, 3, 4, 5]
                .map(num => {

                    return `
                        <span
                            class="${
                                rating >= num
                                    ? "active"
                                    : ""
                            }"
                        >
                            ★
                        </span>
                    `;

                })
                .join("");


        return `

            <section class="detail-section">

                <div class="section-heading">

                    <span class="section-line"></span>

                    <h3>
                        Your Review
                    </h3>

                </div>


                <div class="existing-review">

                    <div class="existing-stars">

                        ${stars}

                    </div>


                    <p>
                        ${escapeHTML(
                            booking.review ||
                            "No written feedback provided."
                        )}
                    </p>

                </div>

            </section>

        `;

    }


    // -----------------------------------------
    // NOT REVIEWED
    // -----------------------------------------

    return `

        <section class="detail-section">

            <div class="section-heading">

                <span class="section-line"></span>

                <h3>
                    Rate Your Experience
                </h3>

            </div>


            <div class="review-prompt">

                <div class="review-prompt-icon">
                    ⭐
                </div>

                <div>

                    <strong>
                        How was your service?
                    </strong>

                    <p>
                        Tap a star below to rate your
                        technician.
                    </p>

                </div>

            </div>


          <div
    class="detail-rating-stars"
    data-booking="${escapeHTML(booking.id)}"
    data-tech="${escapeHTML(booking.technicianId || "")}"
    onmouseleave="restoreReviewRating('${escapeHTML(booking.id)}')"
>


${[1, 2, 3, 4, 5]
    .map(num => `
        <span
            data-rating="${num}"
            onclick="selectReviewRating(
                '${escapeHTML(booking.id)}',
                '${escapeHTML(booking.technicianId || "")}',
                ${num}
            )"
            onmouseenter="previewReviewRating(
                '${escapeHTML(booking.id)}',
                ${num}
            )"
        >
            ★
        </span>
    `)
    .join("")
}

            </div>

        </section>

    `;

}

// =====================================================
// SELECT REVIEW RATING
// =====================================================

function selectReviewRating(
    bookingId,
    technicianId,
    rating
) {

    console.log("STAR CLICKED:", {
        bookingId,
        technicianId,
        rating
    });

    if (!bookingId) {
        console.error("Booking ID missing");
        return;
    }

    if (!technicianId) {
        alert(
            "Technician information is missing for this booking."
        );
        return;
    }

    selectedRating = Number(rating);
    selectedBookingId = bookingId;
    selectedTechnicianId = technicianId;

    highlightReviewStars(
        bookingId,
        selectedRating
    );

    openReviewModal(
        bookingId,
        technicianId,
        selectedRating
    );
}


// =====================================================
// HIGHLIGHT REVIEW STARS
// =====================================================

function highlightReviewStars(
    bookingId,
    rating
) {

    const group =
        document.querySelector(
            `.detail-rating-stars[data-booking="${CSS.escape(bookingId)}"]`
        );

    if (!group) {
        return;
    }

    group
        .querySelectorAll("span")
        .forEach(star => {

            const value =
                Number(star.dataset.rating);

            if (value <= rating) {
                star.classList.add("active");
            } else {
                star.classList.remove("active");
            }

        });
}


// =====================================================
// STAR HOVER PREVIEW
// =====================================================

function previewReviewRating(
    bookingId,
    rating
) {

    highlightReviewStars(
        bookingId,
        Number(rating)
    );
}


// =====================================================
// RESTORE SELECTED RATING
// =====================================================

function restoreReviewRating(
    bookingId
) {

    const rating =
        selectedBookingId === bookingId
            ? selectedRating
            : 0;

    highlightReviewStars(
        bookingId,
        rating
    );
}


// =====================================================
// DELETE BOOKING
// =====================================================

async function deleteBooking(id) {

    const confirmDelete =
        confirm(
            "Cancel this booking?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

     const response = await fetch(
    `${API_URL}/bookings/${id}`,
    {
        method: "PUT",

        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
            status: "Cancelled"
        })
    }
);

        const data =
            await response.json();


        console.log(
            "Delete response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to cancel booking"
            );

            return;

        }

        alert(
    data.message ||
    "Booking cancelled successfully"
);


        alert(
            data.message ||
            "Booking cancelled successfully"
        );


        closeBookingDetails();

        await loadBookings();

    }

    catch (error) {

        console.log(
            "Delete booking error:",
            error
        );


        alert(
            "Failed to cancel booking"
        );

    }

}


// =====================================================
// EDIT BOOKING
// =====================================================

async function editBooking(id) {

    const newIssue =
        prompt(
            "Enter new issue"
        );


    if (!newIssue) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/bookings/${id}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({
                        issue: newIssue
                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Edit response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update booking"
            );

            return;

        }


        alert(
            data.message ||
            "Booking updated successfully"
        );


        closeBookingDetails();

        await loadBookings();

    }

    catch (error) {

        console.log(
            "Edit booking error:",
            error
        );


        alert(
            "Failed to update booking"
        );

    }

}


// =====================================================
// REVIEW VARIABLES
// =====================================================

let selectedRating = 0;
let selectedBookingId = "";
let selectedTechnicianId = "";


// =====================================================
// OPEN REVIEW MODAL
// =====================================================

// =====================================================
// OPEN REVIEW MODAL
// =====================================================

function openReviewModal(
    bookingId,
    technicianId,
    rating
) {

    console.log(
        "Opening review modal:",
        {
            bookingId,
            technicianId,
            rating
        }
    );


    selectedBookingId =
        bookingId;

    selectedTechnicianId =
        technicianId;

    selectedRating =
        Number(rating);


    const modal =
        document.getElementById(
            "reviewModal"
        );


    if (!modal) {

        console.error(
            "Review modal not found"
        );

        return;
    }


    // -----------------------------------------
    // RESET REVIEW TEXT
    // -----------------------------------------

    const reviewText =
        document.getElementById(
            "reviewText"
        );

    if (reviewText) {

        reviewText.value = "";

    }


    // -----------------------------------------
    // FORCE MODAL ABOVE BOOKING DETAILS
    // -----------------------------------------

    modal.style.display = "flex";

    modal.style.position = "fixed";

    modal.style.zIndex = "999999";

    modal.style.visibility = "visible";

    modal.style.opacity = "1";


    // -----------------------------------------
    // HIGHLIGHT SELECTED STARS
    // -----------------------------------------

    document
        .querySelectorAll(
            ".detail-rating-stars span"
        )
        .forEach(star => {

            const value =
                Number(
                    star.dataset.rating
                );

            if (value <= selectedRating) {

                star.classList.add(
                    "active"
                );

            }
            else {

                star.classList.remove(
                    "active"
                );

            }

        });

}


// =====================================================
// CLOSE REVIEW MODAL
// =====================================================

function closeReviewModal() {

    const modal =
        document.getElementById(
            "reviewModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


// =====================================================
// SUBMIT REVIEW
// =====================================================

async function submitReview() {

    console.log(
        "SUBMIT BUTTON CLICKED"
    );


    try {

        if (
    !selectedRating ||
    selectedRating < 1 ||
    selectedRating > 5
) {

    alert(
        "Please select a rating from 1 to 5 stars."
    );

    return;
}


if (!selectedBookingId) {

    alert(
        "Booking information is missing."
    );

    return;
}


if (!selectedTechnicianId) {

    alert(
        "Technician information is missing."
    );

    return;
}


        const review =
            document
                .getElementById(
                    "reviewText"
                )
                .value
                .trim();


        const user =
            JSON.parse(
                localStorage.getItem(
                    "user"
                )
            );


        if (
            !user ||
            !user.id
        ) {

            alert(
                "User information not found. Please login again."
            );

            return;
        }


        const response =
            await fetch(
                `${API_URL}/reviews/add`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body: JSON.stringify({

                        bookingId:
                            selectedBookingId,

                        technicianId:
                            selectedTechnicianId,

                        userId:
                            user.id,

                        rating:
                            selectedRating,

                        review:
                            review

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "Review response:",
            data
        );


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to submit review"
            );

            return;
        }


        alert(
            data.message ||
            "Review submitted successfully"
        );


       closeReviewModal();

const reviewText =
    document.getElementById(
        "reviewText"
    );

if (reviewText) {

    reviewText.value = "";

}

// -----------------------------------------
// SAVE BOOKING ID BEFORE RESET
// -----------------------------------------

const reviewedBookingId =
    selectedBookingId;


// -----------------------------------------
// RESET REVIEW STATE
// -----------------------------------------

selectedRating = 0;
selectedBookingId = "";
selectedTechnicianId = "";


// -----------------------------------------
// REFRESH BOOKINGS
// -----------------------------------------

await loadBookings();


// -----------------------------------------
// REOPEN UPDATED BOOKING
// -----------------------------------------

if (reviewedBookingId) {

    setTimeout(() => {

        openBookingDetails(
            reviewedBookingId
        );

    }, 300);

}



    }

    catch (error) {

        console.log(
            "Submit review error:",
            error
        );


        alert(
            "Failed To Submit Review"
        );

    }

}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

window.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "reviewModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeReviewModal();

        }

    }
);


// =====================================================
// INITIAL LOAD
// =====================================================

loadBookings();