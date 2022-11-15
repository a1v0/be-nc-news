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

exports.insertCommentByArticleId = (id, body) => {
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
            [id, body.body, body.username]
        )
        .then((response) => {
            return response.rows[0];
        });
};
