const express = require("express");
const app = express();

const {
    getArticles,
    getArticleById,
    getCommentsByArticleId,
    postCommentByArticleId
} = require("./controllers/articles.controller.js");
const { getTopics } = require("./controllers/topics.controller.js");
const {
    customErrorHandler,
    lastResort500Error,
    psqlErrorHandler
} = require("./errors/error-handler.js");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

// Error handling
app.use(psqlErrorHandler);
app.use(customErrorHandler);
app.use(lastResort500Error);

module.exports = app;
