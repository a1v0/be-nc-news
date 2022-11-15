const {
    selectArticles,
    selectArticleById
} = require("../models/articles.model.js");

exports.getArticles = (req, res) => {
    return selectArticles().then((articles) => {
        res.status(200).send({ articles });
    });
};

exports.getArticleById = (req, res, next) => {
    return selectArticleById(req.params.article_id)
        .then((article) => {
            res.status(200).send({ article });
        })
        .catch((err) => {
            if (err.code === "22P02") {
                next({ status: 400, msg: "invalid article id" });
            } else {
                next(err);
            }
        });
};
