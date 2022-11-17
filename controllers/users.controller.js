const {
    selectUsers,
    selectUserByUsername
} = require("../models/users.model.js");

exports.getUsers = (req, res) => {
    selectUsers().then((users) => {
        res.status(200).send({ users });
    });
};

exports.getUserByUsername = (req, res, next) => {
    selectUserByUsername(req.params.username)
        .then((user) => {
            res.status(200).send({ user });
        })
        .catch(next);
};
