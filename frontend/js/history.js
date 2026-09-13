const token =
localStorage.getItem("fixmateToken");

if (!token) {

window.location.href =
"login.html";

}

// ================================
// Load Bookings
// ================================
async function loadBookings() {

try {

const response =
await fetch(
"/api/bookings",
{
headers: {
Authorization:
`Bearer ${token}`
}
}
);

const data =
await response.json();

if (data.success) {

const container =
document.getElementById(
"bookingContainer"
);

if (
data.bookings.length === 0
) {

container.innerHTML = `
<div class="no-bookings">
<h2>No Bookings Found</h2>
</div>
`;

return;

}

let html = "";

data.bookings.forEach(
booking => {

console.log(booking);    

const statusClass =
booking.status
.toLowerCase()
.replace(" ", "-");

html += `
<div class="booking-card">

<h3>
${booking.service}
</h3>

<p>
<strong>Issue:</strong>
${booking.issue}
</p>

<p>
<strong>Location:</strong>
${booking.location}
</p>

<p>
<strong>Date:</strong>
${booking.bookingDate}
</p>

<p>
<strong>Time:</strong>
${booking.bookingTime}
</p>

<p>
<strong>Technician:</strong>
${booking.technician || "Not Assigned"}
</p>

<div class="card-actions">

${
booking.status?.toLowerCase() === "completed"
?
`
<div class="completed-service">

<div class="completed-icon">
✅
</div>

<div>

<h4>
Service Completed
</h4>

<p>
How was your experience?
</p>

</div>

</div>

<div class="rating-container">

<div
class="rating-stars ${
booking.reviewSubmitted
? "reviewed"
: ""
}"
data-booking="${booking.id}"
data-tech="${booking.technicianId}">

${[1,2,3,4,5]
.map(num => `
<span
data-rating="${num}"
class="${
booking.userRating >= num
? "active"
: ""
}">
★
</span>
`)
.join("")
}

</div>

</div>
`
:
`
<button
class="edit-btn"
onclick="editBooking('${booking.id}')">
Edit
</button>

<button
class="delete-btn"
onclick="deleteBooking('${booking.id}')">
Cancel
</button>
`
}

</div>

</div>
`;

});

container.innerHTML =
html;

setTimeout(()=>{

initializeRatings();

},300);

}

}
catch (error) {

console.log(error);

}

}

// ================================
// Delete Booking
// ================================
async function deleteBooking(id) {

const confirmDelete =
confirm(
"Cancel this booking?"
);

if (!confirmDelete) return;

try {

const response =
await fetch(
`/api/bookings/${id}`,
{
method: "DELETE",
headers: {
Authorization:
`Bearer ${token}`
}
}
);

console.log(response);

const data =
await response.json();

console.log(data);
alert(
data.message
);

loadBookings();

setTimeout(()=>{

initializeRatings();

},300);

}
catch (error) {

console.log(error);

}

}

// ================================
// Edit Booking
// ================================
async function editBooking(id) {

const newIssue =
prompt(
"Enter new issue"
);

if (!newIssue) return;

try {

const response =
await fetch(
`/api/bookings/${id}`,
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

alert(
data.message
);

loadBookings();

}
catch (error) {

console.log(error);

}

}

// ================================
// Initial Load
// ================================
loadBookings();

let selectedRating = 0;
let selectedBookingId = "";
let selectedTechnicianId = "";


function openReviewModal(
bookingId,
technicianId,
rating
){

selectedBookingId =
bookingId;

selectedTechnicianId =
technicianId;

selectedRating = rating;

document.getElementById(
"reviewModal"
).style.display =
"flex";

}

function closeReviewModal(){

document
.getElementById(
"reviewModal"
)
.style.display =
"none";

}

async function submitReview(){

    console.log("SUBMIT BUTTON CLICKED");

try{

if(
selectedRating === 0
){

alert(
"Please select rating"
);

return;

}

const review =
document.getElementById(
"reviewText"
).value;

const user =
JSON.parse(
localStorage.getItem(
"user"
)
);

const response =
await fetch(
"/api/reviews/add",
{
method:"POST",

headers:{
"Content-Type":
"application/json"
},

body:JSON.stringify({

bookingId:
selectedBookingId,

technicianId:
selectedTechnicianId,

userId:
user.id,

rating:
selectedRating,

review

})
}
);

const data =
await response.json();

alert(
data.message
);

closeReviewModal();

document.getElementById(
"reviewText"
).value = "";

selectedRating = 0;

loadBookings();

}
catch(error){

console.log(error);

alert(
"Failed To Submit Review"
);

}

}

function initializeRatings(){

console.log("Ratings Initialized");

document
.querySelectorAll(
".rating-stars"
)
.forEach(group=>{

if(
group.classList.contains(
"reviewed"
)
){
return;
}

const stars =
group.querySelectorAll(
"span"
);

let currentRating = 0;

stars.forEach(star=>{

star.addEventListener(
"mouseover",
()=>{

const hoverRating =
Number(
star.dataset.rating
);

stars.forEach(s=>{

if(
Number(
s.dataset.rating
) <= hoverRating
){

s.classList.add(
"active"
);

}
else{

s.classList.remove(
"active"
);

}

});

}
);

star.addEventListener(
"mouseout",
()=>{

stars.forEach(s=>{

if(
Number(
s.dataset.rating
) <= currentRating
){

s.classList.add(
"active"
);

}
else{

s.classList.remove(
"active"
);

}

});

}
);

star.addEventListener(
"click",
()=>{

console.log(
"STAR CLICKED"
);

currentRating =
Number(
star.dataset.rating
);

stars.forEach(s=>{

if(
Number(
s.dataset.rating
) <= currentRating
){

s.classList.add(
"active"
);

}
else{

s.classList.remove(
"active"
);

}

});

openReviewModal(
group.dataset.booking,
group.dataset.tech,
currentRating
);

}
);

});

});

}