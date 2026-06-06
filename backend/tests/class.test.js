import request from "supertest";
import app from "../server.js"; // ✅
describe("Class API", () => {

  let facultyToken;

  beforeAll(async () => {

    // Login faculty
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({
        email: "faculty@mgmjnec.org",
        password: "Password@123",
      });

    facultyToken = loginRes.body.token;
  });

  test("Faculty can create a class", async () => {

    const res = await request(app)
      .post("/api/classes")
      .set("Authorization", `Bearer ${facultyToken}`)
      .send({
        name: "AI/ML",
        code: "AIML101",
        department: "CSE",
        semester: 6,
        academicYear: "2025-2026",
        schedule: [
          {
            day: "Monday",
            startTime: "09:00",
            endTime: "10:00",
          },
        ],
      });

    expect(res.statusCode).toBe(201);

    expect(res.body.name).toBe("AI/ML");

    expect(res.body.code).toBe("AIML101");
  });

});