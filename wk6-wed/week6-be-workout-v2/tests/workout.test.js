const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  const result = await api
    .post("/api/user/signup")
    .send({ email: "mattiv@matti.fi", password: "R3g5T7#gh" });
  token = result.body.token;
});

describe("when there is initially some workouts saved", () => {
  beforeEach(async () => {
    await Workout.deleteMany({});
    await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(workouts[0])
      .send(workouts[1]);
  });

  test("Workouts are returned as json", async () => {
    await api
      .get("/api/workouts")
      .set("Authorization", "bearer " + token)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("New workout added successfully", async () => {
    const newWorkout = {
      title: "testworkout",
      reps: 10,
      load: 100,
    };
    await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(newWorkout)
      .expect(201);
  });
  test("Workout deleted successfully", async () => {
    const newWorkout = {
      title: "testworkout",
      reps: 10,
      load: 100,
    };

    const workout = await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(newWorkout)
      .expect(201);
    await api
      .delete(`/api/workouts/${workout.body._id}`)
      .set("Authorization", "bearer " + token)
      .expect(200);
  });
  it("should update workout successfully", async () => {
    const newWorkout = { title: "testworkout", reps: 10, load: 100 };
    const updatedWorkout = { title: "testUpdate", reps: 100000, load: 100000 };

    const workout = await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(newWorkout)
      .expect(201);

    const updated = await api
      .patch(`/api/workouts/${workout.body._id}`)
      .set("Authorization", "bearer " + token)
      .send(updatedWorkout)
      .expect(200);

    expect(updated.body).toMatchObject(updatedWorkout);
  });

  it("should get workout by ID", async () => {
    const newWorkout = { title: "testworkout", reps: 10, load: 100 };

    const workout = await api
      .post("/api/workouts")
      .set("Authorization", "bearer " + token)
      .send(newWorkout)
      .expect(201);

    await api
      .get(`/api/workouts/${workout.body._id}`)
      .set("Authorization", "bearer " + token)
      .expect(200);
  });

});



afterAll(() => {
  mongoose.connection.close();
});
