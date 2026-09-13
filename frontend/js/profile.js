const token =
localStorage.getItem(
"fixmateToken"
);

if(!token){

window.location.href =
"login.html";

}

// ======================
// Load Profile
// ======================

async function loadProfile(){

try{

const response =
await fetch(
"/api/users/profile",
{
headers:{
Authorization:
`Bearer ${token}`
}
}
);

const data =
await response.json();

if(data.success){

document.getElementById(
"name"
).value =
data.user.name || "";

document.getElementById(
"email"
).value =
data.user.email || "";

document.getElementById(
"phone"
).value =
data.user.phone || "";

document.getElementById(
"city"
).value =
data.user.city || "";

document.getElementById(
"state"
).value =
data.user.state || "";

document.getElementById(
"pincode"
).value =
data.user.pincode || "";

document.getElementById(
"location"
).value =
data.user.location || "";

}

}catch(error){

console.log(error);

}

}

loadProfile();

// ======================
// Update Profile
// ======================

document
.getElementById(
"profileForm"
)
.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

try{

const response =
await fetch(
"/api/users/profile",
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
"name"
).value,

phone:
document.getElementById(
"phone"
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
).value

})
}
);

const data =
await response.json();

alert(data.message);

}catch(error){

console.log(error);

}

}
);