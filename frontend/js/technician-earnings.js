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

async function loadEarnings(){

try{

const response =
await fetch(
`/api/technician/earnings/${technician.id}`,
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

alert(
data.message
);

return;

}

document.getElementById(
"totalEarnings"
).innerText =
`₹${data.totalEarnings}`;

document.getElementById(
"monthlyEarnings"
).innerText =
`₹${data.monthlyEarnings}`;

document.getElementById(
"weeklyEarnings"
).innerText =
`₹${data.weeklyEarnings}`;

document.getElementById(
"todayEarnings"
).innerText =
`₹${data.todayEarnings}`;

document.getElementById(
"completedJobs"
).innerText =
data.completedJobs;

const avgValue =
data.completedJobs > 0
?
Math.round(
data.totalEarnings /
data.completedJobs
)
:
0;

document.getElementById(
"avgJobValue"
).innerText =
`₹${avgValue}`;

loadServiceWise(
data.jobs
);

loadHistory(
data.jobs
);

}
catch(error){

console.log(error);

}

}

function loadServiceWise(
jobs
){

const serviceMap = {};

jobs.forEach(job=>{

if(
job.status ===
"Completed"
){

const service =
job.service;

const amount =
job.serviceCharge || 0;

serviceMap[service] =
(serviceMap[service] || 0)
+ amount;

}

});

let html = "";

Object.keys(serviceMap)
.forEach(service=>{

html += `

<div class="service-card">

<h3>
${service}
</h3>

<p>
₹${serviceMap[service]}
</p>

</div>

`;

});

document.getElementById(
"serviceWiseContainer"
).innerHTML =
html;

}

function loadHistory(
jobs
){

let html = "";

jobs
.filter(
job =>
job.status ===
"Completed"
)
.forEach(job=>{

html += `

<div class="history-card">

<h3>
${job.service}
</h3>

<p>
${job.location}
</p>

<p>
₹${job.serviceCharge}
</p>

</div>

`;

});

document.getElementById(
"earningHistory"
).innerHTML =
html;

}

loadEarnings();