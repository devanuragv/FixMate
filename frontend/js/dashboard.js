const API_URL = "http://localhost:5000/api";

const token =
    localStorage.getItem("fixmateToken");

if (!token) {

    window.location.href =
        "login.html";

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

        } else {

            console.log(
                "Failed to load profile:",
                data.message
            );

        }

    }
    catch (error) {

        console.log(
            "Profile Error:",
            error
        );

    }

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
                    b =>
                        b.status?.toLowerCase() ===
                        "pending"
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
                    b =>
                        b.status?.toLowerCase() ===
                        "completed"
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
               BOOKING TABLE
            ================================= */

            const bookingTable =
                document.getElementById(
                    "bookingTable"
                );

            if (bookingTable) {

                if (bookings.length === 0) {

                    bookingTable.innerHTML = `
                        <tr>
                            <td
                                colspan="4"
                                style="text-align:center;"
                            >
                                No bookings found
                            </td>
                        </tr>
                    `;

                }
                else {

                    let rows = "";

                    bookings.forEach(
                        booking => {

                            rows += `
                                <tr>

                                    <td>
                                        ${booking.service || "-"}
                                    </td>

                                    <td>
                                        ${booking.issue || "-"}
                                    </td>

                                    <td>
                                        ${booking.bookingDate || "-"}
                                    </td>

                                    <td>
                                        ${booking.status || "-"}
                                    </td>

                                </tr>
                            `;

                        }
                    );

                    bookingTable.innerHTML =
                        rows;

                }

            }

        }
        else {

            console.log(
                "Failed to load bookings:",
                data.message
            );

        }

    }
    catch (error) {

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