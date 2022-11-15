exports.psqlErrorHandler = (err, next) => {
    if (err.code === "22P02") {
        next({ status: 400, msg: "invalid article id" });
    }
};
