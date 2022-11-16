const db = require("../db/connection.js");
const { psqlErrorHandler } = require("../errors/psql.error.js");

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
            return response.rows.map((row) => {
                const rowCopy = { ...row };
                rowCopy.created_at = Date.parse(rowCopy.created_at);
                return rowCopy;
            });
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
        })
        .catch((err) => {
            if (err.code) {
                return psqlErrorHandler(err, next);
            }
            return Promise.reject(err);
        });
};

exports.updateArticleById = (id, inc_votes, next) => {
    return this.selectArticleById(id, next)
        .then((article) => {
            if (!inc_votes) {
                return Promise.reject({
                    status: 400,
                    msg: "PATCH request body is incomplete"
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
