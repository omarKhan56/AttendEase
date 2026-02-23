# 🎓 AttendEase – Smart Attendance Management & Analytics System

> **AttendEase** is a full‑stack, production‑ready web application designed to modernize and automate attendance management in educational institutions. It replaces manual, error‑prone  attendance processes with a **secure, scalable, and analytics‑driven digital solution** built using the **MERN stack**.

This project demonstrates **real‑world backend engineering**, clean frontend architecture, and practical implementation of authentication, authorization, and data modeling.

---

## 📸 Project Preview 
<img width="581" height="802" alt="Screenshot 2026-01-18 145452" src="https://github.com/user-attachments/assets/2664ef8f-3085-4920-bb64-f370ac895ae4" />
<img width="1529" height="715" alt="Screenshot 2026-01-18 145721" src="https://github.com/user-attachments/assets/bb1e6875-441f-4d3a-aa4d-3712d20ba152" />
<img width="1550" height="592" alt="Screenshot 2026-01-18 145815" src="https://github.com/user-attachments/assets/c96152a0-2b33-40e7-8056-0c86f0a9f2a6" />
<img width="1489" height="622" alt="Screenshot 2026-01-18 145912" src="https://github.com/user-attachments/assets/ea4256cf-bd8b-4dcf-a1ea-c501531df7f5" />
<img width="894" height="864" alt="Screenshot 2026-01-18 145933" src="https://github.com/user-attachments/assets/28766241-89d2-4621-9876-2147719ae0e9" />







---

## 🚀 Why AttendEase?

Attendance tracking is a core academic requirement, yet many systems are still manual or poorly designed. AttendEase focuses on:

* Eliminating manual errors
* Improving transparency for students & faculty
* Providing actionable attendance analytics
* Enforcing secure access through role-based authorization

This project is built with **scalability and maintainability** in mind, following industry‑level folder structure and coding practices.

---

## ✨ Key Features

### 🔐 Authentication & Authorization

* Secure **JWT-based authentication**
* Role-based access control (**Admin / Faculty / Student**)
* Protected backend APIs using middleware
* Protected frontend routes using `PrivateRoute`

### 🏫 Class Management

* Faculty can create and manage classes
* Students can enroll in assigned classes
* Centralized class‑student relationship handling

### 📝 Attendance Management

* Mark attendance securely
* Store attendance records per student per class
* Prevent duplicate attendance entries
* Retrieve detailed attendance history

### 📊 Analytics & Insights

* Class‑wise attendance statistics
* Student attendance history
* Analytics endpoints optimized for aggregation
* Designed for future chart‑based visualization

### 🎨 Modern UI

* Responsive design using **Tailwind CSS**
* Clean and minimal UI
* Component‑based React architecture

---

## 🧩 Tech Stack

### Frontend

* **React (Vite)** – fast development & build
* **React Router** – client‑side routing
* **Context API** – authentication state management
* **Tailwind CSS** – modern utility‑first styling

### Backend

* **Node.js** – runtime environment
* **Express.js** – REST API framework
* **MongoDB + Mongoose** – database & schema modeling
* **JWT** – stateless authentication
* **Middleware** – security & request control

---

## 🗂️ Project Structure (Scalable & Clean)

```
attendance-system/
│
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth & role protection
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   └── server.js         # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Global auth state
│   │   ├── pages/        # Application pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── index.html
│
├── .env
├── package.json
└── README.md
```

---

## 🔒 Security Implementation

Security is handled at multiple levels:

* **JWT tokens** for stateless authentication
* **Auth middleware** to protect APIs
* **Role validation** before accessing sensitive routes
* Secure password storage using hashing
* Environment variables for secrets

```js
protect → verifies login
authorize → verifies user role
```

---

## 🧠 Backend Architecture

* MVC‑inspired structure
* Controllers handle logic only
* Routes remain clean and readable
* Models manage data relationships
* Middleware isolates security concerns

This structure makes the project:

* Easy to debug
* Easy to scale
* Easy to onboard new developers

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
Full‑Stack Developer (MERN)

* GitHub: [https://github.com/omarKhan](https://github.com/omarKhan)

---

⭐ If you like this project, consider giving it a star — feedback is always appreciated!

