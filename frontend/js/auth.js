const API_URL = "/api";

// REGISTER
const registerForm =
document.getElementById("registerForm");

if(registerForm){

registerForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const name =
document.getElementById("name").value;

const email =
document.getElementById("email").value;

const phone =
document.getElementById("phone").value;

const password =
document.getElementById("password").value;

const response =
await fetch(
`${API_URL}/auth/register`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name,
email,
phone,
password
})
}
);

const data =
await response.json();

if(data.success){

alert("Registration Successful");

window.location.href =
"login.html";

}else{

alert(data.message);

}

});
}

// LOGIN
const loginForm =
document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener(
"submit",
async(e)=>{

e.preventDefault();

const email =
document.getElementById("loginEmail").value;

const password =
document.getElementById("loginPassword").value;

const response =
await fetch(
`${API_URL}/auth/login`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
password
})
}
);

const data =
await response.json();

if(data.success){

localStorage.setItem(
"fixmateToken",
data.token
);

localStorage.setItem(
"user",
JSON.stringify(data.user)
);

window.location.href =
"dashboard.html";

}else{

alert(data.message);

}

});
}