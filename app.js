const express = require("express");
const app = express();

const {
    getUsers,
    deleteCommentById,
    getEndpoints
} = require("./controllers/articles.controller.js");
const {
    customErrorHandler,
    lastResort500Error,
    psqlErrorHandler
} = require("./errors/error-handler.js");
const articlesRouter = require("./routes/articles.route.js");
const topicsRouter = require("./routes/topics.route.js");

app.use(express.json());

app.get("/api", getEndpoints);

app.use("/api/topics", topicsRouter);

app.use("/api/articles", articlesRouter);

app.get("/api/users", getUsers);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

// Error handling
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(lastResort500Error);

module.exports = app;
