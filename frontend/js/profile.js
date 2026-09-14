const API_URL = "/api";

const token =
    localStorage.getItem("fixmateToken");

if (!token) {

    window.location.href =
        "login.html";

}


// ======================
// Load Profile
// ======================

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/users/profile`,
                {
                    method: "GET",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "Profile Response:",
            data
        );

        if (data.success) {

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

        } else {

            console.log(
                "Failed to load profile:",
                data.message
            );

        }

    }
    catch (error) {

        console.log(
            "Profile loading error:",
            error
        );

    }

}


loadProfile();


// ======================
// Update Profile
// ======================

document
    .getElementById("profileForm")
    .addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();

            try {

                const response =
                    await fetch(
                        `${API_URL}/users/profile`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        document
                                            .getElementById(
                                                "name"
                                            )
                                            .value
                                            .trim(),

                                    phone:
                                        document
                                            .getElementById(
                                                "phone"
                                            )
                                            .value
                                            .trim(),

                                    city:
                                        document
                                            .getElementById(
                                                "city"
                                            )
                                            .value
                                            .trim(),

                                    state:
                                        document
                                            .getElementById(
                                                "state"
                                            )
                                            .value
                                            .trim(),

                                    pincode:
                                        document
                                            .getElementById(
                                                "pincode"
                                            )
                                            .value
                                            .trim(),

                                    location:
                                        document
                                            .getElementById(
                                                "location"
                                            )
                                            .value
                                            .trim()

                                })
                        }
                    );


                const data =
                    await response.json();


                console.log(
                    "Update Profile Response:",
                    data
                );


                if (data.success) {

                    alert(
                        data.message ||
                        "Profile updated successfully"
                    );

                }
                else {

                    alert(
                        data.message ||
                        "Failed to update profile"
                    );

                }

            }
            catch (error) {

                console.log(
                    "Profile update error:",
                    error
                );

                alert(
                    "Something went wrong while updating profile."
                );

            }

        }
    );