const {
    deleteFromCommentsByCommentId,
    updateCommentById
} = require("../models/comments.model");

exports.deleteCommentById = (req, res, next) => {
    deleteFromCommentsByCommentId(req.params.comment_id)
        .then(() => {
            res.sendStatus(204);
        })
        .catch((err) => {
            err.invalidProperty = "comment id";
            next(err);
        });
};

exports.patchCommentById = (req, res, next) => {
    const {
        params: { comment_id },
        body
    } = req;
    updateCommentById(comment_id, body)
        .then((comment) => {
            res.status(200).send({ comment });
        })
        .catch((err) => {
            err.invalidProperty = "comment id";
            next(err);
        });
};
