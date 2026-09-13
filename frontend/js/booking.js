/* =========================================
   FIXMATE BOOKING
========================================= */

const API_URL = "http://localhost:5000/api";


/* =========================================
   SERVICE CHARGES
========================================= */

const SERVICE_CHARGES = {
    Painter: 500,
    Electrician: 400,
    Plumber: 350,
    Carpenter: 450,
    "AC Repair": 800,
    "Appliance Repair": 550,
    Cleaner: 300,
    Mechanic: 600,
    "Pest Control": 650
};


/* =========================================
   SERVICE-SPECIFIC ISSUES
========================================= */

const SERVICE_ISSUES = {

    Electrician: [
        "Fan not working",
        "Light not working",
        "Switch / socket problem",
        "Wiring issue",
        "MCB keeps tripping",
        "Power fluctuation",
        "Other"
    ],

    Plumber: [
        "Tap leaking",
        "Pipe leakage",
        "Drain blockage",
        "Low water pressure",
        "Water tank problem",
        "Bathroom fitting issue",
        "Other"
    ],

    "AC Repair": [
        "AC not cooling",
        "AC not turning on",
        "Water leaking from AC",
        "AC making noise",
        "Bad smell from AC",
        "Remote / control problem",
        "Other"
    ],

    Carpenter: [
        "Furniture repair",
        "Door repair",
        "Window repair",
        "Cabinet / cupboard issue",
        "Bed / table repair",
        "Woodwork installation",
        "Other"
    ],

    Painter: [
        "Wall painting",
        "Room painting",
        "Ceiling painting",
        "Door / window painting",
        "Wall touch-up",
        "Water / dampness marks",
        "Other"
    ],

    "Appliance Repair": [
        "Washing machine problem",
        "Refrigerator problem",
        "Microwave problem",
        "TV problem",
        "Cooler problem",
        "Other appliance issue",
        "Other"
    ],

    Cleaner: [
        "Home deep cleaning",
        "Bathroom cleaning",
        "Kitchen cleaning",
        "Sofa cleaning",
        "Floor cleaning",
        "Full house cleaning",
        "Other"
    ],

    Mechanic: [
        "Engine problem",
        "Battery problem",
        "Brake problem",
        "Tyre / puncture issue",
        "Oil / servicing",
        "Starting problem",
        "Other"
    ],

    "Pest Control": [
        "Cockroach problem",
        "Ant infestation",
        "Mosquito problem",
        "Termite problem",
        "Rodent problem",
        "Bed bug problem",
        "Other"
    ]
};


/* =========================================
   FIXMATE APP POPUP
========================================= */

function showBookingPopup(type, message) {

    let popup =
        document.getElementById("bookingPopup");

    if (!popup) {

        popup =
            document.createElement("div");

        popup.id = "bookingPopup";

        popup.innerHTML = `
            <div class="booking-popup-icon"></div>
            <div class="booking-popup-message"></div>
        `;

        document.body.appendChild(popup);

        const style =
            document.createElement("style");

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
        popup.querySelector(
            ".booking-popup-icon"
        );

    const messageBox =
        popup.querySelector(
            ".booking-popup-message"
        );

    popup.className = "";

    popup.classList.add(type);

    icon.textContent =
        type === "success" ? "✓" : "!";

    messageBox.textContent =
        message;

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
    localStorage.getItem(
        "fixmateToken"
    );

if (!token) {

    window.location.href =
        "login.html";
}


/* =========================================
   AUTO-FILL CUSTOMER DETAILS
========================================= */

async function loadCustomerDetails() {

    try {

        const response =
            await fetch(
                `${API_URL}/users/profile`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
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


        if (
            nameInput &&
            user.name
        ) {

            nameInput.value =
                user.name;
        }


        if (
            phoneInput &&
            user.phone
        ) {

            phoneInput.value =
                user.phone;
        }


        if (
            emailInput &&
            user.email
        ) {

            emailInput.value =
                user.email;
        }

    }
    catch (error) {

        console.error(
            "Customer profile loading error:",
            error
        );

    }
}


/* Load customer information */

loadCustomerDetails();


/* =========================================
   DATE & TIME PICKERS
========================================= */

const bookingDate =
    document.getElementById(
        "bookingDate"
    );

const bookingTime =
    document.getElementById(
        "bookingTime"
    );


/* =========================================
   GET CURRENT DATE & TIME
========================================= */

const now =
    new Date();

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
   NEXT 15-MINUTE BOOKING SLOT
========================================= */

const nextBookingSlot =
    new Date(now);

nextBookingSlot.setSeconds(
    0,
    0
);

nextBookingSlot.setMinutes(
    Math.ceil(
        nextBookingSlot.getMinutes() / 15
    ) * 15
);

const nextSlotHours =
    nextBookingSlot.getHours();

const nextSlotMinutes =
    nextBookingSlot.getMinutes();

const nextSlotTime =
    `${String(nextSlotHours).padStart(2, "0")}:${String(
        nextSlotMinutes
    ).padStart(2, "0")}`;


/* =========================================
   DATE PICKER
========================================= */

if (
    bookingDate &&
    typeof flatpickr !== "undefined"
) {

    flatpickr(
        bookingDate,
        {

            dateFormat:
                "Y-m-d",

            altInput:
                true,

            altFormat:
                "d M Y",

            altInputClass:
                "booking-picker-input",

            disableMobile:
                true,

            position:
                "above",

            animate:
                true,

            minDate:
                "today",

            onChange:
                function(
                    selectedDates,
                    dateStr
                ) {

                    if (
                        bookingTime &&
                        bookingTime._flatpickr
                    ) {

                        if (
                            dateStr ===
                            today
                        ) {

                            const selectedTime =
                                new Date();

                            selectedTime.setHours(
                                nextSlotHours,
                                nextSlotMinutes,
                                0,
                                0
                            );

                            bookingTime._flatpickr.set(
                                "minTime",
                                selectedTime
                            );

                        }

                        else {

                            bookingTime._flatpickr.set(
                                "minTime",
                                null
                            );

                        }

                    }

                }

        }
    );

}


/* =========================================
   TIME PICKER
========================================= */

if (
    bookingTime &&
    typeof flatpickr !== "undefined"
) {

    flatpickr(
        bookingTime,
        {

            enableTime:
                true,

            noCalendar:
                true,

            dateFormat:
                "H:i",

            altInput:
                true,

            altFormat:
                "h:i K",

            altInputClass:
                "booking-picker-input",

            time_24hr:
                false,

            minuteIncrement:
                15,

            disableMobile:
                true,

            position:
                "above",

            animate:
                true,

            minTime:
                nextSlotTime

        }
    );

}


/* =========================================
   SERVICE + ISSUE SELECTION
========================================= */

const serviceInput =
    document.getElementById(
        "service"
    );

const cards =
    document.querySelectorAll(
        ".service-card"
    );

const issueSelect =
    document.getElementById(
        "issue"
    );

const customIssueWrapper =
    document.getElementById(
        "customIssueWrapper"
    );

const customIssueInput =
    document.getElementById(
        "customIssue"
    );


/* =========================================
   POPULATE SERVICE-SPECIFIC ISSUES
========================================= */

function populateIssueOptions(service) {

    if (!issueSelect) {
        return;
    }


    /* Clear old options */

    issueSelect.innerHTML =
        "";


    /* Default option */

    const defaultOption =
        document.createElement(
            "option"
        );

    defaultOption.value =
        "";

    defaultOption.textContent =
        "Select your issue";

    defaultOption.disabled =
        true;

    defaultOption.selected =
        true;

    issueSelect.appendChild(
        defaultOption
    );


    /* Get service issues */

    const issues =
        SERVICE_ISSUES[service] ||
        [];


    /* Add options */

    issues.forEach(
        issue => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                issue;

            option.textContent =
                issue;

            issueSelect.appendChild(
                option
            );

        }
    );


    /* Reset custom issue */

    if (
        customIssueWrapper
    ) {

        customIssueWrapper.style.display =
            "none";

    }


    if (
        customIssueInput
    ) {

        customIssueInput.value =
            "";

        customIssueInput.required =
            false;

    }

}


/* =========================================
   HANDLE ISSUE DROPDOWN
========================================= */

if (issueSelect) {

    issueSelect.addEventListener(
        "change",
        () => {

            if (
                issueSelect.value ===
                "Other"
            ) {

                if (
                    customIssueWrapper
                ) {

                    customIssueWrapper.style.display =
                        "block";

                }


                if (
                    customIssueInput
                ) {

                    customIssueInput.required =
                        true;

                    customIssueInput.focus();

                }

            }

            else {

                if (
                    customIssueWrapper
                ) {

                    customIssueWrapper.style.display =
                        "none";

                }


                if (
                    customIssueInput
                ) {

                    customIssueInput.required =
                        false;

                    customIssueInput.value =
                        "";

                }

            }

        }
    );

}


/* =========================================
   SERVICE CARD CLICK
========================================= */

cards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {


                /* Remove old active */

                cards.forEach(
                    c => {

                        c.classList.remove(
                            "active"
                        );

                    }
                );


                /* Add active */

                card.classList.add(
                    "active"
                );


                /* Selected service */

                const selectedService =
                    card.dataset.service;


                /* Put service into input */

                if (
                    serviceInput
                ) {

                    serviceInput.value =
                        selectedService;

                }


                /* =================================
                   TECHNICIAN VISITING FEE
                ================================= */

                const visitingFee =
                    document.getElementById(
                        "visitingFee"
                    );

                const serviceFee =
                    document.getElementById(
                        "serviceFee"
                    );

                const fee =
                    SERVICE_CHARGES[
                        selectedService
                    ];


                if (
                    visitingFee &&
                    serviceFee &&
                    fee !== undefined
                ) {

                    serviceFee.textContent =
                        `₹${fee}`;

                    visitingFee.style.display =
                        "flex";

                }

                else if (
                    visitingFee
                ) {

                    visitingFee.style.display =
                        "none";

                }


                /* =================================
                   LOAD SERVICE-SPECIFIC ISSUES
                ================================= */

                populateIssueOptions(
                    selectedService
                );

            }
        );

    }
);


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


if (
    detectLocationBtn
) {

    detectLocationBtn.addEventListener(
        "click",
        detectCustomerLocation
    );

}


/* =========================================
   LOCATION DETECTION FUNCTION
========================================= */

function detectCustomerLocation() {

    if (
        !navigator.geolocation
    ) {

        showLocationStatus(
            "error",
            "Location detection is not supported by this browser."
        );

        return;
    }


    /* Prevent multiple clicks */

    detectLocationBtn.disabled =
        true;

    detectLocationText.textContent =
        "Detecting Location...";


    showLocationStatus(
        "",
        "Please allow location access when your browser asks."
    );


    navigator.geolocation.getCurrentPosition(

        async (
            position
        ) => {

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
                                Accept:
                                    "application/json"
                            }
                        }
                    );


                if (
                    !response.ok
                ) {

                    throw new Error(
                        "Unable to find address."
                    );

                }


                const data =
                    await response.json();

                const address =
                    data.address ||
                    {};


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


                const cityInput =
                    document.getElementById(
                        "city"
                    );

                if (cityInput) {

                    cityInput.value =
                        city;

                }


                /* =================================
                   STATE
                ================================= */

                const stateInput =
                    document.getElementById(
                        "state"
                    );

                if (stateInput) {

                    stateInput.value =
                        address.state ||
                        "";

                }


                /* =================================
                   PINCODE
                ================================= */

                const pincodeInput =
                    document.getElementById(
                        "pincode"
                    );

                if (pincodeInput) {

                    pincodeInput.value =
                        address.postcode ||
                        "";

                }


                /* =================================
                   ADDRESS
                ================================= */

                const addressParts = [

                    address.house_number,

                    address.road,

                    address.neighbourhood,

                    address.suburb

                ].filter(
                    Boolean
                );


                let locationText =
                    addressParts.join(
                        ", "
                    );


                /* =================================
                   FALLBACK ADDRESS
                ================================= */

                if (
                    !locationText
                ) {

                    locationText =
                        data.display_name ||
                        "";

                }


                const locationInput =
                    document.getElementById(
                        "location"
                    );

                if (locationInput) {

                    locationInput.value =
                        locationText;

                }


                /* =================================
                   SUCCESS
                ================================= */

                detectLocationText.textContent =
                    "Location Detected ✓";


                showLocationStatus(
                    "success",
                    ""
                );


            }
            catch (error) {

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

            }
            finally {

                detectLocationBtn.disabled =
                    false;

            }

        },


        /* =====================================
           LOCATION ERROR
        ===================================== */

        error => {

            console.error(
                "Geolocation error:",
                error
            );


            let message =
                "Unable to detect your location.";


            if (
                error.code === 1
            ) {

                message =
                    "Location permission was denied. Please allow location access.";

            }

            else if (
                error.code === 2
            ) {

                message =
                    "Your location could not be determined. Please try again.";

            }

            else if (
                error.code === 3
            ) {

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
            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                0
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

    if (
        !locationStatus
    ) {

        return;
    }


    locationStatus.className =
        "location-status";


    if (
        type
    ) {

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

const bookingForm =
    document.getElementById(
        "bookingForm"
    );


if (bookingForm) {

    bookingForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            /* =================================
               GET SERVICE
            ================================= */

            const service =
                document.getElementById(
                    "service"
                ).value.trim();


            /* =================================
               SERVICE VALIDATION
            ================================= */

            if (!service) {

                showBookingPopup(
                    "error",
                    "Please select a service first."
                );

                return;
            }


            /* =================================
               CUSTOMER NAME
            ================================= */

            const customerName =
                document.getElementById(
                    "customerName"
                ).value.trim();


            /* =================================
               CUSTOMER PHONE
            ================================= */

            const customerPhone =
                document.getElementById(
                    "customerPhone"
                ).value.trim();


            /* =================================
               CUSTOMER EMAIL
            ================================= */

            const customerEmail =
                document.getElementById(
                    "customerEmail"
                ).value.trim();


            /* =================================
               CITY
            ================================= */

            const city =
                document.getElementById(
                    "city"
                ).value.trim();


            /* =================================
               STATE
            ================================= */

            const state =
                document.getElementById(
                    "state"
                ).value.trim();


            /* =================================
               PINCODE
            ================================= */

            const pincode =
                document.getElementById(
                    "pincode"
                ).value.trim();


            /* =================================
               ISSUE
            ================================= */

            let issue =
                document.getElementById(
                    "issue"
                ).value.trim();


            /* =================================
               CUSTOM ISSUE
               IF "OTHER" IS SELECTED
            ================================= */

            if (
                issue === "Other"
            ) {

                issue =
                    document.getElementById(
                        "customIssue"
                    )?.value.trim() ||
                    "";

            }


            /* =================================
               ISSUE VALIDATION
            ================================= */

            if (!issue) {

                showBookingPopup(
                    "error",
                    "Please select or describe your issue."
                );

                return;
            }


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
                houseNumber &&
                detectedLocation

                    ? `${houseNumber}, ${detectedLocation}`

                    : houseNumber ||
                      detectedLocation;


            /* =================================
               BOOKING DATE
            ================================= */

            const selectedBookingDate =
                document.getElementById(
                    "bookingDate"
                ).value;


            /* =================================
               BOOKING TIME
            ================================= */

            const selectedBookingTime =
                document.getElementById(
                    "bookingTime"
                ).value;


            /* =================================
               DATE/TIME VALIDATION
            ================================= */

            if (
                !selectedBookingDate
            ) {

                showBookingPopup(
                    "error",
                    "Please select a booking date."
                );

                return;
            }


            if (
                !selectedBookingTime
            ) {

                showBookingPopup(
                    "error",
                    "Please select a booking time."
                );

                return;
            }


            /* =================================
               PREVENT PAST DATE/TIME
            ================================= */

            const selectedDateTime =
                new Date(
                    `${selectedBookingDate}T${selectedBookingTime}`
                );

            const currentDateTime =
                new Date();


            if (
                selectedDateTime <=
                currentDateTime
            ) {

                showBookingPopup(
                    "error",
                    "Please select a future date and time."
                );

                return;
            }


            /* =================================
               BACKEND CONNECTION
               EXISTING API PRESERVED
            ================================= */

            try {

                const response =
                    await fetch(
                        `${API_URL}/bookings/create`,
                        {
                            method:
                                "POST",

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

                                    bookingDate:
                                        selectedBookingDate,

                                    bookingTime:
                                        selectedBookingTime

                                })

                        }
                    );


                /* =================================
                   SERVER RESPONSE
                ================================= */

                let data;

                try {

                    data =
                        await response.json();

                }
                catch (
                    parseError
                ) {

                    console.error(
                        "Invalid server response:",
                        parseError
                    );

                    showBookingPopup(
                        "error",
                        "Server returned an invalid response."
                    );

                    return;
                }


                /* =================================
                   SUCCESS
                ================================= */

                if (
                    response.ok &&
                    data.success
                ) {

                    showBookingPopup(
                        "success",
                        "Booking Created Successfully"
                    );


                    setTimeout(
                        () => {

                            window.location.href =
                                "history.html";

                        },
                        1200
                    );

                }

                else {

                    showBookingPopup(
                        "error",
                        data.message ||
                        "Booking failed. Please try again."
                    );

                }

            }

            catch (
                error
            ) {

                console.error(
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

}