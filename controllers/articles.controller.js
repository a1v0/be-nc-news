const {
    selectArticles,
    selectArticleById,
    selectCommentsByArticleId,
    insertCommentByArticleId
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
    const article_id = req.params.article_id;
    return selectArticleById(article_id, next)
        .then(() => {
            return selectCommentsByArticleId(article_id);
        })
        .then((comments) => {
            res.status(200).send({ comments });
        })
        .catch((err) => {
            next(err);
        });
};

exports.postCommentByArticleId = (req, res, next) => {
    insertCommentByArticleId(req.params.article_id, req.body)
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch((err) => {
            if (!req.body.body || !req.body.username) {
                next({ status: 400, msg: "POST request body is incomplete" });
            }
        });
};
