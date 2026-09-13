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
// Toast Message
// ================================

function showToast(
message,
type="success"
){

const toast =
document.getElementById(
"toast"
);

toast.innerText =
message;

toast.className =
type;

toast.classList.add(
"show"
);

setTimeout(()=>{

toast.classList.remove(
"show"
);

},3000);

}

// ================================
// Load Profile
// ================================

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

if(!data.success){

showToast(
data.message,
"error"
);

return;

}

const tech =
data.technician;

document.getElementById(
"name"
).value =
tech.name || "";

document.getElementById(
"email"
).value =
tech.email || "";

document.getElementById(
"phone"
).value =
tech.phone || "";

document.getElementById(
"serviceType"
).value =
tech.serviceType || "";

document.getElementById(
"city"
).value =
tech.city || "";

document.getElementById(
"state"
).value =
tech.state || "";

document.getElementById(
"pincode"
).value =
tech.pincode || "";

document.getElementById(
"experience"
).value =
tech.experience || "";

}
catch(error){

console.log(error);

showToast(
"Failed To Load Profile",
"error"
);

}

}

// ================================
// Save Profile
// ================================

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
`/api/technician/profile/${technician.id}`,
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
).value,

experience:
document.getElementById(
"experience"
).value

})
}
);

const data =
await response.json();

if(data.success){

technician.name =
document.getElementById(
"name"
).value;

localStorage.setItem(
"technician",
JSON.stringify(
technician
)
);

showToast(
"Profile Updated Successfully",
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
"Update Failed",
"error"
);

}

}
);

// ================================
// Initial Load
// ================================

loadProfile();