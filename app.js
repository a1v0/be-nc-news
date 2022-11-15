const express = require("express");
const {
    getArticles,
    getArticleById
} = require("./controllers/articles.controller.js");
const app = express();
const { getTopics } = require("./controllers/topics.controller.js");

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

app.use((err, req, res, next) => {
    res.status(err.status).send({ msg: err.msg });
});

module.exports = app;
