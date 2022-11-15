exports.psqlErrorHandler = (err, next) => {
    if (err.code === "22P02") {
        next({ status: 400, msg: "invalid article id" });
    }
};

exports.customErrorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else next(err);
};

exports.lastResort500Error = (err, req, res, next) => {
    console.log("An unhandled error has occurred:", err);
    res.status(500).send({ msg: "internal server error" });
};
