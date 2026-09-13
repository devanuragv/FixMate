/* =====================================================
   FIXMATE IN-APP POPUPS
   NO BROWSER ALERT / CONFIRM / PROMPT
===================================================== */

(function () {

    if (document.getElementById("fixmateAppPopupStyles")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "fixmateAppPopupStyles";

    style.textContent = `

        .fixmate-popup-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;

            display: flex;
            align-items: center;
            justify-content: center;

            padding: 20px;

            background: rgba(0, 0, 0, 0.72);
            backdrop-filter: blur(8px);

            opacity: 0;
            visibility: hidden;

            transition: 0.2s ease;
        }

        .fixmate-popup-overlay.show {
            opacity: 1;
            visibility: visible;
        }

        .fixmate-popup-card {
            width: min(440px, 100%);

            background: #111116;

            border: 1px solid #282830;
            border-top: 3px solid #ff7100;

            border-radius: 18px;

            padding: 25px;

            box-shadow:
                0 25px 80px rgba(0, 0, 0, 0.55);

            color: #ffffff;

            font-family: "Poppins", sans-serif;

            transform:
                translateY(10px)
                scale(0.98);

            transition: 0.2s ease;
        }

        .fixmate-popup-overlay.show
        .fixmate-popup-card {

            transform:
                translateY(0)
                scale(1);
        }

        .fixmate-popup-head {

            display: flex;
            align-items: center;

            gap: 13px;

            margin-bottom: 12px;
        }

        .fixmate-popup-icon {

            width: 42px;
            height: 42px;

            min-width: 42px;

            border-radius: 50%;

            display: grid;
            place-items: center;

            background: #ff7100;

            color: #0b0b0f;

            font-size: 20px;

            font-weight: 800;
        }

        .fixmate-popup-card.error
        .fixmate-popup-icon {

            background: #ff4d5e;
            color: #ffffff;
        }

        .fixmate-popup-card.warning
        .fixmate-popup-icon {

            background: #ffb020;
        }

        .fixmate-popup-card.success
        .fixmate-popup-icon {

            background: #18c98b;
        }

        .fixmate-popup-title {

            margin: 0;

            font-size: 18px;

            font-weight: 700;
        }

        .fixmate-popup-message {

            margin: 0 0 20px;

            color: #9b9da7;

            line-height: 1.6;

            font-size: 13px;

            white-space: pre-line;
        }

        .fixmate-popup-input {

            width: 100%;

            box-sizing: border-box;

            background: #0d0d12;

            border: 1px solid #282830;

            color: #ffffff;

            border-radius: 12px;

            padding: 13px 14px;

            outline: none;

            font: inherit;

            margin-bottom: 18px;
        }

        .fixmate-popup-input:focus {

            border-color: #ff7100;

            box-shadow:
                0 0 0 3px
                rgba(255, 113, 0, 0.10);
        }

        .fixmate-popup-actions {

            display: flex;

            justify-content: flex-end;

            gap: 10px;
        }

        .fixmate-popup-btn {

            border: 1px solid #282830;

            border-radius: 10px;

            padding: 10px 16px;

            font:
                600 13px
                "Poppins", sans-serif;

            cursor: pointer;

            transition: 0.2s ease;
        }

        .fixmate-popup-btn.cancel {

            background: #0d0d12;

            color: #c8c9d0;
        }

        .fixmate-popup-btn.primary {

            background: #ff7100;

            border-color: #ff7100;

            color: #0b0b0f;
        }

        .fixmate-popup-btn.primary:hover {

            background: #ff8a1f;
        }

        @media (max-width: 520px) {

            .fixmate-popup-actions {

                flex-direction:
                    column-reverse;
            }

            .fixmate-popup-btn {

                width: 100%;
            }
        }
    `;

    document.head.appendChild(style);


    /* =====================================================
       NORMAL IN-APP MESSAGE
    ===================================================== */

    window.showAppToast = function (
        type,
        message,
        title
    ) {

        const old =
            document.getElementById(
                "fixmateToast"
            );

        if (old) {
            old.remove();
        }


        const popup =
            document.createElement("div");

        popup.id =
            "fixmateToast";

        popup.className =
            "fixmate-popup-overlay";


        const icon =
            type === "success"
                ? "✓"
                : type === "error"
                    ? "!"
                    : type === "warning"
                        ? "!"
                        : "i";


        const heading =
            title ||
            (
                type === "success"
                    ? "Success"
                    : type === "error"
                        ? "Something went wrong"
                        : type === "warning"
                            ? "Please check"
                            : "FixMate"
            );


        popup.innerHTML = `

            <div class="
                fixmate-popup-card
                ${type || "info"}
            ">

                <div class="fixmate-popup-head">

                    <div class="
                        fixmate-popup-icon
                    ">
                        ${icon}
                    </div>

                    <h3 class="
                        fixmate-popup-title
                    ">
                    </h3>

                </div>


                <p class="
                    fixmate-popup-message
                "></p>


                <div class="
                    fixmate-popup-actions
                ">

                    <button
                        class="
                            fixmate-popup-btn
                            primary
                        "
                        type="button"
                    >
                        OK
                    </button>

                </div>

            </div>
        `;


        popup.querySelector(
            ".fixmate-popup-title"
        ).textContent = heading;


        popup.querySelector(
            ".fixmate-popup-message"
        ).textContent =
            String(message ?? "");


        document.body.appendChild(
            popup
        );


        const closePopup = () => {

            popup.classList.remove(
                "show"
            );

            setTimeout(() => {

                if (
                    document.body.contains(
                        popup
                    )
                ) {
                    popup.remove();
                }

            }, 180);
        };


        popup.querySelector(
            ".primary"
        ).addEventListener(
            "click",
            closePopup
        );


        popup.addEventListener(
            "click",
            event => {

                if (
                    event.target === popup
                ) {
                    closePopup();
                }

            }
        );


        requestAnimationFrame(() => {

            popup.classList.add(
                "show"
            );

        });


        setTimeout(() => {

            if (
                document.body.contains(
                    popup
                )
            ) {
                closePopup();
            }

        }, 4000);
    };


    /* =====================================================
       CUSTOM CONFIRM
    ===================================================== */

    window.showAppConfirm = function (
        message,
        title = "Confirm Action"
    ) {

        return new Promise(
            resolve => {

                const popup =
                    document.createElement(
                        "div"
                    );

                popup.className =
                    "fixmate-popup-overlay";


                popup.innerHTML = `

                    <div class="
                        fixmate-popup-card
                        warning
                    ">

                        <div class="
                            fixmate-popup-head
                        ">

                            <div class="
                                fixmate-popup-icon
                            ">
                                ?
                            </div>

                            <h3 class="
                                fixmate-popup-title
                            "></h3>

                        </div>


                        <p class="
                            fixmate-popup-message
                        "></p>


                        <div class="
                            fixmate-popup-actions
                        ">

                            <button
                                class="
                                    fixmate-popup-btn
                                    cancel
                                "
                                type="button"
                            >
                                Cancel
                            </button>


                            <button
                                class="
                                    fixmate-popup-btn
                                    primary
                                "
                                type="button"
                            >
                                Continue
                            </button>

                        </div>

                    </div>
                `;


                popup.querySelector(
                    ".fixmate-popup-title"
                ).textContent = title;


                popup.querySelector(
                    ".fixmate-popup-message"
                ).textContent =
                    message;


                document.body.appendChild(
                    popup
                );


                let finished = false;


                const finish = value => {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    popup.classList.remove(
                        "show"
                    );


                    setTimeout(() => {

                        popup.remove();

                    }, 180);


                    resolve(value);
                };


                popup.querySelector(
                    ".cancel"
                ).onclick = () => {

                    finish(false);

                };


                popup.querySelector(
                    ".primary"
                ).onclick = () => {

                    finish(true);

                };


                popup.onclick = event => {

                    if (
                        event.target === popup
                    ) {
                        finish(false);
                    }

                };


                requestAnimationFrame(() => {

                    popup.classList.add(
                        "show"
                    );

                });

            }
        );
    };


    /* =====================================================
       CUSTOM INPUT PROMPT
    ===================================================== */

    window.showAppPrompt = function (
        message,
        defaultValue = "",
        title = "Edit Details"
    ) {

        return new Promise(
            resolve => {

                const popup =
                    document.createElement(
                        "div"
                    );

                popup.className =
                    "fixmate-popup-overlay";


                popup.innerHTML = `

                    <div class="
                        fixmate-popup-card
                    ">

                        <div class="
                            fixmate-popup-head
                        ">

                            <div class="
                                fixmate-popup-icon
                            ">
                                ✎
                            </div>

                            <h3 class="
                                fixmate-popup-title
                            "></h3>

                        </div>


                        <p class="
                            fixmate-popup-message
                        "></p>


                        <input
                            class="
                                fixmate-popup-input
                            "
                            type="text"
                        >


                        <div class="
                            fixmate-popup-actions
                        ">

                            <button
                                class="
                                    fixmate-popup-btn
                                    cancel
                                "
                                type="button"
                            >
                                Cancel
                            </button>


                            <button
                                class="
                                    fixmate-popup-btn
                                    primary
                                "
                                type="button"
                            >
                                Save
                            </button>

                        </div>

                    </div>
                `;


                popup.querySelector(
                    ".fixmate-popup-title"
                ).textContent = title;


                popup.querySelector(
                    ".fixmate-popup-message"
                ).textContent =
                    message;


                const input =
                    popup.querySelector(
                        ".fixmate-popup-input"
                    );


                input.value =
                    defaultValue;


                document.body.appendChild(
                    popup
                );


                let finished = false;


                const finish = value => {

                    if (finished) {
                        return;
                    }

                    finished = true;

                    popup.classList.remove(
                        "show"
                    );


                    setTimeout(() => {

                        popup.remove();

                    }, 180);


                    resolve(value);
                };


                popup.querySelector(
                    ".cancel"
                ).onclick = () => {

                    finish(null);

                };


                popup.querySelector(
                    ".primary"
                ).onclick = () => {

                    finish(input.value);

                };


                input.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key ===
                            "Enter"
                        ) {
                            finish(
                                input.value
                            );
                        }


                        if (
                            event.key ===
                            "Escape"
                        ) {
                            finish(null);
                        }

                    }
                );


                popup.onclick = event => {

                    if (
                        event.target === popup
                    ) {
                        finish(null);
                    }

                };


                requestAnimationFrame(
                    () => {

                        popup.classList.add(
                            "show"
                        );

                        input.focus();

                        input.select();

                    }
                );

            }
        );
    };

})();

// ================================
// Admin Authentication
// ================================

const token =
    localStorage.getItem("fixmateToken");

if (!token) {

    showAppToast("error", "Please Login First");

    window.location.href =
        "/login.html";

}

// =====================================================
// GET BOOKING CREATED TIME
// =====================================================

function getBookingCreatedTime(booking) {

    if (!booking) {
        return 0;
    }

    const createdAt = booking.createdAt;

    // =========================================
    // FIRESTORE TIMESTAMP
    // Supports:
    // seconds / nanoseconds
    // _seconds / _nanoseconds
    // =========================================

    if (
        createdAt &&
        typeof createdAt === "object"
    ) {

        const seconds =
            createdAt.seconds ??
            createdAt._seconds;

        const nanoseconds =
            createdAt.nanoseconds ??
            createdAt._nanoseconds ??
            0;

        if (
            seconds !== undefined &&
            seconds !== null
        ) {

            return (
                Number(seconds) * 1000 +
                Number(nanoseconds) / 1000000
            );

        }
    }

    // =========================================
    // NORMAL ISO / JAVASCRIPT DATE
    // =========================================

    if (
        createdAt &&
        typeof createdAt === "string"
    ) {

        const time =
            new Date(createdAt).getTime();

        if (!isNaN(time)) {
            return time;
        }
    }

    // =========================================
    // NUMBER TIMESTAMP
    // =========================================

    if (
        createdAt &&
        typeof createdAt === "number"
    ) {

        return createdAt;
    }

    return 0;
}

// ================================
// Load Admin Dashboard Data
// ================================

async function loadAdminData() {

    try {

        const users =
            await fetch(
                "/api/admin/users",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const bookings =
            await fetch(
                "/api/admin/bookings",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const technicians =
            await fetch(
                "/api/admin/technicians",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const usersData =
            await users.json();


        const bookingsData =
            await bookings.json();


        const techniciansData =
            await technicians.json();


        // =================================================
// STORE ALL BOOKINGS
// =================================================

window.allBookings =
    bookingsData.bookings || [];


// =================================================
// NEWEST REQUEST FIRST
//
// IMPORTANT:
// Sort by createdAt.
// NOT bookingDate.
// NOT bookingTime.
//
// Latest customer request will always appear first.
// =================================================

window.allBookings.sort((a, b) => {

    const createdA =
        getBookingCreatedTime(a);

    const createdB =
        getBookingCreatedTime(b);


    // Bookings without createdAt go last

    if (
        createdA === 0 &&
        createdB === 0
    ) {
        return 0;
    }

    if (createdA === 0) {
        return 1;
    }

    if (createdB === 0) {
        return -1;
    }


    // NEWEST FIRST

    return createdB - createdA;

});


        window.allUsers =
            usersData.users || [];


        window.allTechnicians =
            techniciansData.technicians || [];


        if (
            !usersData.success ||
            !bookingsData.success ||
            !techniciansData.success
        ) {

            console.log(
                usersData,
                bookingsData,
                techniciansData
            );

            return;

        }


        // ================================
        // Dashboard Counts
        // ================================

        document.getElementById(
            "usersCount"
        ).innerText =
            usersData.users.length;


        document.getElementById(
            "bookingsCount"
        ).innerText =
            bookingsData.bookings.length;


        document.getElementById(
            "techniciansCount"
        ).innerText =
            techniciansData.technicians.length;


        const availableTechs =
            techniciansData.technicians.filter(
                tech =>
                    tech.status === "Available"
            ).length;


        const offlineTechs =
            techniciansData.technicians.filter(
                tech =>
                    tech.status === "Offline"
            ).length;


        const completedServices =
            bookingsData.bookings.filter(
                booking =>
                    booking.status === "Completed"
            ).length;


        const pendingServices =
            bookingsData.bookings.filter(
                booking =>
                    booking.status === "Pending"
            ).length;


        document.getElementById(
            "availableTechs"
        ).innerText =
            availableTechs;


        document.getElementById(
            "offlineTechs"
        ).innerText =
            offlineTechs;


        document.getElementById(
            "completedServices"
        ).innerText =
            completedServices;


        document.getElementById(
            "pendingServices"
        ).innerText =
            pendingServices;


        // ================================
        // Booking Cards
        // ================================

        let html = "";


        window.allBookings.forEach(
    booking => {

                const status =
                    booking.status || "Pending";


                let statusClass =
                    status
                        .toLowerCase()
                        .replace(/\s+/g, "-");


                html += `

                <div
                    class="booking-card"
                    data-status="${status}"
                    onclick="viewBookingDetails('${booking.id}')"
                >

                    <h3>
                        ${booking.service || "Service"}
                    </h3>


                    <p>
                        <strong>Issue:</strong>
                        ${booking.issue || "-"}
                    </p>


                    <p>
                        <strong>Status:</strong>

                        <span class="booking-status ${statusClass}">
                            ${status}
                        </span>

                    </p>


                    <p>
                        <strong>Technician:</strong>
                        ${booking.technician || "Not Assigned"}
                    </p>


                    ${
                        status === "Pending"
                        ?
                        `

                        <div
                            class="assignment-area"
                            onclick="event.stopPropagation()"
                        >

                            <select
                                id="tech-${booking.id}"
                                class="tech-select"
                                onclick="event.stopPropagation()"
                            >

                                <option value="">
                                    Select Technician
                                </option>

                            </select>


                            <button
                                class="assign-btn"
                                onclick="
                                    event.stopPropagation();
                                    assignTechnician('${booking.id}');
                                "
                            >

                                Assign Technician

                            </button>

                        </div>

                        `
                        :
                        status === "Cancelled"
                        ?
                        `

                        <div
                            class="cancelled-service-box"
                            onclick="event.stopPropagation()"
                        >

                            <p class="cancelled-text">

                                ❌ Service Cancelled

                            </p>

                        </div>

                        `
                        :
                        `

                        <div
                            class="assigned-service-box"
                            onclick="event.stopPropagation()"
                        >

                            <p class="assigned-text">

                                👨‍🔧 Technician Assigned

                            </p>

                        </div>

                        `
                    }

                </div>

                `;

            }
        );


        document.getElementById(
            "bookingList"
        ).innerHTML =
            html;


        loadTechnicianDropdowns(
            techniciansData.technicians
        );


    } catch (error) {

        console.log(
            "Admin Dashboard Error:",
            error
        );

    }

}


// ================================
// Populate Technician Dropdowns
// ================================

function loadTechnicianDropdowns(
    technicians
) {

    const selects =
        document.querySelectorAll(
            ".tech-select"
        );


    selects.forEach(
        select => {

            technicians.forEach(
                tech => {

                    if (
                        tech.status === "Offline"
                    ) {

                        select.innerHTML += `

                        <option
                            value=""
                            disabled
                        >

                            ${tech.name}
                            (${tech.serviceType} - Offline)

                        </option>

                        `;

                    }

                    else {

                        select.innerHTML += `

                        <option
                            value="${tech.id}"
                            data-name="${tech.name}"
                        >

                            ${tech.name}
                            (${tech.serviceType})

                        </option>

                        `;

                    }

                }
            );

        }
    );

}


// ================================
// Assign Technician
// ================================

async function assignTechnician(
    bookingId
) {

    const booking =
        window.allBookings.find(
            b =>
                b.id === bookingId
        );


    if (!booking) {

        showAppToast(
    "error",
    "Booking Not Found"
);

        return;

    }


    // ================================
    // IMPORTANT:
    // Only Pending bookings can be assigned
    // ================================

    if (
        booking.status !== "Pending"
    ) {

        if (
            booking.status === "Cancelled"
        ) {

            showAppToast(
    "warning",
    "This service has been cancelled. Technician cannot be assigned."
);

        }

        else {

            showAppToast(
    "warning",
    "Technician has already been assigned to this service."
);

        }

        return;

    }


    const select =
        document.getElementById(
            `tech-${bookingId}`
        );


    if (!select) {

        showAppToast(
    "error",
    "Technician selection is unavailable."
);

        return;

    }


    const technicianId =
        select.value;


    if (!technicianId) {

      showAppToast(
    "warning",
    "Please Select Technician"
);

        return;

    }


    const selectedOption =
        select.options[
            select.selectedIndex
        ];


    const technicianName =
        selectedOption.dataset.name;


    try {

        const response =
            await fetch(
                `/api/admin/assign/${bookingId}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            technicianId,
                            technicianName

                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

           showAppToast(
    "error",
    data.message ||
    "Failed to assign technician"
);

            return;

        }


       showAppToast(
    "success",
    data.message ||
    "Technician assigned successfully"
);


        await loadAdminData();


    } catch (error) {

        console.log(error);

       showAppToast(
    "error",
    "Unable to assign technician"
);

    }

}


// ================================
// Add Technician
// ================================

document
    .getElementById(
        "technicianForm"
    )
    .addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            try {

                const response =
                    await fetch(
                        "/api/admin/technicians",
                        {
                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        document.getElementById(
                                            "techName"
                                        ).value,

                                    email:
                                        document.getElementById(
                                            "techEmail"
                                        ).value,

                                    password:
                                        document.getElementById(
                                            "techPassword"
                                        ).value,

                                    phone:
                                        document.getElementById(
                                            "techPhone"
                                        ).value,

                                    serviceType:
                                        document.getElementById(
                                            "serviceType"
                                        ).value,

                                    city:
                                        document.getElementById(
                                            "city"
                                        ).value,

                                    state:
                                        document.getElementById(
                                            "state"
                                        ).value,

                                    pincode:
                                        document.getElementById(
                                            "pincode"
                                        ).value

                                })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    showAppToast(
    "error",
    data.message ||
    "Failed to add technician"
);

                    return;

                }


                showAppToast(
    "success",
    (data.message || "Technician added successfully.") +
    "\nTechnician ID: " +
    (
        data.technicianId ||
        "Not generated"
    ),
    "Technician Added"
);


                document
                    .getElementById(
                        "technicianForm"
                    )
                    .reset();


                loadAdminData();
                loadTechnicians();
                loadUsers();

} catch (error) {

    console.log(error);

    showAppToast(
        "error",
        "Unable to add technician."
    );

}

        }
    );


// ================================
// Load Users
// ================================

async function loadUsers() {

    try {

        const response =
            await fetch(
                "/api/admin/users",
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            return;

        }


        let html = "";


        data.users.forEach(
            user => {

                html += `

                <div class="tech-card">

                    <h3>
                        ${user.name || "User"}
                    </h3>


                    <p>
                        <strong>Email:</strong>
                        ${user.email || "-"}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${user.phone || "-"}
                    </p>


                    <p>
                        <strong>City:</strong>
                        ${user.city || "-"}
                    </p>


                    <p>
                        <strong>State:</strong>
                        ${user.state || "-"}
                    </p>


                    <button
                        class="view-btn"
                        onclick="
                            viewUser('${user.id}');
                            document.getElementById('searchResults').innerHTML='';
                        "
                    >

                        View Profile

                    </button>

                </div>

                `;

            }
        );


        document.getElementById(
            "usersList"
        ).innerHTML =
            html;


    } catch (error) {

        console.log(error);

    }

}


// ================================
// Load Technicians
// ================================

async function loadTechnicians() {

    try {

        const response =
            await fetch(
                "/api/admin/technicians",
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            console.log(data);

            return;

        }


        let html = "";


        window.allTechnicians =
            data.technicians;


        data.technicians.forEach(
            tech => {

                html += `

                <div class="tech-card">

                    <h3>
                        ${tech.name}
                    </h3>


                    <p>
                        <strong>Email:</strong>
                        ${tech.email}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${tech.phone}
                    </p>


                    <p>
                        <strong>Service:</strong>
                        ${tech.serviceType}
                    </p>


                    <p>
                        <strong>City:</strong>
                        ${tech.city}
                    </p>


                    <p>
                        <strong>State:</strong>
                        ${tech.state}
                    </p>


                    <p>
                        <strong>Pincode:</strong>
                        ${tech.pincode}
                    </p>


                    <p>
                        <strong>Status:</strong>
                        ${tech.status}
                    </p>


                    <p>
                        <strong>Rating:</strong>
                        ⭐ ${tech.rating || 0}
                    </p>


                    <div class="tech-actions">

                        <button
                            class="view-btn"
                            onclick="
                                event.stopPropagation();
                                viewTechnician('${tech.id}')
                            "
                        >

                            View Details

                        </button>


                        <button
                            class="edit-btn"
                            onclick="
                                event.stopPropagation();
                                editTechnician('${tech.id}')
                            "
                        >

                            Edit Profile

                        </button>


                        <button
                            class="delete-btn"
                            onclick="
                                event.stopPropagation();
                                deleteTechnician('${tech.id}')
                            "
                        >

                            Delete

                        </button>

                    </div>

                </div>

                `;

            }
        );


        document.getElementById(
            "technicianList"
        ).innerHTML =
            html;


    } catch (error) {

        console.log(error);

    }

}


// ================================
// Delete Technician
// ================================

async function deleteTechnician(
    technicianId
) {

    const confirmDelete =
    await showAppConfirm(
        "Delete this technician?",
        "Delete Technician"
    );


    if (!confirmDelete) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/admin/technicians/${technicianId}`,
                {
                    method: "DELETE",

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


       showAppToast(
    "success",
    data.message || "Technician deleted successfully.",
    "Technician Deleted"
);


        loadTechnicians();
        loadAdminData();


    } catch (error) {

        console.log(error);

    }

}


// ================================
// Show / Hide Password
// ================================

const togglePassword =
    document.getElementById(
        "togglePassword"
    );


const techPassword =
    document.getElementById(
        "techPassword"
    );


if (
    togglePassword &&
    techPassword
) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                techPassword.type ===
                "password"
            ) {

                techPassword.type =
                    "text";

                togglePassword.innerHTML =
                    "🙈";

            }

            else {

                techPassword.type =
                    "password";

                togglePassword.innerHTML =
                    "👁";

            }

        }
    );

}


// ================================
// Show Section
// ================================

function showSection(
    sectionId
) {

    document
        .querySelectorAll(
            ".dashboard-section"
        )
        .forEach(
            section => {

                section.classList.add(
                    "hidden"
                );

            }
        );


    document
        .getElementById(
            sectionId
        )
        .classList.remove(
            "hidden"
        );

}


// ================================
// Edit Technician
// ================================

async function editTechnician(
    technicianId
) {

    const newPhone =
    await showAppPrompt(
        "Enter New Phone Number",
        "",
        "Update Technician Phone"
    );


    if (!newPhone) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/admin/technicians/${technicianId}`,
                {
                    method: "PUT",

                    headers: {

                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`

                    },

                    body:
                        JSON.stringify({

                            phone: newPhone

                        })

                }
            );


        const data =
            await response.json();


      showAppToast(
    "success",
    data.message || "Technician updated successfully.",
    "Technician Updated"
);


        loadTechnicians();


    } catch (error) {

        console.log(error);

    }

}


// ================================
// View Technician
// ================================

async function viewTechnician(
    technicianId
) {

    try {

        const response =
            await fetch(
                "/api/admin/technicians",
                {
                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }
                }
            );


        const data =
            await response.json();


        const tech =
            data.technicians.find(
                t =>
                    t.id === technicianId
            );


        if (!tech) {

           showAppToast(
    "error",
    "Technician Not Found"
);

            return;

        }


        const totalJobs =
            window.allBookings.filter(
                booking =>
                    booking.technician ===
                    tech.name
            ).length;


        document.getElementById(
            "technicianDetails"
        ).innerHTML = `

            <div class="user-details-layout">

                <div class="user-info">

                    <h3>
                        👨‍🔧 Technician Info
                    </h3>

                    <p>
                        <strong>Name:</strong>
                        ${tech.name}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${tech.email}
                    </p>

                    <p>
                        <strong>Phone:</strong>
                        ${tech.phone}
                    </p>

                    <p>
                        <strong>Service:</strong>
                        ${tech.serviceType}
                    </p>

                </div>


                <div class="user-stats">

                    <h3>
                        📊 Statistics
                    </h3>

                    <p>
                        <span>Status</span>
                        <span>${tech.status}</span>
                    </p>

                    <p>
                        <span>Rating</span>
                        <span>
                            ⭐ ${tech.rating || 0}
                        </span>
                    </p>

                    <p>
                        <span>Total Jobs</span>
                        <span>
                            ${totalJobs}
                        </span>
                    </p>

                </div>

            </div>

        `;


        document.getElementById(
            "technicianModal"
        ).style.display =
            "flex";


    } catch (error) {

        console.log(error);

    }

}


// ================================
// View User
// ================================

async function viewUser(
    userId
) {

    try {

        const user =
            window.allUsers.find(
                u =>
                    u.id === userId
            );


        if (!user) {

showAppToast(
    "error",
    "User Not Found"
);

            return;

        }


        const userBookings =
            window.allBookings.filter(
                booking =>
                    booking.userId ===
                    user.id
            );


        const pendingCount =
            userBookings.filter(
                booking =>
                    booking.status ===
                    "Pending"
            ).length;


        const assignedCount =
            userBookings.filter(
                booking =>
                    booking.status ===
                    "Assigned"
            ).length;


        const progressCount =
            userBookings.filter(
                booking =>
                    booking.status ===
                    "In Progress"
            ).length;


        const completedCount =
            userBookings.filter(
                booking =>
                    booking.status ===
                    "Completed"
            ).length;


        document.getElementById(
            "userDetails"
        ).innerHTML = `

            <div class="user-details-layout">

                <div class="user-info">

                    <h3>
                        👤 User Information
                    </h3>


                    <p>
                        <strong>Name:</strong>
                        ${user.name || "-"}
                    </p>


                    <p>
                        <strong>Email:</strong>
                        ${user.email || "-"}
                    </p>


                    <p>
                        <strong>Phone:</strong>
                        ${user.phone || "-"}
                    </p>


                    <p>
                        <strong>City:</strong>
                        ${user.city || "-"}
                    </p>


                    <p>
                        <strong>State:</strong>
                        ${user.state || "-"}
                    </p>

                </div>


                <div class="user-stats">

                    <h3>
                        📊 Booking Statistics
                    </h3>


                    <p>
                        <span>
                            Total Bookings
                        </span>

                        <span>
                            ${userBookings.length}
                        </span>
                    </p>


                    <p>
                        <span>
                            Pending
                        </span>

                        <span>
                            ${pendingCount}
                        </span>
                    </p>


                    <p>
                        <span>
                            Assigned
                        </span>

                        <span>
                            ${assignedCount}
                        </span>
                    </p>


                    <p>
                        <span>
                            In Progress
                        </span>

                        <span>
                            ${progressCount}
                        </span>
                    </p>


                    <p>
                        <span>
                            Completed
                        </span>

                        <span>
                            ${completedCount}
                        </span>
                    </p>

                </div>

            </div>

        `;


        document.getElementById(
            "userModal"
        ).style.display =
            "flex";


    } catch (error) {

        console.log(error);

    }

}


// ================================
// View Booking / Service Details
// ================================

function viewBookingDetails(
    bookingId
) {

    const booking =
        window.allBookings.find(
            b =>
                b.id === bookingId
        );


    if (!booking) {

   showAppToast(
    "error",
    "Booking Not Found"
);

        return;

    }


    const status =
        booking.status ||
        "Pending";


    const statusClass =
        status
            .toLowerCase()
            .replace(/\s+/g, "-");


    const fee =
        booking.serviceCharge ??
        booking.visitingFee ??
        booking.serviceFee ??
        booking.fee ??
        0;


    const details =
        document.getElementById(
            "bookingDetails"
        );


    if (!details) {

        showAppToast(
    "error",
    "Booking Details modal is missing."
);

        return;

    }


    details.innerHTML = `

        <div class="booking-details-layout">

            <div
                class="booking-detail-section"
            >

                <h3>
                    🔧 Service Information
                </h3>


                <p>
                    <strong>
                        Service:
                    </strong>

                    ${booking.service || "-"}
                </p>


                <p>
                    <strong>
                        Issue:
                    </strong>

                    ${booking.issue || "-"}
                </p>


                <p>
                    <strong>
                        Booking ID:
                    </strong>

                    ${booking.id || "-"}
                </p>


                <p>
                    <strong>
                        Date:
                    </strong>

                    ${booking.bookingDate || "-"}
                </p>


                <p>
                    <strong>
                        Time:
                    </strong>

                    ${booking.bookingTime || "-"}
                </p>


                <p>
                    <strong>
                        Visiting Fee:
                    </strong>

                    ₹${fee}
                </p>

            </div>


            <div
                class="booking-detail-section"
            >

                <h3>
                    📊 Service Status
                </h3>


                <p>

                    <strong>
                        Status:
                    </strong>

                    <span
                        class="booking-status ${statusClass}"
                    >
                        ${status}
                    </span>

                </p>


                <p>

                    <strong>
                        Technician:
                    </strong>

                    ${
                        booking.technician ||
                        "Not Assigned"
                    }

                </p>

            </div>


            <div
                class="booking-detail-section"
            >

                <h3>
                    👤 Customer Details
                </h3>


                <p>

                    <strong>
                        Name:
                    </strong>

                    ${
                        booking.customerName ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        Phone:
                    </strong>

                    ${
                        booking.customerPhone ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        Email:
                    </strong>

                    ${
                        booking.customerEmail ||
                        "-"
                    }

                </p>

            </div>


            <div
                class="booking-detail-section"
            >

                <h3>
                    📍 Service Address
                </h3>


                <p>

                    <strong>
                        Location:
                    </strong>

                    ${
                        booking.location ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        City:
                    </strong>

                    ${
                        booking.city ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        State:
                    </strong>

                    ${
                        booking.state ||
                        "-"
                    }

                </p>


                <p>

                    <strong>
                        Pincode:
                    </strong>

                    ${
                        booking.pincode ||
                        "-"
                    }

                </p>

            </div>


            ${
                booking.technician
                ?
                `

                <div
                    class="booking-detail-section"
                >

                    <h3>
                        👨‍🔧 Assigned Technician
                    </h3>


                    <p>

                        <strong>
                            Name:
                        </strong>

                        ${booking.technician}

                    </p>

                </div>

                `
                :
                ""
            }


            ${
                booking.status ===
                "Completed"
                ?
                `

                <div
                    class="booking-detail-section"
                >

                    <h3>
                        ⭐ Customer Review
                    </h3>


                    ${
                        booking.reviewSubmitted
                        ?
                        `

                        <p>

                            <strong>
                                Rating:
                            </strong>

                            ⭐
                            ${
                                booking.userRating ||
                                0
                            }/5

                        </p>


                        <p>

                            <strong>
                                Feedback:
                            </strong>

                            ${
                                booking.review ||
                                "No written feedback provided."
                            }

                        </p>

                        `
                        :
                        `

                        <p>
                            Customer has not submitted
                            a review yet.
                        </p>

                        `
                    }

                </div>

                `
                :
                ""
            }


            ${
                booking.status ===
                "Cancelled"
                ?
                `

                <div
                    class="booking-detail-section cancelled-detail"
                >

                    <h3>
                        ❌ Service Cancelled
                    </h3>


                    <p>
                        This booking was cancelled
                        by the customer.
                    </p>

                </div>

                `
                :
                ""
            }

        </div>

    `;


    const modal =
        document.getElementById(
            "bookingModal"
        );


    if (modal) {

        modal.style.display =
            "flex";

    }

}


// ================================
// Close User Modal
// ================================

document
    .getElementById(
        "closeUserModal"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "userModal"
            ).style.display =
                "none";

        }
    );


window.addEventListener(
    "click",
    (e) => {

        const modal =
            document.getElementById(
                "userModal"
            );


        if (
            e.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ================================
// Close Technician Modal
// ================================

document
    .getElementById(
        "closeTechModal"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "technicianModal"
            ).style.display =
                "none";

        }
    );


window.addEventListener(
    "click",
    (e) => {

        const modal =
            document.getElementById(
                "technicianModal"
            );


        if (
            e.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ================================
// Close Booking Modal
// ================================

const closeBookingModal =
    document.getElementById(
        "closeBookingModal"
    );


if (closeBookingModal) {

    closeBookingModal.addEventListener(
        "click",
        () => {

            document.getElementById(
                "bookingModal"
            ).style.display =
                "none";

        }
    );

}


window.addEventListener(
    "click",
    (e) => {

        const modal =
            document.getElementById(
                "bookingModal"
            );


        if (
            modal &&
            e.target === modal
        ) {

            modal.style.display =
                "none";

        }

    }
);


// ================================
// Analytics Card Functions
// ================================

function showAvailableTechnicians() {

    showSection(
        "techniciansSection"
    );


    loadTechnicians();


    setTimeout(
        () => {

            document
                .querySelectorAll(
                    ".tech-card"
                )
                .forEach(
                    card => {

                        if (
                            !card.innerText.includes(
                                "Available"
                            )
                        ) {

                            card.style.display =
                                "none";

                        }

                        else {

                            card.style.display =
                                "block";

                        }

                    }
                );

        },
        200
    );

}


function showOfflineTechnicians() {

    showSection(
        "techniciansSection"
    );


    loadTechnicians();


    setTimeout(
        () => {

            document
                .querySelectorAll(
                    ".tech-card"
                )
                .forEach(
                    card => {

                        if (
                            !card.innerText.includes(
                                "Offline"
                            )
                        ) {

                            card.style.display =
                                "none";

                        }

                        else {

                            card.style.display =
                                "block";

                        }

                    }
                );

        },
        200
    );

}


function showCompletedBookings() {

    showSection(
        "bookingsSection"
    );


    document
        .querySelectorAll(
            ".booking-card"
        )
        .forEach(
            card => {

                if (
                    !card.innerText.includes(
                        "Completed"
                    )
                ) {

                    card.style.display =
                        "none";

                }

                else {

                    card.style.display =
                        "block";

                }

            }
        );

}


function showPendingBookings() {

    showSection(
        "bookingsSection"
    );


    document
        .querySelectorAll(
            ".booking-card"
        )
        .forEach(
            card => {

                if (
                    !card.innerText.includes(
                        "Pending"
                    )
                ) {

                    card.style.display =
                        "none";

                }

                else {

                    card.style.display =
                        "block";

                }

            }
        );

}


// ================================
// Search
// ================================

const searchInput =
    document.getElementById(
        "adminSearch"
    );


if (searchInput) {

    searchInput.addEventListener(
        "keyup",
        function () {

            const value =
                this.value
                    .toLowerCase()
                    .trim();


            const results =
                document.getElementById(
                    "searchResults"
                );


            if (!value) {

                results.innerHTML =
                    "";

                return;

            }


            let html = "";


            // ================================
            // Users
            // ================================

            window.allUsers.forEach(
                user => {

                    if (
                        (user.name || "")
                            .toLowerCase()
                            .includes(value)
                    ) {

                        html += `

                        <div
                            class="search-item"
                            onclick="
                                viewUser('${user.id}');
                                document.getElementById('searchResults').innerHTML='';
                            "
                        >

                            👤 ${user.name}

                        </div>

                        `;

                    }

                }
            );


            // ================================
            // Technicians
            // ================================

            window.allTechnicians.forEach(
                tech => {

                    if (
                        (tech.name || "")
                            .toLowerCase()
                            .includes(value)
                    ) {

                        html += `

                        <div
                            class="search-item"
                            onclick="
                                viewTechnician('${tech.id}');
                                document.getElementById('searchResults').innerHTML='';
                            "
                        >

                            👨‍🔧 ${tech.name}

                        </div>

                        `;

                    }

                }
            );


            // ================================
            // Bookings
            // ================================

            window.allBookings.forEach(
                booking => {

                    if (
                        (booking.service || "")
                            .toLowerCase()
                            .includes(value)
                    ) {

                        html += `

                        <div
                            class="search-item"
                            onclick="
                                showSection('bookingsSection');
                                viewBookingDetails('${booking.id}');
                                document.getElementById('searchResults').innerHTML='';
                            "
                        >

                            📅 ${booking.service}

                        </div>

                        `;

                    }

                }
            );


            results.innerHTML =
                html;

        }
    );

}


// ================================
// Close Search Results
// ================================

document.addEventListener(
    "click",
    function (e) {

        if (
            !e.target.closest(
                ".search-section"
            )
        ) {

            document.getElementById(
                "searchResults"
            ).innerHTML =
                "";

        }

    }
);


// ================================
// Booking Filters
// ================================

function filterBookings(
    status
) {

    const cards =
        document.querySelectorAll(
            ".booking-card"
        );


    cards.forEach(
        card => {

            if (
                status === "All"
            ) {

                card.style.display =
                    "block";

                return;

            }


            if (
                card.innerText.includes(
                    status
                )
            ) {

                card.style.display =
                    "block";

            }

            else {

                card.style.display =
                    "none";

            }

        }
    );

}


// ================================
// Initial Load
// ================================

Promise.all([
    loadAdminData(),
    loadTechnicians(),
    loadUsers()
]);