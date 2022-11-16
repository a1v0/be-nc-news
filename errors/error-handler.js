exports.psqlErrorHandler = (err, req, res, next) => {
    switch (err.code) {
        case "22P02":
            next({ status: 400, msg: "invalid article id" });
            break;
        case "23503":
            next({ status: 400, msg: "invalid username" });
            break;
        default:
            next(err);
            break;
    }
};

exports.customErrorHandler = (err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({ msg: err.msg });
    } else {
        next(err);
    }
};

exports.lastResort500Error = (err, req, res, next) => {
    console.log("An unhandled error has occurred:\n", err);
    res.status(500).send({ msg: "internal server error" });
};
