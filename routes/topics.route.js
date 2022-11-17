const { getTopics } = require("../controllers/topics.controller");

const topicsRouter = require("express").Router();

topicsRouter.get("/", getTopics);

module.exports = topicsRouter;
