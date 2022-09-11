const { info, error } = require("./logger");

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

function isValidId(fieldName = "id") {
    return ((req, res, next) => {
        if (!(/^[A-F\d]{24}$/i.test(req.params[fieldName])))
            return res.status(400).send({error: `Invalid Id`});

        next();
    });
};

module.exports = {requestLogger, unknownEndpoint, myErrorHandler, isValidId};
