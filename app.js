const express = require("express");
const app = express();

const {
    customErrorHandler,
    lastResort500Error,
    psqlErrorHandler
} = require("./errors/error-handler.js");
const endpointsJSON = require("./endpoints.json");
const articlesRouter = require("./routes/articles.route.js");
const commentsRouter = require("./routes/comments.route.js");
const topicsRouter = require("./routes/topics.route.js");
const usersRouter = require("./routes/users.route.js");

app.use(express.json());

app.use("/api/topics", topicsRouter);

app.use("/api/articles", articlesRouter);

app.use("/api/users", usersRouter);

app.use("/api/comments", commentsRouter);

app.get("/api", (req, res) => {
    res.status(200).json({ endpoints: endpointsJSON });
});

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

// Error handling
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(lastResort500Error);

module.exports = app;
