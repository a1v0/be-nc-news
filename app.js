const express = require("express");
const app = express();

const { getEndpoints } = require("./controllers/articles.controller.js");
const {
    customErrorHandler,
    lastResort500Error,
    psqlErrorHandler
} = require("./errors/error-handler.js");
const articlesRouter = require("./routes/articles.route.js");
const commentsRouter = require("./routes/comments.route.js");
const topicsRouter = require("./routes/topics.route.js");
const usersRouter = require("./routes/users.route.js");

app.use(express.json());

app.get("/api", getEndpoints);

app.use("/api/topics", topicsRouter);

app.use("/api/articles", articlesRouter);

app.use("/api/users", usersRouter);

app.use("/api/comments", commentsRouter);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

// Error handling
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(lastResort500Error);

module.exports = app;
