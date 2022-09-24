const { info, error } = require("./logger");
const { SECRET_KEY } = require("./config");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

async function getUserId(req, res, next) {
    const { authorization } = req.headers;

    if (authorization === undefined)
        return res.status(401).send({error: "Authorization field missing in the header of the request"});

    if (typeof authorization != "string")
        return res.status(401).send({error: "Authorization header field should be of string type"});

    if (authorization.toLowerCase().startsWith("bearer")) {
        const token = authorization.slice(7);

        try {
            req.userId = await jwt.verify(token, SECRET_KEY).id;
            next();
        }
        catch(err) {
            next(err);
        }
    }
};

module.exports = {requestLogger, unknownEndpoint, myErrorHandler, isValidId, getUserId};
