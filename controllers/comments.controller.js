const { deleteFromCommentsByCommentId } = require("../models/comments.model");

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
