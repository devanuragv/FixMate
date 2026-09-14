const API_URL = "/api";

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

// =====================================================
// GET BOOKING CREATED TIME
// =====================================================

function getBookingCreatedTime(booking) {

    if (!booking) {
        return 0;
    }

    const createdAt =
        booking.createdAt;

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
// Authentication Check
// ================================

const token =
localStorage.getItem(
"technicianToken"
);

const technician =
JSON.parse(
localStorage.getItem(
"technician"
)
);

if(
!token ||
!technician
){

window.location.href =
"/technician-login.html";

}

// ================================
// Current Status
// ================================

// ================================
// Current Status
// ================================

let currentStatus =
  technician.status ||
  "Offline";

  async function syncTechnicianStatus() {
    try {
        const response = await fetch(
            `${API_URL}/technician/profile/${technician.id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (response.ok && data.success && data.technician) {
            const latestTechnician = data.technician;

            currentStatus =
                latestTechnician.status || "Offline";

            Object.assign(
                technician,
                latestTechnician
            );

            localStorage.setItem(
                "technician",
                JSON.stringify(technician)
            );

            updateAvailabilityUI();

            return true;
        }

    } catch (error) {
        console.log(
            "Unable to sync technician status:",
            error
        );
    }

    updateAvailabilityUI();
    return false;
}

let locationWatchId = null;

let locationPermissionGranted = false;

let allJobs = [];

let currentFilter =
"All";

// ================================
// Profile
// ================================

document.getElementById(
"techName"
).innerText =
technician.name;

document.getElementById(
"techService"
).innerText =
technician.serviceType;

// ================================
// Availability UI
// ================================

const switchBtn =
  document.getElementById(
    "availabilitySwitch"
  );

const statusText =
  document.getElementById(
    "statusText"
  );


function updateAvailabilityUI() {

  if (
    currentStatus === "Available"
  ) {

    switchBtn.checked = true;

    statusText.innerText =
      "Available";

  }

  else {

    switchBtn.checked = false;

    statusText.innerText =
      "Offline";

  }

}

// =========================================
// TECHNICIAN LOCATION SYSTEM
// =========================================

// -----------------------------------------
// Check browser geolocation support
// -----------------------------------------

function isLocationSupported() {

  return (
    "geolocation" in navigator
  );

}


// -----------------------------------------
// Get current location
// -----------------------------------------

function requestTechnicianLocation() {

  return new Promise(
    (resolve, reject) => {

      if (!isLocationSupported()) {

        reject(
          new Error(
            "Location services are not supported by this browser."
          )
        );

        return;
      }


      navigator.geolocation.getCurrentPosition(

        position => {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;


          resolve({
            latitude,
            longitude
          });

        },

        error => {

          let message =
            "Unable to get your location.";

          if (
            error.code ===
            error.PERMISSION_DENIED
          ) {

            message =
              "Location permission is required to become Available.";

          }

          else if (
            error.code ===
            error.POSITION_UNAVAILABLE
          ) {

            message =
              "Your current location is unavailable.";

          }

          else if (
            error.code ===
            error.TIMEOUT
          ) {

            message =
              "Location request timed out. Please try again.";

          }

          reject(
            new Error(message)
          );

        },

        {
          enableHighAccuracy: true,

          timeout: 10000,

          maximumAge: 0

        }

      );

    }
  );

}


// -----------------------------------------
// Send location to backend
// -----------------------------------------

async function sendTechnicianLocation(
  latitude,
  longitude
) {

  try {

    const response =
      await fetch(
        `${API_URL}/technician/location`,
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

              latitude,

              longitude

            })

        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      console.log(
        "Location update failed:",
        data
      );

      return false;

    }


    // Keep local technician data updated

    technician.latitude =
      latitude;

    technician.longitude =
      longitude;

    technician.locationUpdatedAt =
      new Date().toISOString();


    localStorage.setItem(
      "technician",
      JSON.stringify(
        technician
      )
    );


    return true;

  }

  catch (error) {

    console.log(
      "Location update error:",
      error
    );

    return false;

  }

}


// -----------------------------------------
// Start live location tracking
// -----------------------------------------

function startLocationTracking() {

  if (!isLocationSupported()) {

    showToast(
      "Location services are not supported by your browser.",
      "error"
    );

    return false;

  }


  // Prevent duplicate watchers

  if (
    locationWatchId !== null
  ) {

    return true;

  }


  locationWatchId =
    navigator.geolocation.watchPosition(

      async position => {

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;


        const updated =
          await sendTechnicianLocation(
            latitude,
            longitude
          );


        if (updated) {

          locationPermissionGranted =
            true;

        }

      },

      error => {

        console.log(
          "Location tracking error:",
          error
        );


        // If permission is removed
        // while technician is Available,
        // immediately stop availability.

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {

          stopLocationTracking();

          currentStatus =
            "Offline";

          switchBtn.checked =
            false;

          statusText.innerText =
            "Offline";

          technician.status =
            "Offline";

          localStorage.setItem(
            "technician",
            JSON.stringify(
              technician
            )
          );

          showToast(
            "Location permission is required to receive new service requests.",
            "error"
          );

        }

      },

      {

        enableHighAccuracy: true,

        timeout: 15000,

        maximumAge: 10000

      }

    );


  return true;

}


// -----------------------------------------
// Stop live location tracking
// -----------------------------------------

function stopLocationTracking() {

  if (
    locationWatchId !== null
  ) {

    navigator.geolocation.clearWatch(
      locationWatchId
    );

    locationWatchId =
      null;

  }

  locationPermissionGranted =
    false;

}


// -----------------------------------------
// Restore location tracking if already
// Available after page refresh
// -----------------------------------------

async function restoreLocationTracking() {

  if (
    currentStatus !==
    "Available"
  ) {

    return;

  }


  try {

    const location =
      await requestTechnicianLocation();


    const updated =
      await sendTechnicianLocation(

        location.latitude,

        location.longitude

      );


    if (!updated) {

    currentStatus =
      "Offline";

    technician.status =
      "Offline";

    localStorage.setItem(
      "technician",
      JSON.stringify(
        technician
      )
    );

    updateAvailabilityUI();

    return;
}


    locationPermissionGranted =
      true;


    startLocationTracking();

  }

  catch (error) {

    console.log(
      "Unable to restore technician location:",
      error
    );


    currentStatus =
      "Offline";

    technician.status =
      "Offline";


    localStorage.setItem(
      "technician",
      JSON.stringify(
        technician
      )
    );


    updateAvailabilityUI();

  }

}

// ================================
// Toast Message
// ================================

function showToast(
message,
type="success"
){

const toast =
document.createElement(
"div"
);

toast.className =
`toast ${type}`;

toast.innerText =
message;

document.body.appendChild(
toast
);

setTimeout(()=>{

toast.classList.add(
"show"
);

},100);

setTimeout(()=>{

toast.remove();

},3000);

}


// =========================================
// LOAD NEW NEARBY REQUESTS
// =========================================

async function loadNewRequests() {

    const container =
        document.getElementById(
            "newRequestsContainer"
        );

    const countElement =
        document.getElementById(
            "newRequestCount"
        );


    if (!container) {
        return;
    }


    // Technician must be Available

    if (
        currentStatus !==
        "Available"
    ) {

        container.innerHTML = `

            <div class="empty-requests">

                <i class="fas fa-toggle-off"></i>

                <h3>
                    You're Offline
                </h3>

                <p>
                    Turn on Availability to receive
                    nearby service requests.
                </p>

            </div>

        `;

        if (countElement) {
            countElement.textContent = "0";
        }

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/technician/new-requests/${technician.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load requests."
            );

        }


        const requests =
            data.requests || [];


        if (countElement) {

            countElement.textContent =
                requests.length;

        }


        if (!requests.length) {

            container.innerHTML = `

                <div class="empty-requests">

                    <i class="fas fa-inbox"></i>

                    <h3>
                        No Nearby Requests
                    </h3>

                    <p>
                        We'll show matching service
                        requests here.
                    </p>

                </div>

            `;

            return;
        }


        container.innerHTML =
            requests
                .map(
                    request =>
                        createNewRequestCard(
                            request
                        )
                )
                .join("");


    } catch (error) {

        console.error(
            "New requests error:",
            error
        );


        container.innerHTML = `

            <div class="empty-requests">

                <i class="fas fa-triangle-exclamation"></i>

                <h3>
                    Unable to load requests
                </h3>

                <p>
                    Please try again shortly.
                </p>

            </div>

        `;

    }

}

// =========================================
// CREATE NEW REQUEST CARD
// =========================================

function createNewRequestCard(request) {

    // -----------------------------------------
    // Distance
    // -----------------------------------------

    const distance =
        request.distance !== undefined &&
        request.distance !== null
            ? `${request.distance} km`
            : "Nearby";


    // -----------------------------------------
    // Service Charge
    // -----------------------------------------

    const serviceName = String(
        request.service || ""
    ).trim();


    const serviceKey = Object.keys(
        SERVICE_CHARGES
    ).find(
        key =>
            key.toLowerCase() ===
            serviceName.toLowerCase()
    );


    const backendCharge =
        Number(request.serviceCharge);


    const serviceCharge =
        backendCharge > 0
            ? backendCharge
            : (
                serviceKey
                    ? SERVICE_CHARGES[serviceKey]
                    : 0
            );


    // -----------------------------------------
    // Return Card
    // -----------------------------------------

    return `

        <article
            class="new-request-card"
            data-booking-id="${request.id}"
        >

            <!-- ===============================
                 HEADER
            ================================ -->

            <div class="new-request-card-header">

                <div class="request-service-info">

                    <div class="request-service-icon">
                        🛠️
                    </div>

                    <div class="request-heading">

                        <span class="request-service">
                            ${request.service || "Service"}
                        </span>

                        <h3>
                            ${request.issue || "Service Request"}
                        </h3>

                    </div>

                </div>


                <div class="request-distance">
                    📍 ${distance}
                </div>

            </div>


            <!-- ===============================
                 BOOKING INFO
            ================================ -->

            <div class="request-info-grid">

                <!-- DATE -->

                <div class="request-info-item">

                    <span class="request-info-icon">
                        📅
                    </span>

                    <div>

                        <small>
                            DATE
                        </small>

                        <strong>
                            ${request.bookingDate || "-"}
                        </strong>

                    </div>

                </div>


                <!-- TIME -->

                <div class="request-info-item">

                    <span class="request-info-icon">
                        ⏰
                    </span>

                    <div>

                        <small>
                            TIME
                        </small>

                        <strong>
                            ${request.bookingTime || "-"}
                        </strong>

                    </div>

                </div>


                <!-- LOCATION -->

                <div class="request-info-item">

                    <span class="request-info-icon">
                        📍
                    </span>

                    <div>

                        <small>
                            LOCATION
                        </small>

                        <strong>
                            ${request.city || "-"}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- ===============================
                 FOOTER
            ================================ -->

            <div class="request-card-footer">


                <!-- SERVICE CHARGE -->

                <div class="technician-service-charge">

                    <span class="charge-icon">
                        💰
                    </span>

                    <div>

                        <small>
                            SERVICE CHARGE
                        </small>

                        <strong>
                            ₹${serviceCharge}
                        </strong>

                    </div>

                </div>


                <!-- ACCEPT -->

                <button
                    type="button"
                    class="accept-new-job-btn"
                    data-booking-id="${request.id}"
                    onclick="acceptNewJob('${request.id}')"
                >

                    <i class="fas fa-check"></i>

                    Accept Job

                </button>

            </div>

        </article>

    `;
}

// ================================
// Accept New Service Request
// ================================

async function acceptNewJob(bookingId) {

    try {

        if (!bookingId) {
            showToast(
                "Unable to accept this service request.",
                "error"
            );
            return;
        }

        if (currentStatus !== "Available") {
            showToast(
                "You must be Available to accept a job.",
                "error"
            );
            return;
        }


        // ==================================
        // Find clicked button
        // ==================================

        const buttons =
            document.querySelectorAll(
                `.accept-new-job-btn[data-booking-id="${bookingId}"]`
            );

        buttons.forEach((button) => {
            button.disabled = true;
            button.innerHTML =
                `<i class="fas fa-spinner fa-spin"></i> Accepting...`;
        });


        // ==================================
        // Accept request
        // ==================================

        const response =
            await fetch(
                `${API_URL}/technician/accept/${bookingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        // ==================================
        // Success
        // ==================================

        if (response.ok && data.success) {

            showToast(
                "Job accepted successfully.",
                "success"
            );


            // Remove accepted request
            await loadNewRequests();


            // Refresh assigned jobs
            await loadJobs();

            return;
        }


        // ==================================
        // Already accepted by another tech
        // ==================================

        if (response.status === 409) {

            showToast(
                data.message ||
                "This service request has already been accepted.",
                "error"
            );

            await loadNewRequests();

            return;
        }


        // ==================================
        // Other backend error
        // ==================================

        showToast(
            data.message ||
            "Unable to accept this service request.",
            "error"
        );


    } catch (error) {

        console.error(
            "Accept new job error:",
            error
        );

        showToast(
            "Unable to connect to the server.",
            "error"
        );

    }

}

// ================================
// Load Jobs
// ================================

async function loadJobs(){

try{

const response =
    await fetch(
        `${API_URL}/technician/jobs/${technician.id}`,
        {
            headers:{
                Authorization:
                `Bearer ${token}`
            }
        }
    );

const data =
await response.json();

if(!data.success){

showToast(
data.message,
"error"
);

return;

}

const jobs =
    data.jobs || [];

// =====================================================
// NEWEST REQUEST FIRST
// Sort by createdAt, NOT bookingDate
// =====================================================

allJobs = [...jobs];

allJobs.sort((a, b) => {

    const dateA =
        getBookingCreatedTime(a);

    const dateB =
        getBookingCreatedTime(b);

    // Bookings with valid createdAt first
    if (dateA === 0 && dateB === 0) return 0;
    if (dateA === 0) return 1;
    if (dateB === 0) return -1;

    return dateB - dateA;
});

document.getElementById(
"totalJobs"
).innerText =
jobs.length;

document.getElementById(
"completedJobs"
).innerText =
jobs.filter(
job =>
job.status ===
"Completed"
).length;

const container =
document.getElementById(
"jobsContainer"
);

if(jobs.length===0){

window.jobData = {};

container.innerHTML =
`
<div class="no-jobs">
No Assigned Jobs
</div>
`;

return;

}

renderJobs(
allJobs
);

}
catch(error){

console.log(error);

showToast(
"Failed to load jobs",
"error"
);

}

}

// ================================
// Render Jobs
// ================================

function renderJobs(
jobs
){

const container =
document.getElementById(
"jobsContainer"
);

if(jobs.length===0){

container.innerHTML =
`
<div class="no-jobs">

No Jobs Found

</div>
`;

return;

}

let html = "";

window.jobData = {};

jobs.forEach(job=>{

const statusClass =
job.status
.toLowerCase()
.replaceAll(" ","-");

window.jobData[job.id] =
job;

html += `

<div class="job-card">

<h3>
${job.service}
</h3>

<p>
<strong>Issue:</strong>
${job.issue}
</p>

<p>
<strong>Location:</strong>
${job.location}
</p>

<p>
<strong>Date:</strong>
${job.bookingDate || "-"}
</p>

<p>
<strong>Status:</strong>

<span class="status ${statusClass}">
${job.status}
</span>

</p>

<button
class="view-details-btn"
onclick="
viewDetails(
'${job.id}'
)
">

View Details

</button>

${
    job.status === "Completed"
    ?
    `
    <button
        disabled
        style="
            background:#16a34a;
            color:#ffffff;
            cursor:not-allowed;
        ">
        Completed
    </button>
    `
    :
    job.status === "Cancelled"
    ?
    `
    <button
        disabled
        style="
            background:#dc2626;
            color:#ffffff;
            cursor:not-allowed;
            border:1px solid #ef4444;
        ">
        Cancelled
    </button>
    `
    :
    currentStatus === "Offline"
    ?
    `
    <button
        disabled
        style="
            background:#9ca3af;
            cursor:not-allowed;
        ">
        Offline Mode
    </button>
    `
    :
  job.status === "Assigned"
?
`
<div class="job-action-group">

    <button
        onclick="
            updateStatus(
                '${job.id}',
                'In Progress'
            )
        ">
        <i class="fas fa-play"></i>
        Start Job
    </button>

    <button
        class="cancel-job-btn"
        onclick="
            cancelAssignedJob(
                '${job.id}'
            )
        ">
        <i class="fas fa-rotate-left"></i>
        Release Job
    </button>

</div>
`
    :
    job.status === "In Progress"
    ?
    `
    <button
        onclick="openOtpModal('${job.id}')">
        Complete Job
    </button>
    `
    :
    `
    <button disabled>
        Completed
    </button>
    `
}

</div>

`;

});

container.innerHTML =
html;

}

// =========================================
// CUSTOMER OTP VERIFICATION
// =========================================

let otpBookingId = null;


// Open OTP Modal
function openOtpModal(bookingId) {

    otpBookingId = bookingId;

    const modal =
        document.getElementById("otpModal");

    const input =
        document.getElementById("customerOtp");

    const error =
        document.getElementById("otpError");

    if (!modal || !input) {
        console.error("OTP modal elements not found");
        return;
    }

    input.value = "";

    if (error) {
        error.textContent = "";
    }

    modal.style.display = "flex";

    setTimeout(() => {
        input.focus();
    }, 100);
}


// Close OTP Modal
function closeOtpModal() {

    const modal =
        document.getElementById("otpModal");

    const input =
        document.getElementById("customerOtp");

    const error =
        document.getElementById("otpError");

    if (modal) {
        modal.style.display = "none";
    }

    if (input) {
        input.value = "";
    }

    if (error) {
        error.textContent = "";
    }

    otpBookingId = null;
}


// Verify OTP and Complete Job
async function verifyCustomerOtp() {

    const input =
        document.getElementById("customerOtp");

    const error =
        document.getElementById("otpError");

    const verifyBtn =
        document.getElementById("verifyOtpBtn");

    const otp =
        input.value.trim();

    if (!otp) {

        error.textContent =
            "Please enter the customer OTP.";

        input.focus();

        return;
    }

    if (!/^\d{4}$/.test(otp)) {

        error.textContent =
            "OTP must be exactly 4 digits.";

        input.focus();

        return;
    }

    if (!otpBookingId) {

        error.textContent =
            "Booking information is missing.";

        return;
    }

    try {

        verifyBtn.disabled = true;

        verifyBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            Verifying...
        `;

        const response =
            await fetch(
                `${API_URL}/technician/status/${otpBookingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        status: "Completed",

                        otp: otp,

                        completedAt:
                            new Date()
                                .toLocaleDateString(
                                    "en-CA",
                                    {
                                        timeZone:
                                            "Asia/Kolkata"
                                    }
                                )
                    })
                }
            );

        const data =
            await response.json();

        if (data.success) {

            closeOtpModal();

            showToast(
                data.message ||
                "Job Completed Successfully",
                "success"
            );

            await loadJobs();

            loadEarnings();

        } else {

            error.textContent =
                data.message ||
                "Invalid Customer OTP.";

        }

    } catch (error) {

        console.error(
            "OTP verification error:",
            error
        );

        error.textContent =
            "Unable to verify OTP. Please try again.";

    } finally {

        verifyBtn.disabled = false;

        verifyBtn.innerHTML = `
            <i class="fas fa-check"></i>
            Verify & Complete
        `;
    }
}


// =========================================
// OTP MODAL EVENTS
// =========================================

document
    .getElementById("verifyOtpBtn")
    ?.addEventListener(
        "click",
        verifyCustomerOtp
    );


document
    .getElementById("closeOtpModal")
    ?.addEventListener(
        "click",
        closeOtpModal
    );


document
    .getElementById("cancelOtpBtn")
    ?.addEventListener(
        "click",
        closeOtpModal
    );


// Close when clicking outside
document.addEventListener(
    "click",
    (event) => {

        const modal =
            document.getElementById("otpModal");

        if (
            modal &&
            event.target === modal
        ) {
            closeOtpModal();
        }

    }
);


// Only allow digits
document
    .getElementById("customerOtp")
    ?.addEventListener(
        "input",
        function () {

            this.value =
                this.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

            const error =
                document.getElementById(
                    "otpError"
                );

            if (error) {
                error.textContent = "";
            }
        }
    );


// Enter key = Verify
document
    .getElementById("customerOtp")
    ?.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {
                verifyCustomerOtp();
            }

        }
    );

// ================================
// Update Job Status
// ================================

async function updateStatus(
bookingId,
status
){

try{

const response =
await fetch(
`${API_URL}/technician/status/${bookingId}`,
{
method:"PUT",
headers:{
"Content-Type":
"application/json",
Authorization:
`Bearer ${token}`
},
body:JSON.stringify({

status,

completedAt:
status === "Completed"
?
new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kolkata"
}
)
:
null

})
}
);

const data =
await response.json();

if(data.success){

showToast(
data.message,
"success"
);

await loadJobs();

loadEarnings();

}
else{

showToast(
data.message,
"error"
);

}

}
catch(error){

console.log(error);

showToast(
"Status Update Failed",
"error"
);

}

}

// ================================
// Release Assigned Job
// ================================

async function cancelAssignedJob(bookingId) {

    if (!bookingId) {

        showToast(
            "Booking information is missing.",
            "error"
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/technician/cancel-job/${bookingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (response.ok && data.success) {

            showToast(
                data.message ||
                "Job released successfully.",
                "success"
            );


            // Refresh assigned jobs
            await loadJobs();


            // Refresh nearby requests
            if (
                currentStatus ===
                "Available"
            ) {
                await loadNewRequests();
            }


            return;
        }


        showToast(
            data.message ||
            "Unable to release this job.",
            "error"
        );


    } catch (error) {

        console.error(
            "Release job error:",
            error
        );


        showToast(
            "Unable to connect to the server.",
            "error"
        );

    }

}

// ================================
// Availability Switch
// ================================

switchBtn.addEventListener(
  "change",
  async () => {

    const wantsAvailable =
      switchBtn.checked;


    // =========================================
    // TECHNICIAN WANTS TO GO OFFLINE
    // =========================================

    if (!wantsAvailable) {

      try {

        const response =
          await fetch(
            `${API_URL}/technician/availability/${technician.id}`,
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

                  status: "Offline"

                })

            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          switchBtn.checked =
            true;

          showToast(
            data.message ||
            "Failed to go Offline.",
            "error"
          );

          return;

        }


        // Stop browser location tracking

        stopLocationTracking();


        currentStatus =
          "Offline";

        technician.status =
          "Offline";


        localStorage.setItem(
          "technician",
          JSON.stringify(
            technician
          )
        );


        updateAvailabilityUI();


        showToast(
          "You are now Offline.",
          "success"
        );

      }

      catch (error) {

        console.log(
          "Offline update error:",
          error
        );

        switchBtn.checked =
          true;

        showToast(
          "Failed to update availability.",
          "error"
        );

      }

      return;

    }


    // =========================================
    // TECHNICIAN WANTS TO GO AVAILABLE
    // =========================================

    switchBtn.checked =
      false;


    statusText.innerText =
      "Checking location...";


    try {

      // ---------------------------------------
      // Step 1: Request location permission
      // ---------------------------------------

      const location =
        await requestTechnicianLocation();


      // ---------------------------------------
      // Step 2: Send first location
      // ---------------------------------------

      const locationUpdated =
        await sendTechnicianLocation(

          location.latitude,

          location.longitude

        );


      if (!locationUpdated) {

        throw new Error(
          "Unable to save your location."
        );

      }


      locationPermissionGranted =
        true;


      // ---------------------------------------
      // Step 3: Tell backend Available
      // ---------------------------------------

      const response =
        await fetch(
          `${API_URL}/technician/availability/${technician.id}`,
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

                status: "Available"

              })

          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.message ||
          "Unable to become Available."
        );

      }


      // ---------------------------------------
      // Step 4: Update local state
      // ---------------------------------------

      currentStatus =
        "Available";

      technician.status =
        "Available";


      localStorage.setItem(
        "technician",
        JSON.stringify(
          technician
        )
      );


      updateAvailabilityUI();


      // ---------------------------------------
      // Step 5: Start live tracking
      // ---------------------------------------

      startLocationTracking();

      await loadNewRequests();

      showToast(
        "You are now Available and receiving nearby service requests.",
        "success"
      );

    }

    catch (error) {

      console.log(
        "Availability error:",
        error
      );


      currentStatus =
        "Offline";

      technician.status =
        "Offline";


      localStorage.setItem(
        "technician",
        JSON.stringify(
          technician
        )
      );


      switchBtn.checked =
        false;


      statusText.innerText =
        "Offline";


      showToast(
        error.message ||
        "Unable to become Available.",
        "error"
      );

    }

  }
);

// ================================
// Profile Page
// ================================

document.getElementById(
"profileBtn"
).addEventListener(
"click",
()=>{

    setActiveMenu(document.getElementById("profileBtn"));

document.getElementById(
"dashboardSection"
).style.display =
"none";

document.getElementById(
"earningsSection"
).style.display =
"none";

document.getElementById(
"historySection"
).style.display =
"none";

document.getElementById(
"feedbackSection"
).style.display =
"none";

document.getElementById(
"profileSection"
).style.display =
"block";

document.querySelector(
".main-content"
).scrollTop = 0;

loadProfile();

document.getElementById(
"dashboardBtn"
).classList.remove(
"active"
);

document.getElementById(
"earningsBtn"
).classList.remove(
"active"
);

document.getElementById(
"historyBtn"
).classList.remove(
"active"
);

document.getElementById(
"reviewsBtn"
).classList.remove(
"active"
);

document.getElementById(
"profileBtn"
).classList.add(
"active"
);
});

// ================================
// Earnings Page
// ================================

document.getElementById(
"earningsBtn"
)
.addEventListener( 
"click",
()=>{

    setActiveMenu(document.getElementById("earningsBtn"));

document.getElementById(
"dashboardSection"
).style.display =
"none";

document.getElementById(
"earningsSection"
).style.display =
"block";

document.getElementById(
"historySection"
).style.display =
"none";

document.getElementById(
"feedbackSection"
).style.display =
"none";

document.getElementById(
"profileSection"
).style.display =
"none";

document.getElementById(
"dashboardBtn"
).classList.remove(
"active"
);

document.getElementById(
"earningsBtn"
).classList.add(
"active"
);

loadEarnings();

}
);
// ================================
// Dashboard Page
// ================================

document.getElementById(
"dashboardBtn"
)
.addEventListener(
"click",
()=>{

    setActiveMenu(document.getElementById("dashboardBtn"));

document.getElementById(
"dashboardSection"
).style.display =
"block";

document.getElementById(
"earningsSection"
).style.display =
"none";

document.getElementById(
"historySection"
).style.display =
"none";

document.getElementById(
"feedbackSection"
).style.display =
"none";

document.getElementById(
"profileSection"
).style.display =
"none";

/* ADD THIS */
document.querySelector(
".main-content"
).scrollTop = 0;

document.getElementById(
"earningsBtn"
).classList.remove(
"active"
);

document.getElementById(
"historyBtn"
).classList.remove(
"active"
);

document.getElementById(
"reviewsBtn"
).classList.remove(
"active"
);

document.getElementById(
"profileBtn"
).classList.remove(
"active"
);

document.getElementById(
"dashboardBtn"
).classList.add(
"active"
);

}
);

document.getElementById(
"historyBtn"
)
.addEventListener(
"click",
()=>{

    setActiveMenu(document.getElementById("historyBtn"));

document.getElementById(
"dashboardSection"
).style.display =
"none";

document.getElementById(
"earningsSection"
).style.display =
"none";

document.getElementById(
"historySection"
).style.display =
"block";

document.getElementById(
"feedbackSection"
).style.display =
"none";

document.getElementById(
"profileSection"
).style.display =
"none";

document.getElementById(
"dashboardBtn"
).classList.remove(
"active"
);

document.getElementById(
"earningsBtn"
).classList.remove(
"active"
);

document.getElementById(
"historyBtn"
).classList.add(
"active"
);

loadWorkHistory();

}
);

document.getElementById(
"reviewsBtn"
)
.addEventListener(
"click",
()=>{

    setActiveMenu(document.getElementById("reviewsBtn"));

document.getElementById(
"dashboardSection"
).style.display =
"none";

document.getElementById(
"earningsSection"
).style.display =
"none";

document.getElementById(
"historySection"
).style.display =
"none";

document.getElementById(
"feedbackSection"
).style.display =
"block";

document.getElementById(
"profileSection"
).style.display =
"none";

document.getElementById(
"dashboardBtn"
).classList.remove(
"active"
);

document.getElementById(
"earningsBtn"
).classList.remove(
"active"
);

document.getElementById(
"historyBtn"
).classList.remove(
"active"
);

document.getElementById(
"reviewsBtn"
).classList.add(
"active"
);

loadFeedback();

}
);

// ================================
// Logout
// ================================

document.getElementById(
"logoutBtn"
).addEventListener(
"click",
()=>{

localStorage.removeItem(
"technicianToken"
);

localStorage.removeItem(
"technician"
);

window.location.href =
"/technician-login.html";

}
);


// ================================
// Filter Jobs
// ================================

function filterJobs(
status
){

currentFilter =
status;

const buttons =
document.querySelectorAll(
".tab-btn"
);

buttons.forEach(btn=>{

btn.classList.remove(
"active"
);

if(
btn.innerText.trim() ===
status
){

btn.classList.add(
"active"
);

}

});

const filteredJobs =
status === "All"
?
allJobs
:
allJobs.filter(
job =>
job.status === status
);

renderJobs(
filteredJobs
);

}

// ================================
// View Details Modal
// ================================

function viewDetails(
jobId
){

const job =
window.jobData[jobId];

if(!job){

showToast(
"Job Details Not Found",
"error"
);

return;

}

const modal =
document.getElementById(
"detailsModal"
);

const body =
document.getElementById(
"modalBody"
);

body.innerHTML = `

<div class="detail-item">
<strong>Customer</strong>
<span>${job.customerName || "-"}</span>
</div>

<div class="detail-item">
<strong>Phone</strong>
<span>${job.customerPhone || "-"}</span>
</div>

<div class="detail-item">
<strong>Service</strong>
<span>${job.service || "-"}</span>
</div>

<div class="detail-item">
<strong>Issue</strong>
<span>${job.issue || "-"}</span>
</div>

<div class="detail-item">
<strong>Address</strong>
<span>${job.location || "-"}</span>
</div>

<div class="detail-item">
<strong>City</strong>
<span>${job.city || "-"}</span>
</div>

<div class="detail-item">
<strong>State</strong>
<span>${job.state || "-"}</span>
</div>

<div class="detail-item">
<strong>Pincode</strong>
<span>${job.pincode || "-"}</span>
</div>

<div class="detail-item">
<strong>Booking Date</strong>
<span>${job.bookingDate || "-"}</span>
</div>

<div class="detail-item">
<strong>Status</strong>
<span>${job.status || "-"}</span>
</div>

${
job.reviewSubmitted
?
`
<div class="detail-item">
<strong>⭐ Rating</strong>
<span>${job.userRating || 0}/5</span>
</div>

<div class="detail-item">
<strong>📝 Review</strong>
<span>${job.review || "No Review"}</span>
</div>
`
:
""
}

`;

modal.style.display =
"flex";

}

// ================================
// Close Modal
// ================================

document
.getElementById(
"closeModal"
)
.addEventListener(
"click",
()=>{

document
.getElementById(
"detailsModal"
)
.style.display =
"none";

}
);

window.addEventListener(
"click",
(e)=>{

const modal =
document.getElementById(
"detailsModal"
);

if(
e.target === modal
){

modal.style.display =
"none";

}

}
);

// ================================
// Load Reviews
// ================================

async function loadReviews(){

try{

const response =
await fetch(
`${API_URL}/technician/reviews/${technician.id}`,
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data =
await response.json();

console.log(data);

if(!data.success) return;

const reviews =
data.reviews || [];

console.log(reviews);

const container =
document.getElementById(
"reviewsContainer"
);

if(reviews.length===0){

container.innerHTML =
"<p>No Reviews Yet</p>";

document.getElementById(
"averageRating"
).innerText = "0";

return;

}

let totalRating = 0;
let html = "";

reviews.forEach(review=>{

totalRating += review.rating;

html += `
<div class="review-card">

<div class="review-rating">
${"⭐".repeat(review.rating)}
</div>

<p>
${review.review || "No Comment"}
</p>

</div>
`;

});

container.innerHTML = html;

const avg =
(
totalRating /
reviews.length
).toFixed(1);

document.getElementById(
"averageRating"
).innerText = avg;

const stars =
Math.round(avg);

document.getElementById(
"averageStars"
).innerHTML =
"⭐".repeat(stars);

document.getElementById(
"averageRating"
).innerText =
(
totalRating / reviews.length
).toFixed(1);

}
catch(error){

console.log(error);

}

}

async function initializeDashboard(){

    // Get latest status from backend first
    await syncTechnicianStatus();

    updateAvailabilityUI();

    await loadJobs();
    loadReviews();
    loadEarnings();

    await restoreLocationTracking();

    await loadNewRequests();
}

initializeDashboard();

// Refresh nearby service requests every 10 seconds
setInterval(() => {
    if (currentStatus === "Available") {
        loadNewRequests();
    }
}, 10000);

document.getElementById(
"profileSection"
).style.display =
"none";

document.getElementById(
"dashboardSection"
).style.display =
"block";

document.getElementById(
"earningsSection"
).style.display =
"none";

document.getElementById(
"dashboardBtn"
).classList.add(
"active"
);

document.getElementById(
"earningsBtn"
).classList.remove(
"active"
);

async function loadEarnings(){

try{

const completedJobs =
allJobs.filter(
job => job.status === "Completed"
);

let total = 0;
let monthly = 0;
let weekly = 0;
let today = 0;

const now = new Date();

const currentMonth =
now.getMonth();

const currentYear =
now.getFullYear();

const todayDate =
new Date()
.toLocaleDateString(
"en-CA",
{
timeZone:"Asia/Kolkata"
}
);

const firstDayOfWeek =
new Date(now);

firstDayOfWeek.setDate(
now.getDate() - now.getDay()
);

completedJobs.forEach(job=>{

const amount =
SERVICE_CHARGES[
job.service
] || 300;

total += amount;

if(job.completedAt){

const jobDate =
new Date(job.completedAt);

if(
jobDate.getMonth() === currentMonth &&
jobDate.getFullYear() === currentYear
){
monthly += amount;
}

if(
jobDate >= firstDayOfWeek
){
weekly += amount;
}

if(
job.completedAt === todayDate
){
today += amount;
}

}

});

document.getElementById(
"totalEarnings"
).innerText =
`₹${total}`;

document.getElementById(
"monthlyEarnings"
).innerText =
`₹${monthly}`;

document.getElementById(
"weeklyEarnings"
).innerText =
`₹${weekly}`;

document.getElementById(
"todayEarnings"
).innerText =
`₹${today}`;

renderEarningHistory(
completedJobs
);

}
catch(error){

console.log(error);

}

}

function renderEarningHistory(
jobs
){

window.allCompletedJobs = jobs;

window.earningData = {};

const container =
document.getElementById(
"earningHistory"
);

if(jobs.length===0){

container.innerHTML =

`
<div class="no-jobs">

No Earnings Yet

</div>
`;

return;

}

let html = "";

jobs.forEach(job=>{

window.earningData[
job.id
] = job;

const amount =
SERVICE_CHARGES[
job.service
] || 300;

html += `

<div
class="transaction-card"
onclick="
viewEarningDetails(
'${job.id}'
)
">
<div class="transaction-left">

<h4>
${job.service}
</h4>

<p>
${job.completedAt || job.bookingDate || ""}
</p>

</div>

<div class="transaction-amount">

+₹${amount}

</div>

</div>

`;

});

container.innerHTML =
html;

}

document.getElementById(
"earningSearch"
)
.addEventListener(
"input",
filterEarnings
);

document.getElementById(
"earningFilter"
)
.addEventListener(
"change",
filterEarnings
);

function filterEarnings(){

const searchValue =
document.getElementById(
"earningSearch"
).value.toLowerCase();

const selectedService =
document.getElementById(
"earningFilter"
).value;

const selectedDate =
document.getElementById(
"earningDateFilter"
).value;

let filteredJobs =
window.allCompletedJobs || [];

if(selectedService !== "All"){

filteredJobs =
filteredJobs.filter(
job =>
job.service === selectedService
);

}

if(searchValue){

filteredJobs =
filteredJobs.filter(
job =>

(job.service || "")
.toLowerCase()
.includes(searchValue)

||

(job.customerName || "")
.toLowerCase()
.includes(searchValue)

);

}

if(selectedDate){

filteredJobs =
filteredJobs.filter(
job =>
job.completedAt === selectedDate
);

}

renderEarningHistory(
filteredJobs
);

}

function viewEarningDetails(
jobId
){

const job =
window.earningData[
jobId
];

if(!job) return;

const amount =
SERVICE_CHARGES[
job.service
] || 300;

document.getElementById(
"earningModalBody"
).innerHTML =

`

<div class="detail-item">

<strong>
Customer
</strong>

<span>
${job.customerName || "-"}
</span>

</div>

<div class="detail-item">

<strong>
Phone Number
</strong>

<span>
${job.customerPhone || "-"}
</span>

</div>

<div class="detail-item">

<strong>
Service Category
</strong>

<span>
${job.service || "-"}
</span>

</div>

<div class="detail-item">

<strong>
Issue Reported
</strong>

<span>
${job.issue || "-"}
</span>

</div>

<div class="detail-item">

<strong>
Customer Address
</strong>

<span>
${job.location || "-"}
</span>

</div>

<div class="detail-item">

<strong>
Completed On
</strong>

<span>
${job.completedAt || "-"}
</span>

</div>

<div class="detail-item earning-box">

<strong>
Service Earnings
</strong>

<span>
₹${job.serviceCharge || amount}
</span>

</div>

<div class="detail-item rating-box">

<strong>
Customer Rating
</strong>

<span class="rating-stars">

${"⭐".repeat(job.userRating || 5)}

</span>

</div>

`;

document.getElementById(
"earningModal"
).style.display =
"flex";

}

document.getElementById(
"closeEarningModal"
)
.addEventListener(
"click",
()=>{

document.getElementById(
"earningModal"
).style.display =
"none";

}
);


document.getElementById(
"earningDateFilter"
)
.addEventListener(
"change",
filterEarnings
);

document.getElementById(
"clearFilterBtn"
)
.addEventListener(
"click",
()=>{

document.getElementById(
"earningSearch"
).value = "";

document.getElementById(
"earningDateFilter"
).value = "";

renderEarningHistory(
window.allCompletedJobs
);

});

document.getElementById(
"historySearch"
)
.addEventListener(
"input",
filterHistory
);

document.getElementById(
"historyStatusFilter"
)
.addEventListener(
"change",
filterHistory
);

async function loadWorkHistory(){

const container =
document.getElementById(
"historyContainer"
);

const completedJobs =
allJobs.filter(
job =>
job.status === "Completed"
);

document.getElementById(
"historyTotalJobs"
).innerText =
allJobs.length;

document.getElementById(
"historyCompletedJobs"
).innerText =
completedJobs.length;

let historyTotal = 0;

completedJobs.forEach(job=>{

historyTotal +=

job.serviceCharge ||

SERVICE_CHARGES[
job.service
] ||

0;

});

document.getElementById(
"historyTotalEarnings"
).innerText =

`₹${historyTotal}`;

let html = "";

completedJobs.forEach(job=>{

html += `

<div
class="history-job-card"
onclick="
viewEarningDetails(
'${job.id}'
)
">

<div>

<h3>
${job.service}
</h3>

<p>
${job.customerName || "-"}
</p>

<p>
${job.completedAt || "-"}
</p>

</div>

<div>

<span class="status completed">

${job.status}

</span>

<h2>

₹${job.serviceCharge ||

SERVICE_CHARGES[
job.service
] ||

0}

</h2>

</div>

</div>

`;

});

renderHistoryCards(
completedJobs
);

}

function renderHistoryCards(
jobs
){

const container =
document.getElementById(
"historyContainer"
);

let html = "";

jobs.forEach(job=>{

html += `

<div
class="history-job-card"
onclick="
viewEarningDetails(
'${job.id}'
)
">

<div>

<h3>
${job.service}
</h3>

<p>
${job.customerName || "-"}
</p>

<p>
${job.completedAt || "-"}
</p>

</div>

<div>

<span class="status completed">

${job.status}

</span>

<h2>

₹${job.serviceCharge ||

SERVICE_CHARGES[
job.service
] ||

0}

</h2>

</div>

</div>

`;

});

container.innerHTML =
html;

}

function filterHistory(){

const searchValue =
document.getElementById(
"historySearch"
).value.toLowerCase();

const selectedStatus =
document.getElementById(
"historyStatusFilter"
).value;

let filteredJobs =
allJobs || [];

if(
selectedStatus !== "All"
){

filteredJobs =
filteredJobs.filter(
job =>
job.status ===
selectedStatus
);

}

if(searchValue){

filteredJobs =
filteredJobs.filter(
job =>

(job.customerName || "")
.toLowerCase()
.includes(searchValue)

||

(job.service || "")
.toLowerCase()
.includes(searchValue)

);

}

renderHistoryCards(
filteredJobs
);

}

async function loadFeedback(){

const response =
await fetch(
    `${API_URL}/technician/reviews/${technician.id}`,
    {
        headers:{
            Authorization:
            `Bearer ${token}`
        }
    }
);

const data =
await response.json();

if(!data.success) return;

const reviews =
data.reviews || [];

window.reviewData =
reviews;

renderFeedback(
reviews
);

const total =
reviews.length;

let ratingSum = 0;

reviews.forEach(review=>{

ratingSum +=
review.rating || 0;

});

document.getElementById(
"feedbackTotalReviews"
).innerText =
total;

document.getElementById(
"feedbackAvgRating"
).innerText =

total
?
(ratingSum/total)
.toFixed(1)
:
"0.0";

}

function renderFeedback(
reviews
){

const container =
document.getElementById(
"feedbackContainer"
);

let html = "";

reviews.forEach(review=>{

html += `
<div class="feedback-review-card">

<div class="rating-badge">
⭐ ${review.rating || 5}/5
</div>

<div class="review-stars">
${"⭐".repeat(review.rating || 5)}
</div>

<div class="review-text">
${review.review || "Excellent service."}
</div>

<div class="review-footer">

<span>

👤
${review.customerName || "Customer"}

</span>

<span>

📅
${
review.createdAt
?
new Date(
review.createdAt._seconds * 1000
).toLocaleDateString(
"en-IN"
)
:
""
}

</span>

</div>

</div>
`;

});

container.innerHTML =
html;

}

function filterFeedback(){

const searchValue =
document.getElementById(
"feedbackSearch"
).value.toLowerCase();

const selectedRating =
document.getElementById(
"feedbackRatingFilter"
).value;

let filteredReviews =
window.reviewData || [];

if(selectedRating !== "All"){

filteredReviews =
filteredReviews.filter(
review =>
Number(review.rating) ===
Number(selectedRating)
);

}

if(searchValue){

filteredReviews =
filteredReviews.filter(
review =>

(review.customerName || "")
.toLowerCase()
.includes(searchValue)

||

(review.review || "")
.toLowerCase()
.includes(searchValue)

);

}

renderFeedback(
filteredReviews
);

}

document.getElementById(
"feedbackSearch"
)
.addEventListener(
"input",
filterFeedback
);

document.getElementById(
"feedbackRatingFilter"
)
.addEventListener(
"change",
filterFeedback
);

document.getElementById(
"saveProfileBtn"
)
.addEventListener(
"click",
saveProfile
);

async function saveProfile(){

console.log(
"SAVE BUTTON CLICKED"
);

try{

const technicianId =
technician.id;

const response =
await fetch(

`${API_URL}/technician/profile/${technicianId}`,



{

method:"PUT",

headers:{
"Content-Type":
"application/json",
Authorization:
`Bearer ${token}`
},

body:JSON.stringify({

name:
document.getElementById(
"profileName"
).value,

phone:
document.getElementById(
"profilePhone"
).value,

city:
document.getElementById(
"profileCity"
).value,

state:
document.getElementById(
"profileState"
).value,

pincode:
document.getElementById(
"profilePincode"
).value,

experience:
document.getElementById(
"profileExperience"
).value

})

}

);

const data =
await response.json();

console.log(
"SAVE RESPONSE:",
data
);

if(data.success){

    technician.name =
document.getElementById(
"profileName"
).value;

localStorage.setItem(
"technician",
JSON.stringify(
technician
)
);

document.getElementById(
"techName"
).innerText =
technician.name;

const toast =
document.getElementById(
"successToast"
);

toast.classList.add(
"show"
);

setTimeout(()=>{

toast.classList.remove(
"show"
);

},3000);

}   

}
catch(error){

console.log(error);

alert(
"Update Failed"
);

}

}

async function loadProfile(){

try{

const response =
await fetch(
`${API_URL}/technician/profile/${technician.id}`,
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data =
await response.json();

console.log(
"PROFILE DATA:",
data
);

if(!data.success) return;

const tech =
data.technician;

document.getElementById(
"profileName"
).value =
tech.name || "";

document.getElementById(
"profilePhone"
).value =
tech.phone || "";

document.getElementById(
"profileCity"
).value =
tech.city || "";

document.getElementById(
"profileState"
).value =
tech.state || "";

document.getElementById(
"profilePincode"
).value =
tech.pincode || "";

document.getElementById(
"profileExperience"
).value =
tech.experience || "";

document.getElementById(
"profileService"
).value =
tech.serviceType || "";
}
catch(error){

console.log(error);

}

}

async function changePassword(){

const currentPassword =
document.getElementById(
"currentPassword"
).value;

const newPassword =
document.getElementById(
"newPassword"
).value;

const confirmPassword =
document.getElementById(
"confirmPassword"
).value;

if(
newPassword !==
confirmPassword
){

alert(
"Passwords do not match"
);

return;

}

const response =
await fetch(

`${API_URL}/technician/change-password/${technician.id}`,

{

method:"PUT",

headers:{
"Content-Type":
"application/json",
Authorization:
`Bearer ${token}`
},

body:JSON.stringify({

currentPassword,
newPassword

})

}

);

const data =
await response.json();

if(data.success){

alert(
"Password Updated Successfully"
);

document.getElementById(
"currentPassword"
).value = "";

document.getElementById(
"newPassword"
).value = "";

document.getElementById(
"confirmPassword"
).value = "";

}
else{

alert(
data.message
);

}

}

function setActiveMenu(activeButton) {
    document.querySelectorAll(".menu-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    activeButton.classList.add("active");
}
