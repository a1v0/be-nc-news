const db = require("../db/connection.js");

const { parseDateFieldWithMap } = require("../utils/utils.js");

exports.selectArticles = ({
    topic,
    sort_by = "created_at",
    order = "desc"
}) => {
    if (topic) topic = topic.toLowerCase();
    sort_by = sort_by.toLowerCase();
    order = order.toLowerCase();

    const validSortQueries = [
        "title",
        "topic",
        "author",
        "article_id",
        "created_at",
        "votes",
        "comment_count"
    ];

    const validOrderQueries = ["asc", "desc"];

    if (
        !validSortQueries.includes(sort_by) ||
        !validOrderQueries.includes(order)
    ) {
        return Promise.reject({ status: 400, msg: "invalid querystring" });
    }

    let dbQuery = `
        SELECT
            title,
            topic,
            articles.author,
            articles.article_id,
            articles.created_at,
            articles.votes,
            CAST (COUNT(comments.article_id) AS INT)
                AS comment_count
        FROM articles
        LEFT OUTER JOIN comments
        ON articles.article_id = comments.article_id `;
    const injectionValues = [];

    if (topic) {
        injectionValues.push(topic);
        dbQuery += `WHERE topic = $1 `;
    }

    dbQuery += `
        GROUP BY
            title,
            topic,
            articles.author,
            articles.created_at,
            articles.article_id
        ORDER BY articles.${sort_by} ${order};
        `;
    return db
        .query(dbQuery, injectionValues)
        .then((response) => {
            return parseDateFieldWithMap(response.rows);
        })
        .catch((err) => {
            console.log(err);
            return err;
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

exports.updateArticleById = (id, inc_votes, article) => {
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
    return db
        .query(
            `
                    UPDATE articles
                    SET votes = $2
                    WHERE article_id = $1
                    RETURNING * ;
                `,
            [id, voteCount]
        )
        .then((response) => {
            return response.rows[0];
        });
};

exports.selectUsers = () => {
    return db.query(`SELECT * FROM users;`).then((response) => {
        return response.rows;
    });
};
