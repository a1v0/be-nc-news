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
            if (!response.rows.length) {
                return Promise.reject({
                    status: 404,
                    msg: "username not found"
                });
            }
            return response.rows[0];
        });
};
