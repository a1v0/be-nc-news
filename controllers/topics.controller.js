const { selectTopics, selectArticles } = require("../models/topics.model.js");

exports.getTopics = (req, res) => {
    return selectTopics().then((topics) => {
        res.status(200).send({ topics });
    });
};

exports.getArticles = (req, res) => {
    selectArticles().then((articles) => {
        res.status(200).send({ articles });
    });
};
