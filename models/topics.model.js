const db = require("../db/connection.js");

exports.selectTopics = () => {
    return db.query(`SELECT * FROM topics;`).then((response) => {
        return response.rows;
    });
};

exports.insertTopic = ({ slug, description }) => {
    return db
        .query(
            `
            INSERT INTO topics (
                slug,
                description
            ) VALUES (
                $1,
                $2
            ) RETURNING * ;
        `,
            [slug, description]
        )
        .then((response) => {
            return response.rows[0];
        });
};
