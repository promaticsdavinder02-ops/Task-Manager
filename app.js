const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const user_router = require("./routes/user_route");
const board_router = require("./routes/board_route");
const list_router = require("./routes/list_route");
const task_router = require("./routes/task_route");
const comment_router = require("./routes/comment_route");

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log("Database error :", err);
  });

app.use(express.json());
app.use(cors());

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.use("/api/users", user_router);
app.use("/api/boards", board_router);
app.use("/api/lists", list_router);
app.use("/api/tasks", task_router);
app.use("/api/comments", comment_router);

app.listen(process.env.PORT, () => {
  console.log("server is running on port :", process.env.PORT);
});
