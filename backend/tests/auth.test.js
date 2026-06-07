//backend/tests/auth.test.js
import request from "supertest";
import app from "../server.js";

describe("Register API", () => {

  test("should register a student", async () => {

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: `test${Date.now()}@gmail.com`,
        password: "Password@123",
        role: "student",
        studentId: `${Math.floor(Math.random() * 1000000)}`
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty("token");

  });

});