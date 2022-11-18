const { selectTopics, insertTopic } = require("../models/topics.model.js");

exports.getTopics = (req, res) => {
    return selectTopics().then((topics) => {
        res.status(200).send({ topics });
    });
};

exports.postTopic = (req, res, next) => {
    insertTopic(req.body)
        .then((topic) => {
            res.status(201).send({ topic });
        })
        .catch(next);
};
