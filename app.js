const express = require("express");
const {
    getArticles,
    getArticleById,
    patchArticleById
} = require("./controllers/articles.controller.js");
const app = express();
const { getTopics } = require("./controllers/topics.controller.js");

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

app.use((err, req, res, next) => {
    res.status(err.status).send({ msg: err.msg });
});

module.exports = app;
