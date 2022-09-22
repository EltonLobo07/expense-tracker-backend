const loginRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../utils/config");

loginRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body;
    
    if (username === undefined) 
        return res.status(400).send({error: "'username' field missing in the request body"});

    if (password === undefined)
        return res.status(400).send({error: "'password' field missing in the request body"});

    if (typeof username !== "string")
        return res.status(400).send({error: "'username' field's value should be a string"});

    if (typeof password !== "string")
        return res.status(400).send({error: "'password' field's value should be a string"});
    
    try {
        const userInDB = await User.findOne({ username });

        if (userInDB === null)
            return res.status(401).send({error: "User with the given username was not present in the database"});

        const passwordMatch = await bcrypt.compare(password, userInDB.passwordHash);

        if (!passwordMatch)
            return res.status(401).send({error: "Given password is incorrect"});

        const token = await jwt.sign({ id: String(userInDB._id), username }, SECRET_KEY);

        res.send({token});
    }
    catch(err) {
        next(err);
    }
});

module.exports = loginRouter;
