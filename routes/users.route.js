const { getUsers } = require("../controllers/users.controller.js");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

module.exports = usersRouter;
