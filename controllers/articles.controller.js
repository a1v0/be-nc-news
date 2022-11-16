const {
    selectArticles,
    selectArticleById,
    updateArticleById
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
exports.patchArticleById = (req, res, next) => {
    updateArticleById(req.params.article_id, req.body.inc_votes, next).then(
        (article) => {
            res.status(200).send({ article });
        }
    );
};
