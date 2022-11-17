const express = require("express");
const app = express();

const {
    getArticles,
    getArticleById,
    patchArticleById,
    getCommentsByArticleId,
    postCommentByArticleId,
    getUsers,
    deleteCommentById,
    getEndpoints
} = require("./controllers/articles.controller.js");
const {
    customErrorHandler,
    lastResort500Error,
    psqlErrorHandler
} = require("./errors/error-handler.js");

app.use(express.json());

const topicsRouter = require("./routes/topics.route.js");
app.use("/api/topics", topicsRouter);

app.get("/api", getEndpoints);

app.get("/api/articles", getArticles);

app.route("/api/articles/:article_id")
    .get(getArticleById)
    .patch(patchArticleById);

app.route("/api/articles/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId);

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
