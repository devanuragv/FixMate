FixMate 🔧

A modern home-service management platform connecting customers,
technicians, and administrators through a complete service-booking
workflow.

Features

Customer

Registration and login

Google authentication with Firebase

Customer dashboard

Service booking

Location/address support

Future date and time selection with 15-minute intervals

Booking history

Rating and review for completed services

Profile and saved address

Customer support

Technician

Dedicated technician login

Technician dashboard

View assigned jobs

Update job/service status

Availability management

Profile management

Customer reviews and overall rating

Admin

Admin dashboard

User management

Booking management

Technician management

Add/edit/delete technicians

Assign technicians to bookings

Pending/completed service tracking

Available/offline technician tracking

Individual service rating and customer feedback

Service Workflow

Customer → Create Booking → Admin Assigns Technician → Technician Completes Service → Customer Rates Service → Admin Views Feedback

Tech Stack

HTML5, CSS3, JavaScript

Node.js and Express.js

REST APIs

JWT authentication

Firebase Authentication

Cloud Firestore

Firebase Admin SDK

Flatpickr

Git and GitHub

Project Structure

FixMate/
├── frontend/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── booking.html
│   ├── history.html
│   ├── profile.html
│   ├── customer-support.html
│   ├── technician-login.html
│   ├── technician-dashboard.html
│   ├── admin-login.html
│   └── admin-dashboard.html
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── firebase/
│   └── server.js
└── README.md

Authentication

Customer email/password login uses the FixMate backend and JWT
authentication. Google login uses Firebase Authentication and exchanges
the Firebase ID token with the FixMate backend for a normal FixMate JWT.

Authenticated API requests use:

Authorization: Bearer <token>

Booking System

Bookings contain service details, issue description, customer
information, address/location, city, state, pincode, date, and time.
Past dates are disabled and booking times use 15-minute intervals.
Today's booking time is restricted to future slots.

Rating & Review

Customers can rate completed services and submit written feedback. The
review is associated with the specific booking and technician. The
technician's overall rating is recalculated from submitted reviews,
while the Admin Dashboard can show the rating and feedback for an
individual completed service.

Design

FixMate uses a dark premium UI with Poppins typography and orange
accents.

Element          Value

Background       #0b0b0f
Cards / Panels   #111116
Inputs           #0d0d12
Primary Orange   #ff7100
Orange Hover     #ff8a1f
Main Text        #ffffff
Muted Text       #8f929d
Borders          #282830

Local Setup

1. Clone

git clone <YOUR_GITHUB_REPOSITORY_URL>
cd FixMate

2. Install backend dependencies

cd backend
npm install

3. Configure Firebase and environment variables

Configure the backend Firebase Admin credentials and required
environment variables locally. Never commit private credentials.

4. Start the backend

Use the npm start script configured by the project, for example:

npm start

5. Run the frontend

Serve the frontend directory with a local static development server
such as VS Code Live Server.

Security

Never commit:

backend/firebase/serviceAccountKey.json
.env
.env.*

The Firebase browser/Web SDK configuration is separate from the Firebase
Admin service-account private key. The Admin credentials must remain
private.

Testing Checklist

Customer registration/login

Google login

Create booking

Verify booking appears in Admin

Assign technician

Verify assigned job for technician

Complete service

Submit customer rating/review

Verify individual service rating/feedback in Admin

Verify technician overall rating

Test profile/address updates

Test logout and protected pages

Project Status

FixMate is currently under active development and local testing.
Deployment will be handled after the core customer, technician, and
admin workflows are finalized and tested end-to-end.

Author

Dev Anurag Varshney

License

A project license can be added
