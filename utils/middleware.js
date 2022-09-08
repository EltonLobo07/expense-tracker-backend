const { info } = require("./logger");

function requestLogger(req, res, next) {
    info(`${req.url} ${req.method} ${JSON.stringify(req.body)}`);
    next();
};

function unknownEndpoint(req, res, next) {
    res.status(404).send({error: "Unknown endpoint"});
};

function myErrorHandler(err, req, res, next) {
    error(err);
    next(err);
};

module.exports = {requestLogger, unknownEndpoint, myErrorHandler};
