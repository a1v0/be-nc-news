const db = require("../db/connection.js");

exports.selectUsers = () => {
    return db.query(`SELECT * FROM users;`).then((response) => {
        return response.rows;
    });
};

exports.selectUserByUsername = (username) => {
    return db
        .query(
            `
            SELECT * FROM users
            WHERE username = $1;
        `,
            [username]
        )
        .then((response) => {
            return response.rows[0];
        });
};
