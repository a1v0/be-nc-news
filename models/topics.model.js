const db = require("../db/connection.js");

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((response) => {
        return response.rows;
    });
};

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
            console.log(response.rows);
            return response.rows.map((row) => {
                const rowCopy = { ...row };
                rowCopy.created_at = Date.parse(rowCopy.created_at);
                return rowCopy;
            });
        });
};

exports.selectArticleById = (id) => {
    return db
        .query(
            `
            SELECT * FROM articles
            WHERE article_id = $1;
            `,
            [id]
        )
        .then((response) => {
            return response.rows[0];
        });
};
