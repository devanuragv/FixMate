// ================================
// Admin Authentication
// ================================
const token =
  localStorage.getItem(
    "fixmateToken"
  );

if (!token) {

  alert(
    "Please Login First"
  );

  window.location.href =
    "/login.html";

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

      window.allBookings =
      bookingsData.bookings;

      window.allUsers =
      usersData.users;

    const techniciansData =
      await technicians.json();

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
tech.status ===
"Available"
).length;

const offlineTechs =
techniciansData.technicians.filter(
tech =>
tech.status ===
"Offline"
).length;

const completedServices =
bookingsData.bookings.filter(
booking =>
booking.status ===
"Completed"
).length;

const pendingServices =
bookingsData.bookings.filter(
booking =>
booking.status ===
"Pending"
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

    let html = "";

    bookingsData.bookings.forEach(
      booking => {

        html += `
        <div class="booking-card"
        data-status="${booking.status}">

          <h3>
            ${booking.service}
          </h3>

          <p>
            <strong>Issue:</strong>
            ${booking.issue}
          </p>

          <p>
            <strong>Status:</strong>
            ${booking.status}
          </p>

          <p>
            <strong>Technician:</strong>
            ${booking.technician || "Not Assigned"}
          </p>

         ${
  booking.status === "Completed"
  ?
  `
  <div class="completed-service-box">

    <p class="completed-text">

      ✅ Service Completed

    </p>


    ${
      booking.reviewSubmitted
      ?
      `

      <div class="service-review">

        <div class="service-rating">

          <strong>
            ⭐ Customer Rating:
          </strong>

          <span>
            ${booking.userRating || 0}/5
          </span>

        </div>


        <div class="service-feedback">

          <strong>
            💬 Customer Feedback
          </strong>

          <p>
            ${
              booking.review ||
              "No written feedback provided."
            }
          </p>

        </div>

      </div>

      `
      :
      `

      <div class="service-no-review">

        <p>
          ⭐ Customer Rating:
          <span>
            Not Rated
          </span>
        </p>

        <p>
          💬 Customer Feedback:
          <span>
            No feedback submitted yet.
          </span>
        </p>

      </div>

      `
    }

  </div>
  `
  :
  `
            <select
            id="tech-${booking.id}"
            class="tech-select">

            <option value="">
            Select Technician
            </option>

            </select>

            <button
            class="assign-btn"
            onclick="assignTechnician('${booking.id}')">

            Assign Technician

            </button>
            `
            }

        </div>
        `;

      });

    document.getElementById(
      "bookingList"
    ).innerHTML =
      html;

    loadTechnicianDropdowns(
      techniciansData.technicians
    );

  } catch (error) {

    console.log(error);

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

  selects.forEach(select => {

technicians.forEach(tech => {

  if(
    tech.status === "Offline"
  ){

    select.innerHTML += `
    <option
      value=""
      disabled>

      ${tech.name}
      (${tech.serviceType} - Offline)

    </option>
    `;

  }
  else{

    select.innerHTML += `
    <option
      value="${tech.id}"
      data-name="${tech.name}">

      ${tech.name}
      (${tech.serviceType})

    </option>
    `;

  }

});

  });

}

// ================================
// Assign Technician
// ================================
async function assignTechnician(
  bookingId
) {

  const select =
    document.getElementById(
      `tech-${bookingId}`
    );

  const technicianId =
    select.value;

  const technicianName =
    select.options[
      select.selectedIndex
    ].dataset.name;

  if (!technicianId) {

    alert(
      "Please Select Technician"
    );

    return;

  }

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

          body: JSON.stringify({
            technicianId,
            technicianName
          })
        }
      );

    const data =
      await response.json();

    alert(
      data.message
    );

    loadAdminData();

  } catch (error) {

    console.log(error);

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

              body: JSON.stringify({
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
    ).value,
})
            }
          );

        const data =
          await response.json();

        alert(
  data.message +
  "\nTechnician ID: " +
  (data.technicianId || "Not generated")
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

      }

    }
  );

  // ================================
// Load Users
// ================================

async function loadUsers(){

try{

const response =
await fetch(
"/api/admin/users",
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

return;

}

let html = "";

data.users.forEach(user=>{

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
">

View Profile

</button>

</div>

`;

});

document.getElementById(
"usersList"
).innerHTML = html;

}
catch(error){

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

        <h3>${tech.name}</h3>

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
        viewTechnician(
        '${tech.id}'
        )
        ">

        View Details

        </button>

        <button
        class="edit-btn"
        onclick="editTechnician('${tech.id}')">
        Edit Profile
        </button>

        <button
        class="delete-btn"
        onclick="deleteTechnician('${tech.id}')">
        Delete
        </button>

        </div>

        </div>
        `;

      });

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
    confirm(
      "Delete this technician?"
    );

  if (!confirmDelete)
    return;

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

    alert(
      data.message
    );

    loadTechnicians();
    loadAdminData();

  } catch (error) {

    console.log(error);

  }

}

// ================================
// Initial Load
// ================================
Promise.all([
loadAdminData(),
loadTechnicians(),
loadUsers()
]);

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

togglePassword.addEventListener(
"click",
()=>{

if(
techPassword.type ===
"password"
){

techPassword.type =
"text";

togglePassword.innerHTML =
"🙈";

}
else{

techPassword.type =
"password";

togglePassword.innerHTML =
"👁";

}

}
);

function showSection(sectionId){

document
.querySelectorAll(
".dashboard-section"
)
.forEach(section=>{

section.classList.add(
"hidden"
);

});

document
.getElementById(
sectionId
)
.classList.remove(
"hidden"
);

}

async function editTechnician(
technicianId
){

const newPhone =
prompt(
"Enter New Phone Number"
);

if(!newPhone) return;

try{

const response =
await fetch(
`/api/admin/technicians/${technicianId}`,
{
method:"PUT",
headers:{
"Content-Type":
"application/json",
Authorization:
`Bearer ${token}`
},
body:JSON.stringify({
phone:newPhone
})
}
);

const data =
await response.json();

alert(data.message);

loadTechnicians();

}
catch(error){

console.log(error);

}

}

// ================================
// View Technician
// ================================

async function viewTechnician(
technicianId
){

try{

const response =
await fetch(
"/api/admin/technicians",
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data =
await response.json();

const tech =
data.technicians.find(
t => t.id === technicianId
);

if(!tech){

alert(
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

<p><strong>Name:</strong> ${tech.name}</p>

<p><strong>Email:</strong> ${tech.email}</p>

<p><strong>Phone:</strong> ${tech.phone}</p>

<p><strong>Service:</strong> ${tech.serviceType}</p>

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
<span>⭐ ${tech.rating || 0}</span>
</p>

<p>
<span>Total Jobs</span>
<span>${totalJobs}</span>
</p>

</div>

</div>

`;

document.getElementById(
"technicianModal"
).style.display =
"flex";

}
catch(error){

console.log(error);

}

}

// ================================
// View User
// ================================

async function viewUser(
userId
){

try{

const user =
window.allUsers.find(
u => u.id === userId
);

if(!user){

alert(
"User Not Found"
);

return;

}

const userBookings =
window.allBookings.filter(
booking =>
booking.userId === user.id
);

const pendingCount =
userBookings.filter(
booking =>
booking.status === "Pending"
).length;

const assignedCount =
userBookings.filter(
booking =>
booking.status === "Assigned"
).length;

const progressCount =
userBookings.filter(
booking =>
booking.status === "In Progress"
).length;

const completedCount =
userBookings.filter(
booking =>
booking.status === "Completed"
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
<span>Total Bookings</span>
<span>${userBookings.length}</span>
</p>

<p>
<span>Pending</span>
<span>${pendingCount}</span>
</p>

<p>
<span>Assigned</span>
<span>${assignedCount}</span>
</p>

<p>
<span>In Progress</span>
<span>${progressCount}</span>
</p>

<p>
<span>Completed</span>
<span>${completedCount}</span>
</p>

</div>

</div>

`;

document.getElementById(
"userModal"
).style.display =
"flex";

}
catch(error){

console.log(error);

}

}

document
.getElementById(
"closeUserModal"
)
.addEventListener(
"click",
()=>{

document
.getElementById(
"userModal"
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
"userModal"
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
// Analytics Card Functions
// ================================

function showAvailableTechnicians(){

showSection(
"techniciansSection"
);

loadTechnicians();

setTimeout(()=>{

document
.querySelectorAll(
".tech-card"
)
.forEach(card=>{

if(
!card.innerText.includes(
"Available"
)
){

card.style.display =
"none";

}
else{

card.style.display =
"block";

}

});

},200);

}

function showOfflineTechnicians(){

showSection(
"techniciansSection"
);

loadTechnicians();

setTimeout(()=>{

document
.querySelectorAll(
".tech-card"
)
.forEach(card=>{

if(
!card.innerText.includes(
"Offline"
)
){

card.style.display =
"none";

}
else{

card.style.display =
"block";

}

});

},200);

}

function showCompletedBookings(){

showSection(
"bookingsSection"
);

document
.querySelectorAll(
".booking-card"
)
.forEach(card=>{

if(
!card.innerText.includes(
"Completed"
)
){

card.style.display =
"none";

}
else{

card.style.display =
"block";

}

});

}

function showPendingBookings(){

showSection(
"bookingsSection"
);

document
.querySelectorAll(
".booking-card"
)
.forEach(card=>{

if(
!card.innerText.includes(
"Pending"
)
){

card.style.display =
"none";

}
else{

card.style.display =
"block";

}

});

}



document
.getElementById(
"closeTechModal"
)
.addEventListener(
"click",
()=>{

document
.getElementById(
"technicianModal"
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
"technicianModal"
);

if(
e.target === modal
){

modal.style.display =
"none";

}

}
);

const searchInput =
document.getElementById(
"adminSearch"
);

searchInput.addEventListener(
"keyup",
function(){

const value =
this.value
.toLowerCase()
.trim();

const results =
document.getElementById(
"searchResults"
);

if(!value){

results.innerHTML = "";
return;

}

let html = "";

// Users

window.allUsers.forEach(user=>{

if(
(user.name || "")
.toLowerCase()
.includes(value)
){

html += `

<div
class="search-item"
onclick="
viewUser('${user.id}');
document.getElementById('searchResults').innerHTML='';
">

👤 ${user.name}

</div>

`;

}

});

// Technicians

window.allTechnicians.forEach(
tech=>{

if(
(tech.name || "")
.toLowerCase()
.includes(value)
){

html += `

<div
class="search-item"
onclick="
viewTechnician(
'${tech.id}'
)
">

👨‍🔧 ${tech.name}

</div>

`;

}

});

// Bookings

window.allBookings.forEach(
booking=>{

if(
(booking.service || "")
.toLowerCase()
.includes(value)
){

html += `

<div
class="search-item"
onclick="
showSection('bookingsSection');
document.getElementById('searchResults').innerHTML='';
">

📅 ${booking.service}

</div>

`;

}

});

results.innerHTML =
html;

}
);


document.addEventListener(
"click",
function(e){

if(
!e.target.closest(
".search-section"
)
){

document.getElementById(
"searchResults"
).innerHTML = "";

}

}
);

// ================================
// Booking Filters
// ================================

function filterBookings(status){

const cards =
document.querySelectorAll(
".booking-card"
);

cards.forEach(card=>{

if(
status === "All"
){

card.style.display =
"block";

return;

}

if(
card.innerText.includes(
status
)
){

card.style.display =
"block";

}
else{

card.style.display =
"none";

}

});

}