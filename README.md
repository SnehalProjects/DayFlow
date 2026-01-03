Dayflow HRMS

Dayflow is a lightweight Human Resource Management System built for small to mid-size teams. It focuses on employee profiles, attendance tracking, and time-off management with a clean UI and offline-friendly frontend.

Features
Authentication

Secure login system

Role-based access (Admin / HR / Employee)

Auto-generated employee IDs

Employee Management

Employee listing with profile cards

View-only employee profiles

Detailed profile sections:

Resume

Personal information

Salary (Admin/HR only)

Attendance

Daily check-in / check-out

Day-wise attendance view for employees

Admin/HR can view attendance of all employees

Monthly summary (present days, leaves, total working days)

Attendance data used for payroll calculations

Time Off

Paid, Sick, and Unpaid leave types

Leave balance tracking

Employees can apply for leave

Admin/HR can approve or reject requests

Sick leave requires document upload

Leave data impacts payable days

Offline Support

React PWA setup

IndexedDB used for caching user data and UI state

App remains usable during temporary network loss

Tech Stack
Frontend

React.js (PWA)

React Router

Axios

IndexedDB

Backend

Node.js

Express.js

Database

MySQL

Project Structure
dayflow-hrms/
├── client/              # React frontend
├── server/              # Node + Express backend
├── dayflow_hrms.sql     # Database schema
└── README.md

Setup Instructions
1. Clone the repository
git clone https://github.com/SnehalProjects/DayFlow.git
cd dayflow-hrms

2. Database setup

Import dayflow_hrms.sql into MySQL using phpMyAdmin

Update DB credentials in backend config

3. Backend
cd server
npm install
npm start

4. Frontend
cd client
npm install
npm start


App will run at:

http://localhost:3000

Salary tab is visible only to Admin and HR roles

Attendance directly affects payroll calculations

Missing attendance or unpaid leave reduces payable days

First-time users must complete profile details

Status

Core modules completed

UI aligned with wireframes

Backend APIs integrated

Ready for testing & iteration
