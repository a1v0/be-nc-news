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
