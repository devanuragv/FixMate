const SERVICE_CHARGES = {

Painter: 500,
Electrician: 400,
Plumber: 350,
Carpenter: 450,
"AC Repair": 800,
Mechanic: 600,
Cleaner: 300

};

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

let currentStatus =
technician.status ||
"Available";

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

function updateAvailabilityUI(){

if(
currentStatus ===
"Available"
){

switchBtn.checked = true;

statusText.innerText =
"Available";

}
else{

switchBtn.checked = false;

statusText.innerText =
"Offline";

}

}

updateAvailabilityUI();

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

// ================================
// Load Jobs
// ================================

async function loadJobs(){

try{

const response =
await fetch(
`/api/technician/jobs/${technician.id}`,
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

allJobs = jobs;

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
jobs
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
cursor:not-allowed;
">

Completed

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
<button
onclick="
updateStatus(
'${job.id}',
'In Progress'
)
">

Start Job

</button>
`
:
job.status === "In Progress"
?
`
<button
onclick="
updateStatus(
'${job.id}',
'Completed'
)
">

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
`/api/technician/status/${bookingId}`,
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
// Availability Switch
// ================================

switchBtn.addEventListener(
"change",
async ()=>{

try{

const newStatus =
switchBtn.checked
?
"Available"
:
"Offline";

const response =
await fetch(
`/api/technician/availability/${technician.id}`,
{
method:"PUT",
headers:{
"Content-Type":
"application/json",
Authorization:
`Bearer ${token}`
},
body:JSON.stringify({
status:newStatus
})
}
);

const data =
await response.json();

if(data.success){

currentStatus =
newStatus;

statusText.innerText =
newStatus;

technician.status =
newStatus;

localStorage.setItem(
"technician",
JSON.stringify(
technician
)
);

showToast(
"Status Updated",
"success"
);

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
"Failed To Update Status",
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
`/api/technician/reviews/${technician.id}`,
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

await loadJobs();

loadReviews();

loadEarnings();

}

initializeDashboard();

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
`/api/technician/reviews/${technician.id}`,
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

`/api/technician/profile/${technicianId}`,



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
`/api/technician/profile/${technician.id}`,
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

`/api/technician/change-password/${technician.id}`,

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
