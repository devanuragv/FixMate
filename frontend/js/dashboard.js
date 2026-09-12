const token =
localStorage.getItem("fixmateToken");

if(!token){

    window.location.href =
    "login.html";

}


/* =========================================
   LOAD USER PROFILE
========================================= */

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


/* =========================================
   LOAD BOOKINGS
========================================= */

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


            /* Total Bookings */

            document.getElementById(
                "totalBookings"
            ).innerText =
            bookings.length;


            /* Pending Bookings */

            const pending =
            bookings.filter(
                b=>b.status==="Pending"
            ).length;

            document.getElementById(
                "pendingBookings"
            ).innerText =
            pending;


            /* Completed Bookings */

            const completed =
            bookings.filter(
                b=>b.status==="Completed"
            ).length;

            document.getElementById(
                "completedBookings"
            ).innerText =
            completed;


            /* Booking Table */

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


/* =========================================
   CUSTOMER SUPPORT
========================================= */

function openCustomerSupport(){

    window.location.href =
    "customer-support.html";

}


/* =========================================
   LOGOUT
========================================= */

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


/* =========================================
   INITIAL LOAD
========================================= */

loadProfile();

loadBookings();