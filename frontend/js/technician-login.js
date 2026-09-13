const API_URL = "http://localhost:5000/api";


// =========================================
// CLEAR LOGIN FIELDS
// =========================================

window.addEventListener("load", () => {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    if (emailInput) {
        emailInput.value = "";
    }

    if (passwordInput) {
        passwordInput.value = "";
    }

});


// =========================================
// TOAST
// =========================================

function showToast(
    message,
    type = "error"
) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        alert(message);
        return;
    }

    toast.innerText = message;

    toast.className =
        `toast ${type}`;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


// =========================================
// TECHNICIAN LOGIN
// =========================================

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        async () => {

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const loginBtn =
                document.getElementById(
                    "loginBtn"
                );


            // =================================
            // VALIDATION
            // =================================

            if (!email) {

                showToast(
                    "Please enter your email.",
                    "error"
                );

                return;
            }

            if (!password) {

                showToast(
                    "Please enter your password.",
                    "error"
                );

                return;
            }


            // =================================
            // LOADING
            // =================================

            loginBtn.innerHTML =
                "Signing In...";

            loginBtn.disabled = true;

            loginBtn.classList.add(
                "loading"
            );


            try {

                // =================================
                // BACKEND LOGIN
                // =================================

                const response =
                    await fetch(
                        `${API_URL}/technician-auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Technician Login Response:",
                    data
                );


                // =================================
                // RESET BUTTON
                // =================================

                loginBtn.innerHTML =
                    "Login";

                loginBtn.disabled = false;

                loginBtn.classList.remove(
                    "loading"
                );


                // =================================
                // SUCCESS
                // =================================

                if (data.success) {

                    showToast(
                        "Login Successful",
                        "success"
                    );


                    // Save technician token
                    localStorage.setItem(
                        "technicianToken",
                        data.token
                    );


                    // Save technician data
                    localStorage.setItem(
                        "technician",
                        JSON.stringify(
                            data.technician
                        )
                    );


                    // Redirect to dashboard
                    setTimeout(() => {

                        window.location.href =
                            "technician-dashboard.html";

                    }, 1000);


                }

                // =================================
                // LOGIN FAILED
                // =================================

                else {

                    showToast(
                        data.message ||
                        "Invalid email or password.",
                        "error"
                    );

                }

            }
            catch (error) {

                console.error(
                    "Technician login error:",
                    error
                );


                loginBtn.innerHTML =
                    "Login";

                loginBtn.disabled = false;

                loginBtn.classList.remove(
                    "loading"
                );


                showToast(
                    "Unable to connect to server.",
                    "error"
                );

            }

        }
    );


// =========================================
// PASSWORD TOGGLE
// =========================================

const togglePassword =
    document.getElementById(
        "togglePassword"
    );

const passwordInput =
    document.getElementById(
        "password"
    );


if (
    togglePassword &&
    passwordInput
) {

    togglePassword.addEventListener(
        "click",
        () => {

            if (
                passwordInput.type ===
                "password"
            ) {

                passwordInput.type =
                    "text";

                togglePassword.innerHTML =
                    "🙈";

            }
            else {

                passwordInput.type =
                    "password";

                togglePassword.innerHTML =
                    "👁";

            }

        }
    );

}