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
                COUNT(comments.article_id)
                    AS comment_count
            FROM articles
            INNER JOIN comments
                ON articles.article_id = comments.article_id
            GROUP BY articles.author, articles.title, articles.created_at, topic, articles.article_id
            ORDER BY created_at DESC;
            ;`
        )
        .then((response) => {
            return response.rows.map((row) => {
                const rowCopy = { ...row };
                rowCopy.created_at = Date.parse(rowCopy.created_at);
                rowCopy.comment_count = Number(rowCopy.comment_count);
                return rowCopy;
            });
        });
};
