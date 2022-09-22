const User = require("../models/user");
const { USERNAME_MIN_LEN, PASSWORD_MIN_LEN } = require("../utils/config");
const bcrypt = require("bcrypt");
const { isValidId } = require("../utils/middleware");

const userRouter = require("express").Router();

userRouter.get("/:id", isValidId(),async (req, res, next) => {
    try {
        const userInDB = await User.findOne({ _id: req.params.id });

        if (userInDB === null)
            return res.status(400).send({error: "User with the provided Id was not present in the database"});

        res.send(userInDB);
    }
    catch(err) {
        next(err);
    }
});

userRouter.post("/", async (req, res, next) => {
    const { username, password } = req.body;

    if (username === undefined) 
        return res.status(400).send({error: "'username' field missing in the request body"});

    if (password === undefined)
        return res.status(400).send({error: "'password' field missing in the request body"});

    if (typeof username !== "string")
        return res.status(400).send({error: "'username' field's value should be a string"});

    if (typeof password !== "string")
        return res.status(400).send({error: "'password' field's value should be a string"});

    if (username.length < USERNAME_MIN_LEN)
        return res.status(400).send({error: `'username' field's value should be at least ${USERNAME_MIN_LEN} characters long`});

    if (password.length < PASSWORD_MIN_LEN)
        return res.status(400).send({error: `'password' field's value should be at least ${PASSWORD_MIN_LEN} characters long`});

    try {
        const userInDB = await User.findOne({username});

        if (userInDB !== null)
            return res.status(400).send({error: "username was already present in the database"});

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({username, passwordHash});
        const newUser = await user.save();

        res.status(201).send(newUser);
    }
    catch(err) {
        next(err);
    }
});

module.exports = userRouter;
