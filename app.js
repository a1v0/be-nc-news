const express = require("express");
const app = express();
const {
    getTopics,
    getArticles
} = require("./controllers/topics.controller.js");

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

app.use((err, req, res, next) => {
    res.status(err.status).send({ msg: err.msg });
});

module.exports = app;
