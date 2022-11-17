const {
    getArticles,
    getArticleById,
    patchArticleById,
    getCommentsByArticleId,
    postCommentByArticleId
} = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);

articlesRouter
    .route("/:article_id")
    .get(getArticleById)
    .patch(patchArticleById);

articlesRouter
    .route("/:article_id/comments")
    .get(getCommentsByArticleId)
    .post(postCommentByArticleId);

module.exports = articlesRouter;
