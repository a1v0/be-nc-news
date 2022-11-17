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
    if (!inc_votes) {
        return Promise.reject({
            status: 400,
            msg: "PATCH request body is incomplete"
        });
    }

    inc_votes = Math.floor(inc_votes);
    return db
        .query(`SELECT votes FROM comments WHERE comment_id = $1`, [id])
        .then((response) => {
            const newVoteCount =
                response.rows[0].votes + inc_votes < 0
                    ? 0
                    : response.rows[0].votes + inc_votes;
            return db.query(
                `
                    UPDATE comments
                    SET votes = $1
                    WHERE comment_id = $2
                    RETURNING * ;
                `,
                [newVoteCount, id]
            );
        })
        .then((response) => {
            return response.rows[0];
        });
};
