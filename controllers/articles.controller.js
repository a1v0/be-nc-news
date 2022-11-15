const {
    selectArticles,
    selectArticleById,
    selectCommentsByArticleId
} = require("../models/articles.model.js");
const { psqlErrorHandler } = require("../errors/error-handler.js");

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
            if (err.code) {
                psqlErrorHandler(err, next);
            } else {
                next(err);
            }
        });
};

exports.getCommentsByArticleId = (req, res, next) => {
    const article_id = req.params.article_id;
    return selectArticleById(article_id, next)
        .then(() => {
            return selectCommentsByArticleId(article_id);
        })
        .then((comments) => {
            res.status(200).send({ comments });
        })
        .catch((err) => {
            if (err.code) {
                psqlErrorHandler(err, next);
            } else {
                next(err);
            }
        });
};
