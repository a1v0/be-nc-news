const {
    selectArticles,
    selectArticleById,
    selectCommentsByArticleId
} = require("../models/articles.model.js");

exports.getArticles = (req, res) => {
    return selectArticles().then((articles) => {
        res.status(200).send({ articles });
    });
};

exports.getArticleById = (req, res, next) => {
    return selectArticleById(req.params.article_id, next)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch((err) => {
            next(err);
        });
};

exports.getCommentsByArticleId = (req, res, next) => {
    selectCommentsByArticleId(req.params.article_id).then((comments) => {
        res.status(200).send({ comments });
    });
};
