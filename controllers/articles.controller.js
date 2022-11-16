const {
    selectArticles,
    selectArticleById,
    updateArticleById,
    selectCommentsByArticleId,
    insertCommentByArticleId,
    selectUsers
} = require("../models/articles.model.js");

exports.getArticles = (req, res) => {
    return selectArticles(req.query).then((articles) => {
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
    const article_id = req.params.article_id;
    return selectArticleById(article_id, next)
        .then((article) => {
            return updateArticleById(article_id, req.body.inc_votes, article);
        })
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
    const article_id = req.params.article_id;
    return selectArticleById(article_id, next)
        .then(() => {
            return insertCommentByArticleId(article_id, req.body);
        })
        .then((comment) => {
            res.status(201).send({ comment });
        })
        .catch((err) => {
            if (!req.body.body || !req.body.username) {
                next({
                    status: 400,
                    msg: "POST request body is incomplete"
                });
            } else {
                next(err);
            }
        });
};

exports.getUsers = (req, res) => {
    selectUsers().then((users) => {
        res.status(200).send({ users });
    });
};
