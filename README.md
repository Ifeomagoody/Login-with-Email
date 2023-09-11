# Email Verification System using Node.js, Express, and MongoDB

## Introduction

This project is a Node.js-based email verification system built with Express and MongoDB. The system allows users to sign up, verify their email 

addresses, and use the application's features securely.

## Features

- User registration with email and password.


- Email verification with a unique verification link.


- Password hashing and salting for security.


- User authentication using sessions.


- MongoDB for data storage.


## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed.


- MongoDB server installed and running.


- SMTP email service (e.g., Gmail) credentials for sending verification emails.


## Installation


1. Clone the repository:

   
   git clone https://github.com/yourusername/email-verification-nodejs.git



2. Navigate to the project directory:

   cd email-verification-nodejs


3.  Install dependencies:

       npm install


4.  Create a .env file in the project root directory with the following environment variables:


PORT=5000


MONGO_URI=your_mongodb_uri


SESSION_SECRET=your_session_secret


SMTP_EMAIL=your_smtp_email


SMTP_PASSWORD=your_smtp_password



5. Start the application:

npm start


6. The application should be running at http://localhost:5000.


 ## Usage


Register a new account by providing your email and password.


Check your email for a verification link.


Click the verification link to verify your email address.


Once verified, you can log in and access the application's features.


## Folder Structure


/config: Configuration files, including environment variables.


/controllers: Express controllers for handling routes and business logic.


/models: MongoDB data models.


/routes: Express routes.


/views: HTML templates (e.g., for email templates).


/public: Public assets (e.g., CSS, JavaScript).


/middlewares: Custom middlewares.


/utils: Utility functions.


 ## Contributing


Fork the repository.


Create a new branch for your feature: git checkout -b feature-name.


Commit your changes: git commit -m 'Add some feature'.


Push to your branch: git push origin feature-name.


Submit a pull request.


## License


This project is licensed under the MIT License.



