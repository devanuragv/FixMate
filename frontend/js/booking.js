/* =========================================
   FIXMATE BOOKING
========================================= */

/* =========================================
   FIXMATE APP POPUP
========================================= */

function showBookingPopup(type, message) {

    let popup = document.getElementById("bookingPopup");

    if (!popup) {

        popup = document.createElement("div");

        popup.id = "bookingPopup";

        popup.innerHTML = `
            <div class="booking-popup-icon"></div>
            <div class="booking-popup-message"></div>
        `;

        document.body.appendChild(popup);

        const style = document.createElement("style");

        style.textContent = `
            #bookingPopup {
                position: fixed;
                top: 25px;
                right: 25px;
                min-width: 300px;
                max-width: 420px;
                padding: 16px 20px;
                background: #111116;
                border: 1px solid #282830;
                border-left: 4px solid #ff7100;
                border-radius: 14px;
                color: #ffffff;
                font-family: 'Poppins', sans-serif;
                display: flex;
                align-items: center;
                gap: 12px;
                box-shadow:
                    0 10px 35px rgba(0,0,0,0.45),
                    0 0 20px rgba(255,113,0,0.15);
                z-index: 99999;
                opacity: 0;
                transform: translateX(120%);
                transition: all 0.35s ease;
            }

            #bookingPopup.show {
                opacity: 1;
                transform: translateX(0);
            }

            #bookingPopup.success {
                border-left-color: #00d084;
            }

            #bookingPopup.error {
                border-left-color: #ff4d4d;
            }

            .booking-popup-icon {
                width: 32px;
                height: 32px;
                min-width: 32px;
                border-radius: 50%;
                background: #ff7100;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 17px;
                font-weight: 700;
            }

            #bookingPopup.success .booking-popup-icon {
                background: #00d084;
            }

            #bookingPopup.error .booking-popup-icon {
                background: #ff4d4d;
            }

            .booking-popup-message {
                font-size: 14px;
                line-height: 1.5;
            }

            @media (max-width: 600px) {
                #bookingPopup {
                    left: 15px;
                    right: 15px;
                    top: 15px;
                    min-width: auto;
                }
            }
        `;

        document.head.appendChild(style);
    }

    const icon =
        popup.querySelector(".booking-popup-icon");

    const messageBox =
        popup.querySelector(".booking-popup-message");

    popup.className = "";
    popup.classList.add(type);

    icon.textContent =
        type === "success" ? "✓" : "!";

    messageBox.textContent = message;

    requestAnimationFrame(() => {
        popup.classList.add("show");
    });

    setTimeout(() => {
        popup.classList.remove("show");
    }, 3500);
}


/* =========================================
   AUTHENTICATION
========================================= */

const token =
    localStorage.getItem("fixmateToken");

if (!token) {
    window.location.href = "login.html";
}


/* =========================================
   AUTO-FILL CUSTOMER DETAILS
========================================= */

async function loadCustomerDetails() {

    try {

        const response = await fetch(
            "/api/users/profile",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            console.log(
                "Unable to load customer profile"
            );

            return;
        }

        const data =
            await response.json();

        const user =
            data.user ||
            data.data ||
            data;


        const nameInput =
            document.getElementById(
                "customerName"
            );

        const phoneInput =
            document.getElementById(
                "customerPhone"
            );

        const emailInput =
            document.getElementById(
                "customerEmail"
            );


        if (nameInput && user.name) {
            nameInput.value = user.name;
        }

        if (phoneInput && user.phone) {
            phoneInput.value = user.phone;
        }

        if (emailInput && user.email) {
            emailInput.value = user.email;
        }

    } catch (error) {

        console.error(
            "Customer profile loading error:",
            error
        );

    }
}


/* Load customer information */
loadCustomerDetails();


/* =========================================
   MODERN DATE & TIME PICKERS
========================================= */

const bookingDate =
    document.getElementById("bookingDate");

const bookingTime =
    document.getElementById("bookingTime");


/* =========================================
   GET CURRENT DATE & TIME
========================================= */

const now = new Date();

const today =
    `${now.getFullYear()}-${String(
        now.getMonth() + 1
    ).padStart(2, "0")}-${String(
        now.getDate()
    ).padStart(2, "0")}`;

const currentHours =
    now.getHours();

const currentMinutes =
    now.getMinutes();


/* =========================================
   DATE PICKER
========================================= */

if (
    bookingDate &&
    typeof flatpickr !== "undefined"
) {

    flatpickr(bookingDate, {

        dateFormat: "Y-m-d",

        altInput: true,

        altFormat: "d M Y",

        altInputClass:
            "booking-picker-input",

        disableMobile: true,

        position: "above",

        animate: true,

        /* Prevent past dates */
        minDate: "today",

        onChange: function(
            selectedDates,
            dateStr
        ) {

            /*
             * If today is selected,
             * update time picker so past
             * times cannot be selected.
             */

            if (
                bookingTime &&
                bookingTime._flatpickr
            ) {

                if (dateStr === today) {

                    const selectedTime =
                        new Date();

                    selectedTime.setHours(
                        currentHours,
                        currentMinutes,
                        0,
                        0
                    );

                    bookingTime._flatpickr.set(
                        "minTime",
                        selectedTime
                    );

                } else {

                    /*
                     * Future date:
                     * allow all times.
                     */

                    bookingTime._flatpickr.set(
                        "minTime",
                        null
                    );

                }

            }

        }

    });

}


/* =========================================
   TIME PICKER
========================================= */

if (
    bookingTime &&
    typeof flatpickr !== "undefined"
) {

    flatpickr(bookingTime, {

        enableTime: true,

        noCalendar: true,

        dateFormat: "H:i",

        altInput: true,

        altFormat: "h:i K",

        altInputClass:
            "booking-picker-input",

        time_24hr: false,

        minuteIncrement: 15,

        disableMobile: true,

        position: "above",

        animate: true,

        /*
         * Initially don't allow times
         * before the current time.
         *
         * This protects today's booking.
         */

        minTime:
            `${String(currentHours).padStart(2, "0")}:${String(currentMinutes).padStart(2, "0")}`

    });

}

/* =========================================
   SERVICE SELECTION
========================================= */

const serviceInput =
    document.getElementById(
        "service"
    );

const cards =
    document.querySelectorAll(
        ".service-card"
    );


cards.forEach(card => {

    card.addEventListener(
        "click",
        () => {

            cards.forEach(c =>
                c.classList.remove(
                    "active"
                )
            );

            card.classList.add(
                "active"
            );

            serviceInput.value =
                card.dataset.service;

        }
    );

});


/* =========================================
   DETECT CUSTOMER LOCATION
========================================= */

const detectLocationBtn =
    document.getElementById(
        "detectLocationBtn"
    );

const detectLocationText =
    document.getElementById(
        "detectLocationText"
    );

const locationStatus =
    document.getElementById(
        "locationStatus"
    );


if (detectLocationBtn) {

    detectLocationBtn.addEventListener(
        "click",
        detectCustomerLocation
    );

}


/* =========================================
   LOCATION DETECTION FUNCTION
========================================= */

function detectCustomerLocation() {

    if (!navigator.geolocation) {

        showLocationStatus(
            "error",
            "Location detection is not supported by this browser."
        );

        return;
    }


    /* Prevent multiple clicks */

    detectLocationBtn.disabled = true;

    detectLocationText.textContent =
        "Detecting Location...";


    showLocationStatus(
        "",
        "Please allow location access when your browser asks."
    );


    /* =====================================
       GET CURRENT LOCATION
    ===================================== */

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            console.log(
                "Detected coordinates:",
                latitude,
                longitude
            );


            try {

                showLocationStatus(
                    "",
                    "Getting your address..."
                );


                /* =================================
                   REVERSE GEOCODING
                ================================= */

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                        {
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        "Unable to find address."
                    );

                }


                const data =
                    await response.json();


                const address =
                    data.address || {};


                console.log(
                    "Detected address:",
                    address
                );


                /* =================================
                   CITY
                ================================= */

                const city =
                    address.city ||
                    address.town ||
                    address.municipality ||
                    address.village ||
                    address.suburb ||
                    "";


                document.getElementById(
                    "city"
                ).value = city;


                /* =================================
                   STATE
                ================================= */

                document.getElementById(
                    "state"
                ).value =
                    address.state || "";


                /* =================================
                   PINCODE
                ================================= */

                document.getElementById(
                    "pincode"
                ).value =
                    address.postcode || "";


                /* =================================
                   ADDRESS
                ================================= */

                const addressParts = [

                    address.house_number,

                    address.road,

                    address.neighbourhood,

                    address.suburb

                ].filter(Boolean);


                let locationText =
                    addressParts.join(", ");


                /* =================================
                   FALLBACK ADDRESS
                ================================= */

                if (!locationText) {

                    locationText =
                        data.display_name || "";

                }


                document.getElementById(
                    "location"
                ).value =
                    locationText;


                /* =================================
                   SUCCESS
                ================================= */

                detectLocationText.textContent =
                    "Location Detected ✓";


                /*
                   Keep the status element empty.
                   This removes the green success line.
                */

                showLocationStatus(
                    "success",
                    ""
                );


            } catch (error) {

                console.error(
                    "Reverse geocoding error:",
                    error
                );


                showLocationStatus(
                    "error",
                    "Couldn't find your address. Please enter it manually."
                );


                detectLocationText.textContent =
                    "Detect My Location";

            } finally {

                detectLocationBtn.disabled =
                    false;

            }

        },


        /* =====================================
           LOCATION ERROR
        ===================================== */

        (error) => {

            console.error(
                "Geolocation error:",
                error
            );


            let message =
                "Unable to detect your location.";


            /* Permission denied */

            if (error.code === 1) {

                message =
                    "Location permission was denied. Please allow location access.";

            }


            /* Location unavailable */

            else if (error.code === 2) {

                message =
                    "Your location could not be determined. Please try again.";

            }


            /* Timeout */

            else if (error.code === 3) {

                message =
                    "Location request timed out. Please try again.";

            }


            showLocationStatus(
                "error",
                message
            );


            detectLocationText.textContent =
                "Detect My Location";


            detectLocationBtn.disabled =
                false;

        },


        /* =====================================
           GEOLOCATION OPTIONS
        ===================================== */

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }

    );

}


/* =========================================
   LOCATION STATUS
========================================= */

function showLocationStatus(
    type,
    message
) {

    if (!locationStatus) {
        return;
    }


    locationStatus.className =
        "location-status";


    if (type) {

        locationStatus.classList.add(
            type
        );

    }


    locationStatus.textContent =
        message;

}


/* =========================================
   BOOKING FORM
========================================= */

document
    .getElementById("bookingForm")
    .addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            /* =================================
               GET FORM VALUES
            ================================= */

            const service =
                document.getElementById(
                    "service"
                ).value;


            const customerName =
                document.getElementById(
                    "customerName"
                ).value;


            const customerPhone =
                document.getElementById(
                    "customerPhone"
                ).value;


            const customerEmail =
                document.getElementById(
                    "customerEmail"
                ).value;


            const city =
                document.getElementById(
                    "city"
                ).value;


            const state =
                document.getElementById(
                    "state"
                ).value;


            const pincode =
                document.getElementById(
                    "pincode"
                ).value;


            const issue =
                document.getElementById(
                    "issue"
                ).value;


            /* =================================
               HOUSE / FLAT / OFFICE
            ================================= */

            const houseNumber =
                document.getElementById(
                    "houseNumber"
                ).value.trim();


            /* =================================
               DETECTED ADDRESS
            ================================= */

            const detectedLocation =
                document.getElementById(
                    "location"
                ).value.trim();


            /* =================================
               FINAL LOCATION
            ================================= */

            const location =
                houseNumber && detectedLocation
                    ? `${houseNumber}, ${detectedLocation}`
                    : houseNumber ||
                      detectedLocation;


            /* =================================
               DATE
            ================================= */

            const bookingDate =
                document.getElementById(
                    "bookingDate"
                ).value;


            /* =================================
               TIME
            ================================= */

            const bookingTime =
                document.getElementById(
                    "bookingTime"
                ).value;


            /* =================================
               BACKEND CONNECTION
               KEEPING YOUR EXISTING API
            ================================= */

            try {

                const response =
                    await fetch(
                        "/api/bookings/create",
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

                                    customerName,

                                    customerPhone,

                                    customerEmail,

                                    service,

                                    issue,

                                    city,

                                    state,

                                    pincode,

                                    location,

                                    bookingDate,

                                    bookingTime

                                })

                        }
                    );


                /* =================================
                   SERVER RESPONSE
                ================================= */

                const data =
                    await response.json();


                /* =================================
                   SUCCESS
                ================================= */

                if (data.success) {

                    showBookingPopup(
                        "success",
                        "Booking Created Successfully"
                    );


                    setTimeout(() => {

                        window.location.href =
                            "history.html";

                    }, 1200);


                } else {

                    showBookingPopup(
                        "error",
                        data.message ||
                        "Booking failed. Please try again."
                    );

                }


            } catch (error) {

                console.log(
                    "Booking error:",
                    error
                );


                showBookingPopup(
                    "error",
                    "Something went wrong. Please try again."
                );

            }

        }
    );