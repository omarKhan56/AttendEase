//backend/app.js
import express from "express";

const app = express();

app.use(express.json());

// routes
app.use("/api/auth", authRoutes);

export default app;