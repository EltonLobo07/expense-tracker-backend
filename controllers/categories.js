const categoryRouter = require("express").Router();
const Category = require("../models/category");
const Expense = require("../models/expense");
const { isValidId, getUserId } = require("../utils/middleware");
const { roundNum } = require("../utils/helper");
const { CATEGORY_NAME_MIN_LEN } = require("../utils/config");

/*
    you are using Mongoose, you don't need to sanitize the inputs. In this case, you just need to set the
    properties to be typed as string. If someone passes an object like { $ne: null }, Mongoose will 
    convert it to a string and no harm will be done.
*/

categoryRouter.get("/", getUserId, async (req, res, next) => {
    try {
        const result = await Category.find({user: req.userId}, {user: 0});
        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.get("/:id", isValidId(), getUserId, async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        const result = await Category.findOne({_id: req.params.id, user: req.userId}, {user: 0});

        if (result === null)
            return res.status(404).send({error: "given category id was not found"});

        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.post("/", getUserId, async (req, res, next) => {
    try {
        let { name, limit } = req.body;

        if (name === undefined)
            return res.status(400).send({error: "'name' field missing in the request body"});

        if (limit === undefined)
            return res.status(400).send({error: "'limit' field missing in the request body"});

        if (typeof name !== "string")
            return res.status(400).send({error: "'name' field's value should be a string"});

        if (typeof limit !== "number")
            return res.status(400).send({error: "'limit' field's value should be a number"});

        if (name.length < CATEGORY_NAME_MIN_LEN)
            return res.status(400).send({error: `'name' field's string value should be at least ${CATEGORY_NAME_MIN_LEN} characters long`});

        if (limit <= 0)
            return res.status(400).send({error: "'limit' field's value cannot be less than or equal to 0"});

        name = name.trim().toLowerCase().replaceAll(" ", "-");

        const categoryInTheDB = await Category.findOne({name, user: req.userId});

        if (categoryInTheDB !== null)
            return res.status(400).send({error: "given category name is already present"});

        const newCategory = new Category({name, limit: Math.round(limit), total: 0, user: req.userId});
        const result = await newCategory.save();
        res.status(201).send({name: result.name, total: result.total, limit: result.limit, _id: result._id});
    }
    catch(err) {
        next(err);
    }
}); 

categoryRouter.delete("/:id", isValidId(), getUserId, async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        const categoryId = req.params.id;
        
        await Category.deleteOne({_id: categoryId, user: req.userId});

        await Expense.deleteMany({category: categoryId, user: req.userId});

        res.send(204);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.put("/:id", isValidId(), getUserId, async (req, res, next) => {
    try {
        const { name, total, limit } = req.body;

        const fieldsToUpdate = {};

        if (name !== undefined) {
            if (typeof name !== "string")
                return res.status(400).send({error: "'name' field's value should be a string"});

            const categoryInTheDB = await Category.findOne({name, user: req.userId});

            if (categoryInTheDB !== null && String(categoryInTheDB._id) !== req.params.id)
                return res.status(400).send({error: "given category name is already present"});

            fieldsToUpdate.name = name.trim().toLowerCase().replace(" ", "-"); 
        }

        if (total !== undefined) {
            if (typeof total !== "number")
                return res.status(400).send({error: "'total' field's value should be a number"});

            fieldsToUpdate.total = roundNum(total);
        }

        if (limit !== undefined) {
            if (typeof limit !== "number") 
                return res.status(400).send({error: "'limit' field's value should be a number"});

            if (limit <= 0)
                return res.status(400).send({error: "'limit' field's value cannot be less than or equal to 0"});

            fieldsToUpdate.limit = Math.round(limit);
        }

        // req.params.id will always be a string, so use it directly
        const curCategory = await Category.findOne({_id: req.params.id, user: req.userId});

        if (curCategory === null)
            return res.status(404).send({error: "given category id was not found"});

        for (const [k, v] of Object.entries(fieldsToUpdate))
            curCategory[k] = v; 

        const result = await curCategory.save();
        res.send({name: result.name, total: result.total, limit: result.limit, _id: result._id});
    }
    catch(err) {
        next(err);
    }
});

module.exports = categoryRouter;
