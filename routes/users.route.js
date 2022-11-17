const { getUsers } = require("../controllers/articles.controller");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

module.exports = usersRouter;
