const {
    getUsers,
    getUserByUsername
} = require("../controllers/users.controller.js");

const usersRouter = require("express").Router();

usersRouter.get("/", getUsers);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
