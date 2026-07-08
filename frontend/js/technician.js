const technicianId =
prompt(
"Enter Technician ID"
);

async function loadJobs(){

const response =
await fetch(
`/api/technician/jobs/${technicianId}`
);

const data =
await response.json();

let html = "";

data.jobs.forEach(job => {

html += `
<div class="job-card">

<h3>
${job.service}
</h3>

<p>
${job.issue}
</p>

<p>
${job.location}
</p>

<p>
Status:
${job.status}
</p>

<button
class="accept"
onclick="
updateStatus(
'${job.id}',
'Assigned'
)
">

Accept

</button>

<button
class="progress"
onclick="
updateStatus(
'${job.id}',
'In Progress'
)
">

In Progress

</button>

<button
class="complete"
onclick="
updateStatus(
'${job.id}',
'Completed'
)
">

Completed

</button>

</div>
`;

});

document.getElementById(
"jobsContainer"
).innerHTML = html;

}

async function updateStatus(
bookingId,
status
){

const response =
await fetch(
`/api/technician/status/${bookingId}`,
{
method:"PUT",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
status
})
}
);

const data =
await response.json();

alert(data.message);

loadJobs();

}

loadJobs();

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

if(!data.success) return;

const reviews =
data.reviews || [];

const container =
document.getElementById(
"reviewsContainer"
);

if(reviews.length===0){

container.innerHTML =
`
<p>
No Reviews Yet
</p>
`;

document.getElementById(
"averageRating"
).innerText = "0";

return;

}

let totalRating = 0;

let html =
`<div class="reviews-grid">`;

reviews.forEach(review=>{

totalRating +=
review.rating;

html += `

<div class="review-card">

<div class="review-rating">

${"⭐".repeat(review.rating)}

</div>

<div class="review-text">

${review.review || "No comment"}

</div>

<div class="review-date">

${new Date(
review.createdAt._seconds
? review.createdAt._seconds*1000
: review.createdAt
).toLocaleDateString()}

</div>

</div>

`;

});

html += "</div>";

container.innerHTML =
html;

const avg =
(
totalRating /
reviews.length
).toFixed(1);

document.getElementById(
"averageRating"
).innerText =
avg;

}
catch(error){

console.log(error);

}
}

loadJobs();
loadReviews();