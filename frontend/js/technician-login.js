window.onload = () => {

document.getElementById(
"email"
).value = "";

document.getElementById(
"password"
).value = "";

};

window.addEventListener(
"load",
()=>{

document.getElementById(
"email"
).value = "";

document.getElementById(
"password"
).value = "";

}
);

function showToast(
message,
type="error"
){

const toast =
document.getElementById(
"toast"
);

toast.innerText =
message;

toast.className =
`toast ${type}`;

toast.classList.add(
"show"
);

setTimeout(()=>{

toast.classList.remove(
"show"
);

},3000);

}

document.getElementById(
"loginBtn"
).addEventListener(
"click",
async()=>{

const email =
document.getElementById(
"email"
).value;

const password =
document.getElementById(
"password"
).value;

const loginBtn =
document.getElementById(
"loginBtn"
);

loginBtn.innerHTML =
"Signing In...";

loginBtn.disabled = true;

loginBtn.classList.add(
"loading"
);

try{

const response =
await fetch(
"/api/technician-auth/login",
{
method:"POST",
headers:{
"Content-Type":
"application/json"
},
body:JSON.stringify({
email,
password
})
}
);

const data =
await response.json();

loginBtn.innerHTML =
"Login";

loginBtn.disabled = false;

loginBtn.classList.remove(
"loading"
);

if(data.success){

showToast(
"Login Successful",
"success"
);

localStorage.setItem(
"technicianToken",
data.token
);

localStorage.setItem(
"technician",
JSON.stringify(
data.technician
)
);

setTimeout(()=>{

window.location.href =
"/technician-dashboard.html";

},1500);

}else{

loginBtn.innerHTML =
"Login";

loginBtn.disabled = false;

loginBtn.classList.remove(
"loading"
);

showToast(
data.message,
"error"
);

}

}catch(error){

loginBtn.innerHTML =
"Login";

loginBtn.disabled = false;

loginBtn.classList.remove(
"loading"
);

console.log(error);

}

});

const togglePassword =
document.getElementById(
"togglePassword"
);

const password =
document.getElementById(
"password"
);

togglePassword.addEventListener(
"click",
()=>{

if(
password.type ===
"password"
){

password.type =
"text";

togglePassword.innerHTML =
"🙈";

}
else{

password.type =
"password";

togglePassword.innerHTML =
"👁";

}

}
);