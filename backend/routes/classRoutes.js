//backend/routes/classRoutes.js
import express from 'express';
import rateLimit from "express-rate-limit";
import { protect, authorize } from '../middleware/authMiddleware.js';

import {
  createClass,
  getClasses,
  getClassById,
  enrollStudent,
} from "../controllers/classController.js";
const router = express.Router();

router.post("/", protect, authorize("faculty", "admin"), createClass);

router.get("/", protect, getClasses);

router.get("/:id", protect, getClassById);

router.post(
  "/enroll",
  protect,
  authorize("faculty", "admin"),
  enrollStudent
);

export default router;

/* Role:

Class creation & enrollment

Role-based access:

Students  cannot create classes

Faculty/Admin */


/*Client (Frontend)
        ↓
        Routes
        ↓
   Middleware (Auth / Role) Middleware is code that runs between the request and the controller.
        ↓
   Controllers (Logic)
        ↓
   Models (Mongoose)
        ↓
   MongoDB
        ↓
   Response → Client
 */