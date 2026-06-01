import request from "supertest";
import app from "../server.js";

describe("Login API", () => {

  test("should login successfully", async () => {

    // Create a fresh user first
    const email = `login${Date.now()}@gmail.com`;

    await request(app)
      .post("/api/auth/register")
      .send({
        name: "Login User",
        email,
        password: "Password@123",
        role: "student",
        studentId: `${Math.floor(Math.random() * 1000000)}`
      });

    // Now login with that user
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email,
        password: "Password@123"
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.email).toBe(email);

  });

});