const API_URL = "BACKEND_URL/api";

/* =====================================================
   FIXMATE IN-APP NOTIFICATION
   No browser alert()
===================================================== */

function showToast(type, message) {

    let container = document.getElementById("fixmateToastContainer");

    // Create notification container if it doesn't exist
    if (!container) {

        container = document.createElement("div");

        container.id = "fixmateToastContainer";

        container.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            width: min(380px, calc(100vw - 32px));
            pointer-events: none;
        `;

        document.body.appendChild(container);
    }


    const toast = document.createElement("div");

    let icon = "✓";

    if (type === "error") {
        icon = "!";
    } else if (type === "warning") {
        icon = "!";
    }


    toast.innerHTML = `
        <div style="
            width: 38px;
            height: 38px;
            min-width: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${type === "success"
                ? "rgba(22, 199, 132, 0.14)"
                : type === "warning"
                ? "rgba(255, 193, 7, 0.14)"
                : "rgba(255, 75, 75, 0.14)"
            };
            color: ${type === "success"
                ? "#18c98b"
                : type === "warning"
                ? "#ffc107"
                : "#ff5b5b"
            };
            font-size: 18px;
            font-weight: 800;
        ">
            ${icon}
        </div>

        <div style="
            flex: 1;
            color: #f5f5f5;
            font-size: 13px;
            font-weight: 500;
            line-height: 1.5;
            word-break: break-word;
        ">
            ${message}
        </div>

        <button
            type="button"
            style="
                border: none;
                background: transparent;
                color: #777b86;
                font-size: 18px;
                cursor: pointer;
                padding: 2px 4px;
                line-height: 1;
            "
            aria-label="Close notification"
        >
            ×
        </button>
    `;


    toast.style.cssText = `
        width: 100%;
        min-height: 62px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid ${type === "success"
            ? "rgba(22, 199, 132, 0.25)"
            : type === "warning"
            ? "rgba(255, 193, 7, 0.25)"
            : "rgba(255, 75, 75, 0.25)"
        };
        background: rgba(17, 17, 22, 0.97);
        box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.45),
            0 0 25px rgba(255, 113, 0, 0.05);
        backdrop-filter: blur(12px);
        pointer-events: auto;
        transform: translateX(120%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        font-family: Poppins, sans-serif;
    `;


    container.appendChild(toast);


    // Animate in
    requestAnimationFrame(() => {

        toast.style.transform = "translateX(0)";
        toast.style.opacity = "1";

    });


    // Close button
    const closeButton = toast.querySelector("button");

    closeButton.addEventListener("click", () => {
        removeToast(toast);
    });


    // Automatically disappear
    setTimeout(() => {

        removeToast(toast);

    }, 4000);
}


/* =====================================================
   REMOVE TOAST
===================================================== */

function removeToast(toast) {

    if (!toast || !toast.parentElement) {
        return;
    }

    toast.style.transform = "translateX(120%)";
    toast.style.opacity = "0";

    setTimeout(() => {

        if (toast.parentElement) {
            toast.remove();
        }

    }, 300);
}


/* =====================================================
   REGISTER
===================================================== */

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            /*
             * Prevent accidental double submission
             */
            const submitButton =
                registerForm.querySelector(
                    'button[type="submit"]'
                );

            if (submitButton?.disabled) {
                return;
            }


            const name =
                document.getElementById("name").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const phone =
                document.getElementById("phone").value.trim();

            const password =
                document.getElementById("password").value;


            /*
             * Disable button immediately
             */
            if (submitButton) {

                submitButton.disabled = true;

                submitButton.dataset.originalText =
                    submitButton.innerHTML;

                submitButton.innerHTML =
                    `<span>Creating Account...</span>`;
            }


            try {

                /*
                 * BACKEND CONNECTION UNCHANGED
                 */
                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                phone,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    showToast(
                        "success",
                        "Registration successful! Redirecting to login..."
                    );


                    /*
                     * Keep existing redirect
                     */
                    setTimeout(() => {

                        window.location.href =
                            "login.html";

                    }, 800);


                } else {

                    showToast(
                        "error",
                        data.message ||
                        "Registration failed."
                    );


                    // Allow user to try again
                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            submitButton.dataset.originalText;
                    }
                }


            } catch (error) {

                console.error(
                    "Registration error:",
                    error
                );


                showToast(
                    "error",
                    "Unable to connect to the server. Please try again."
                );


                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        submitButton.dataset.originalText;
                }
            }

        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            /*
             * IMPORTANT:
             * Prevent multiple clicks while login request
             * is already running.
             */
            const submitButton =
                loginForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton?.disabled) {

                return;
            }


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            /*
             * Basic frontend validation
             */

            if (!email || !password) {

                showToast(
                    "warning",
                    "Please enter your email and password."
                );

                return;
            }


            /*
             * Disable login button IMMEDIATELY.
             *
             * This stops:
             *
             * click
             * click
             * click
             *
             * from creating 3 requests.
             */

            if (submitButton) {

                submitButton.disabled = true;

                submitButton.dataset.originalText =
                    submitButton.innerHTML;

                submitButton.innerHTML = `
                    <span>Logging in...</span>
                    <span class="btn-spinner"></span>
                `;
            }


            try {

                /*
                 * =================================================
                 * BACKEND CONNECTION IS EXACTLY THE SAME
                 * =================================================
                 */

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                /*
                 * Handle invalid/non-JSON server response
                 */

                let data;

                try {

                    data = await response.json();

                } catch (jsonError) {

                    throw new Error(
                        "Server returned an invalid response."
                    );
                }


                /* =================================================
                   LOGIN SUCCESS
                ================================================= */

                if (data.success) {

                    /*
                     * KEEP EXISTING TOKEN CONNECTION
                     */
                    localStorage.setItem(
                        "fixmateToken",
                        data.token
                    );


                    /*
                     * KEEP EXISTING USER CONNECTION
                     */
                    localStorage.setItem(
                        "user",
                        JSON.stringify(data.user)
                    );


                    /*
                     * Read role directly from JWT
                     *
                     * Same logic as your original code.
                     */

                    const payload =
                        JSON.parse(
                            atob(
                                data.token.split(".")[1]
                            )
                        );


                    /*
                     * Small success notification
                     */

                    showToast(
                        "success",
                        "Login successful! Opening your dashboard..."
                    );


                    /*
                     * KEEP EXISTING ROLE-BASED REDIRECT
                     */

                    if (payload.role === "admin") {

                        window.location.href =
                            "admin-dashboard.html";

                    } else {

                        window.location.href =
                            "dashboard.html";

                    }


                } else {

                    /*
                     * Wrong email/password
                     * or backend validation error
                     */

                    showToast(
                        "error",
                        data.message ||
                        "Login failed. Please check your credentials."
                    );


                    /*
                     * Enable button again
                     */

                    if (submitButton) {

                        submitButton.disabled = false;

                        submitButton.innerHTML =
                            submitButton.dataset.originalText;
                    }
                }


            } catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                /*
                 * NETWORK / SERVER ERROR
                 */

                showToast(
                    "error",
                    "Unable to connect to the server. Please try again."
                );


                /*
                 * Allow another attempt
                 */

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        submitButton.dataset.originalText;
                }
            }

        }
    );
}

/* =====================================================
   GOOGLE LOGIN / REGISTER
   Firebase → FixMate Backend → FixMate JWT
===================================================== */

async function loginWithGoogle() {

    const googleLoginBtn =
        document.getElementById("googleLoginBtn");

    const googleRegisterBtn =
        document.getElementById("googleRegisterBtn");

    const button =
        googleLoginBtn || googleRegisterBtn;

    if (!button) {
        return;
    }

    if (button.disabled) {
        return;
    }

    try {

        button.disabled = true;

        button.innerHTML = `
            <span>Connecting to Google...</span>
        `;

        /*
         * Create Google provider
         */
        const provider =
            new firebase.auth.GoogleAuthProvider();

        /*
         * Ask Firebase to sign in with Google
         */
        const result =
            await firebase
                .auth()
                .signInWithPopup(provider);

        /*
         * Firebase user
         */
        const firebaseUser =
            result.user;

        if (!firebaseUser) {

            throw new Error(
                "Google authentication failed."
            );

        }

        /*
         * Get Firebase ID token
         *
         * This token is sent to our backend.
         */
        const firebaseIdToken =
            await firebaseUser.getIdToken(true);

        /*
         * Send Firebase token to FixMate backend
         */
        const response =
            await fetch(
                `${API_URL}/auth/google`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        idToken: firebaseIdToken
                    })
                }
            );

        /*
         * Read backend response
         */
        let data;

        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "Invalid response from FixMate server."
            );

        }

        /*
         * Backend successfully created
         * the normal FixMate JWT.
         */
        if (data.success) {

            /*
             * SAME TOKEN SYSTEM AS NORMAL LOGIN
             */
            localStorage.setItem(
                "fixmateToken",
                data.token
            );

            /*
             * SAME USER STORAGE AS NORMAL LOGIN
             */
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            showToast(
                "success",
                "Google login successful! Opening your dashboard..."
            );

            /*
             * Google customers are customers,
             * but keep this role check so the
             * backend remains the source of truth.
             */
            setTimeout(() => {

                if (data.user?.role === "admin") {

                    window.location.href =
                        "admin-dashboard.html";

                } else {

                    window.location.href =
                        "dashboard.html";

                }

            }, 500);

        } else {

            showToast(
                "error",
                data.message ||
                "Google login failed."
            );

            button.disabled = false;

            button.innerHTML = `
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    class="google-icon"
                    alt="Google">
                <span>Continue with Google</span>
            `;
        }

    } catch (error) {

        console.error(
            "Google authentication error:",
            error
        );

        /*
         * User closed the Google popup
         */
        if (
            error.code ===
            "auth/popup-closed-by-user"
        ) {

            showToast(
                "warning",
                "Google sign-in was cancelled."
            );

        } else if (
            error.code ===
            "auth/popup-blocked"
        ) {

            showToast(
                "error",
                "Google popup was blocked. Please allow popups and try again."
            );

        } else {

            showToast(
                "error",
                error.message ||
                "Unable to sign in with Google."
            );

        }

        button.disabled = false;

        button.innerHTML = `
            <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                class="google-icon"
                alt="Google">
            <span>Continue with Google</span>
        `;

    }
}


/* =====================================================
   GOOGLE BUTTON EVENTS
===================================================== */

const googleLoginBtn =
    document.getElementById("googleLoginBtn");

if (googleLoginBtn) {

    googleLoginBtn.addEventListener(
        "click",
        loginWithGoogle
    );

}


const googleRegisterBtn =
    document.getElementById("googleRegisterBtn");

if (googleRegisterBtn) {

    googleRegisterBtn.addEventListener(
        "click",
        loginWithGoogle
    );

}
