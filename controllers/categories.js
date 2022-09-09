const category = require("../models/category");
const categoryRouter = require("express").Router();
const Category = require("../models/category");
const { isValidId } = require("../utils/middleware");

/*
    you are using Mongoose, you don't need to sanitize the inputs. In this case, you just need to set the
    properties to be typed as string. If someone passes an object like { $ne: null }, Mongoose will 
    convert it to a string and no harm will be done.
*/

categoryRouter.get("/", async (req, res, next) => {
    try {
        const result = await Category.find();
        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.get("/:id", isValidId, async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        const result = await Category.findOne({_id: req.params.id});

        if (result === null)
            return res.status(404).send({error: "given category id was not found"});

        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.post("/", async (req, res, next) => {
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

        name = name.trim().toLowerCase().replace(" ", "-");

        const categoryInTheDB = await Category.findOne({name});

        if (categoryInTheDB !== null)
            return res.status(400).send({error: "given category name is already present"});

        const newCategory = new Category({name, limit: Math.round(limit), total: 0});
        const result = await newCategory.save();
        res.status(201).send(result);
    }
    catch(err) {
        next(err);
    }
}); 

categoryRouter.delete("/:id", isValidId, async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        await Category.deleteOne({_id: req.params.id});

        res.send(204);
    }
    catch(err) {
        next(err);
    }
});

categoryRouter.put("/:id", isValidId, async (req, res, next) => {
    try {
        const { name, total, limit } = req.body;

        const fieldsToUpdate = {};

        if (name !== undefined) {
            if (typeof name !== "string")
                return res.status(400).send({error: "'name' field's value should be a string"});

            fieldsToUpdate.name = name.trim().toLowerCase().replace(" ", "-"); 
        }

        if (total !== undefined) {
            if (typeof total !== "number")
                return res.status(400).send({error: "'total' field's value should be a number"});

            fieldsToUpdate.total = Number(total.toFixed(2));
        }

        if (limit !== undefined) {
            if (typeof limit !== "number") 
                return res.status(400).send({error: "'limit' field's value should be a number"});

            fieldsToUpdate.limit = Math.round(limit);
        }

        // req.params.id will always be a string, so use it directly
        const curCategory = await Category.findOne({_id: req.params.id});

        if (curCategory === null)
            return res.status(404).send({error: "given category id was not found"});

        for (const [k, v] of Object.entries(fieldsToUpdate))
            curCategory[k] = v; 

        const updatedCategory = await curCategory.save();
        res.send(updatedCategory);
    }
    catch(err) {
        next(err);
    }
});

module.exports = categoryRouter;
