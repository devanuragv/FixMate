const token =
localStorage.getItem("fixmateToken");

if(!token){
window.location.href="login.html";
}

const serviceInput =
document.getElementById("service");

const cards =
document.querySelectorAll(".service-card");

cards.forEach(card=>{

card.addEventListener("click",()=>{

cards.forEach(c=>
c.classList.remove("active")
);

card.classList.add("active");

serviceInput.value =
card.dataset.service;

});

});

document
.getElementById("bookingForm")
.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const service =
document.getElementById("service").value;

const customerName =
document.getElementById(
"customerName"
).value;

const customerPhone =
document.getElementById(
"customerPhone"
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
document.getElementById("issue").value;

const location =
document.getElementById("location").value;

const bookingDate =
document.getElementById("bookingDate").value;

const bookingTime =
document.getElementById("bookingTime").value;

try{

const response =
await fetch(
"/api/bookings/create",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({

customerName,
customerPhone,

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

const data =
await response.json();

if(data.success){

alert(
"Booking Created Successfully"
);

window.location.href =
"history.html";

}else{

alert(data.message);

}

}catch(error){

console.log(error);

}

});