const token =
localStorage.getItem("fixmateToken");

if(!token){

window.location.href =
"login.html";

}

async function loadProfile(){

try{

const response =
await fetch(
"/api/users/profile",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data =
await response.json();

if(data.success){

document.getElementById(
"userName"
).innerText =
data.user.name;

}

}catch(error){

console.log(error);

}

}

async function loadBookings(){

try{

const response =
await fetch(
"/api/bookings",
{
headers:{
Authorization:`Bearer ${token}`
}
}
);

const data =
await response.json();

if(data.success){

const bookings =
data.bookings;

document.getElementById(
"totalBookings"
).innerText =
bookings.length;

const pending =
bookings.filter(
b=>b.status==="Pending"
).length;

document.getElementById(
"pendingBookings"
).innerText =
pending;

const completed =
bookings.filter(
b=>b.status==="Completed"
).length;

document.getElementById(
"completedBookings"
).innerText =
completed;

let rows="";

bookings.forEach(booking=>{

rows += `
<tr>
<td>${booking.service}</td>
<td>${booking.issue}</td>
<td>${booking.bookingDate}</td>
<td>${booking.status}</td>
</tr>
`;

});

document.getElementById(
"bookingTable"
).innerHTML =
rows;

}

}catch(error){

console.log(error);

}

}

function logout(){

localStorage.removeItem(
"fixmateToken"
);

localStorage.removeItem(
"user"
);

window.location.href =
"login.html";

}

loadProfile();
loadBookings();