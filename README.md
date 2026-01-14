# 🎯 AttendEase – Smart Attendance Management System

AttendEase is a **full‑stack web application** designed to simplify and digitize attendance management for educational institutions. It provides a **secure, role‑based, and analytics‑driven** platform where teachers can create classes, enroll students, mark attendance, and track insights — all through a modern, responsive UI.

Built with **MERN stack principles**, AttendEase focuses on clean architecture, scalability, and real‑world backend practices.

---

## 🚀 Key Highlights

* 🔐 **JWT‑based Authentication & Authorization**
* 👨‍🏫 **Role‑based Access Control (Admin / Teacher / Student)**
* 🏫 **Class & Student Management**
* 📊 **Attendance Analytics & History Tracking**
* ⚡ **Modern React + Vite Frontend**
* 🎨 **Tailwind CSS UI with Responsive Design**
* 🧠 **Well‑structured Backend (MVC Pattern)**

---

## 🧩 Tech Stack

### Frontend

* **React (Vite)**
* **React Router**
* **Context API (AuthContext)**
* **Tailwind CSS**
* **Protected Routes**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB & Mongoose**
* **JWT Authentication**
* **Middleware‑based Security**

---

## 📂 Project Structure

```
attendance-system/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── attendanceController.js
│   │   ├── authController.js
│   │   └── classController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Class.js
│   │   ├── QRSession.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   └── classRoutes.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── AttendanceHistory.jsx
│   │   │   ├── Classes.jsx
│   │   │   ├── ClassDetails.jsx
│   │   │   ├── CreateClass.jsx
│   │   │   ├── EnrollStudents.jsx
│   │   │   ├── MarkAttendance.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🔐 Authentication & Security

* Secure **JWT‑based authentication**
* Middleware‑level request protection
* Token verification before accessing protected routes
* Clean separation of **authentication** and **authorization** logic

```js
protect → checks if user is logged in
authorize → checks if user has required role
```

---

## 📊 Core Features Explained

### 🏫 Class Management

* Create & manage multiple classes
* View class details and enrolled students
* Structured class‑student relationship using MongoDB

### 📝 Attendance System

* Mark attendance for students
* Store attendance records securely
* Retrieve attendance history by class or student

### 📈 Analytics Dashboard

* Class‑wise attendance insights
* Aggregated attendance statistics
* Helps identify patterns and irregularities

### 🔒 Protected Routes

* Frontend routes protected using `PrivateRoute`
* Unauthorized users are redirected to login

---

## 🧠 Architecture & Best Practices

* MVC‑style backend structure
* Reusable controllers & services
* Centralized error handling
* Scalable folder organization
* Clean separation of frontend & backend

---

## ⚙️ Environment Setup

### Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Run Locally

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```





## 👤 Author

**Omar Ali Khan**
Full‑Stack Developer | MERN Stack

* GitHub: [https://github.com/omarKhan](https://github.com/omarKhan)

---

⭐ If you find this project impressive, don’t forget to star the repository!
