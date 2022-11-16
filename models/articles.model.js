const db = require("../db/connection.js");

const { parseDateFieldWithMap } = require("../utils/utils.js");

exports.selectArticles = () => {
    return db
        .query(
            `
                SELECT
                    articles.author,
                    title,
                    articles.article_id,
                    topic,
                    articles.created_at,
                    articles.votes,
                    CAST (COUNT(comments.article_id) AS INT)
                        AS comment_count
                FROM articles
                LEFT OUTER JOIN comments
                ON articles.article_id = comments.article_id
                GROUP BY
                    articles.author,
                    articles.title,
                    articles.created_at,
                    topic,
                    articles.article_id
                ORDER BY created_at DESC;
            `
        )
        .then((response) => {
            return parseDateFieldWithMap(response.rows);
        });
};

exports.selectArticleById = (id, next) => {
    return db
        .query(
            `
                SELECT * FROM articles
                WHERE article_id = $1;
            `,
            [id]
        )
        .then((response) => {
            if (!response.rows.length) {
                return Promise.reject({
                    status: 404,
                    msg: "article not found"
                });
            } else {
                return response.rows[0];
            }
        });
};

exports.selectCommentsByArticleId = (id) => {
    return db
        .query(
            `
                SELECT * FROM comments
                WHERE article_id = $1
                ORDER BY created_at DESC;
            `,
            [id]
        )
        .then((response) => {
            return parseDateFieldWithMap(response.rows);
        });
};

exports.insertCommentByArticleId = (id, { body, username }) => {
    return db
        .query(
            `
            INSERT INTO comments (
                article_id,
                body,
                author,
                votes
            ) VALUES (
                $1,
                $2,
                $3,
                0
            ) RETURNING * ;
        `,
            [id, body, username]
        )
        .then((response) => {
            return response.rows[0];
        });
};

exports.updateArticleById = (id, inc_votes, next) => {
    return this.selectArticleById(id, next)
        .then((article) => {
            if (isNaN(Number(inc_votes))) {
                const msg =
                    inc_votes === undefined
                        ? "PATCH request body is incomplete"
                        : "data type of increment is incorrect";
                return Promise.reject({
                    status: 400,
                    msg
                });
            }
            let voteCount = article.votes + Math.floor(inc_votes);
            if (voteCount < 0) voteCount = 0;
            return voteCount;
        })
        .then((voteCount) => {
            return db.query(
                `
                    UPDATE articles
                    SET votes = $2
                    WHERE article_id = $1
                    RETURNING * ;
                `,
                [id, voteCount]
            );
        })
        .then((response) => {
            return response.rows[0];
        });
};
