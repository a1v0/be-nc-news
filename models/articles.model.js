const db = require("../db/connection.js");

const { parseDateFieldWithMap } = require("../utils/utils.js");
const { selectTopics } = require("./topics.model.js");

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

    return selectTopics()
        .then((topics) => {
            if (
                topic &&
                topics.findIndex((result) => {
                    return result.slug === topic;
                }) < 0
            ) {
                return Promise.reject({ status: 404, msg: "topic not found" });
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
            return db.query(dbQuery, injectionValues);
        })
        .then((response) => {
            return {
                articles: parseDateFieldWithMap(response.rows),
                total_count: response.rows.length
            };
        });
};

exports.selectArticleById = (id) => {
    return db
        .query(
            `
                SELECT
                    CAST (COUNT(comments.article_id) AS INT)
                        AS comment_count,
                    articles.*
                FROM articles
                LEFT OUTER JOIN comments
                ON articles.article_id = comments.article_id
                WHERE articles.article_id = $1
                GROUP BY
                    articles.author,
                    articles.title,
                    articles.created_at,
                    topic,
                    articles.article_id;
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

exports.insertArticle = async ({ author, title, body, topic }) => {
    if (!author || !title || !body || !topic) {
        return Promise.reject({
            status: 400,
            msg: "POST request body is incomplete"
        });
    }
    const articleIdQuery = await db.query(
        `
            INSERT INTO articles (
                author,
                title,
                body,
                topic
            ) VALUES(
                $1,
                $2,
                $3,
                $4
            )
            RETURNING
                article_id;
        `,
        [author, title, body, topic]
    );
    const postedArticle = await db.query(
        `
            SELECT
                articles.*,
                CAST (COUNT(comments.article_id) AS INT)
                    AS comment_count
            FROM articles
            LEFT OUTER JOIN comments
            ON comments.article_id = $1
            WHERE articles.article_id = $1
            GROUP BY articles.article_id;
        `,
        [articleIdQuery.rows[0].article_id]
    );
    return postedArticle.rows[0];
};
