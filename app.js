const express = require("express");
const app = express();

const {
    getArticles,
    getArticleById,
    getCommentsByArticleId
} = require("./controllers/articles.controller.js");
const { getTopics } = require("./controllers/topics.controller.js");
const {
    customErrorHandler,
    lastResort500Error
} = require("./errors/error-handler.js");

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

// Error handling
app.use(customErrorHandler);
app.use(lastResort500Error);

module.exports = app;
