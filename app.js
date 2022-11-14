const express = require("express");
const app = express();

app.use((req, res, next) => {
    console.log(Object.keys(req));
    console.log(req.originalUrl);
    next();
});

app.all("/*", (req, res, next) => {
    next({ status: 404, msg: "not found" });
});

app.use((err, req, res, next) => {
    res.status(err.status).send({ msg: err.msg });
});

module.exports = app;
