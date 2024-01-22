const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const users = [];
const exercises = [];

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.json({ error: "Username is required" });
  }

  const user = { username, _id: users.length + 1 };
  users.push(user);
  res.json(user);
});

app.get("/api/users", (req, res) => {

  const user = users.map(({ username, _id }) => ({ username, _id }));
  res.json(user);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === parseInt(_id));

  if (!user) {
    return res.json({ error: "User not found" });
  }

  const exercise = {
    userId: user._id,
    description,
    duration: parseInt(duration),
    date: date ? new Date(date) : new Date(),
  };

  exercises.push(exercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === parseInt(_id));

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let userExercises = exercises.filter((e) => e.userId === user._id);

  if (from || to) {
    userExercises = userExercises.filter((e) => {
      const exerciseDate = new Date(e.date).getTime();
      return (
        (!from || exerciseDate >= new Date(from).getTime()) &&
        (!to || exerciseDate <= new Date(to).getTime())
      );
    });
  }

  userExercises = userExercises.slice(
    0,
    parseInt(limit) || userExercises.length
  );

  const log = userExercises.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date.toDateString(),
  }));

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
