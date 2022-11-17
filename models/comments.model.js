const db = require("../db/connection.js");

exports.deleteFromCommentsByCommentId = (id) => {
    return db
        .query(
            `
                DELETE FROM comments
                WHERE comment_id = $1
                RETURNING * ;
            `,
            [id]
        )
        .then((response) => {
            if (!response.rows.length) {
                return Promise.reject({
                    status: 404,
                    msg: "comment not found"
                });
            }
        });
};

exports.updateCommentById = (id, { inc_votes }) => {
    return db
        .query(
            `
            UPDATE comments
            SET votes = votes + $1
            WHERE comment_id = $2
            RETURNING * ;
        `,
            [inc_votes, id]
        )
        .then((response) => {
            return response.rows[0];
        });
};
