const expenseRouter = require("express").Router();
const Expense = require("../models/expense");
const Category = require("../models/category");
const { isValidId } = require("../utils/middleware");
const { roundNum } = require("../utils/helper");
const { DESCRIPTION_MIN_LEN } = require("../utils/config");

expenseRouter.get("/", async (req, res, next) => {
    try {
        const result = await Expense.find();
        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

expenseRouter.get("/category-:categoryId", isValidId("categoryId"), async (req, res, next) => {
    try {
        // req.params.categoryId will always be a string, so use it directly
        const categoryId = req.params.categoryId;
        const categoryInTheDB = await Category.findOne({_id: categoryId});

        if (categoryInTheDB === null)
            return res.status(404).send({error: "given category id was not found"});

        const result = await Expense.find({category: categoryId});

        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

expenseRouter.get("/:id", isValidId(), async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        const result = await Expense.findOne({_id: req.params.id}).populate("category", "name");

        if (result === null)
            return res.status(404).send({error: "given expense id was not found"});

        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

expenseRouter.post("/", async (req, res, next) => {
    try {
        let { description, amount, date, category } = req.body;

        // Check if required fields exist
        // -------------------------------------------------------------------------------
        if (description === undefined)
            return res.status(400).send({error: "'description' field missing in the request body"});

        if (amount === undefined)
            return res.status(400).send({error: "'amount' field missing in the request body"});

        if (date === undefined)
            return res.status(400).send({error: "'date' field missing in the request body"});

        if (category === undefined)
            return res.status(400).send({error: "'category' field missing in the request body"});

        // Check if field values are set to correct type of data
        // -------------------------------------------------------------------------------
        if (typeof description !== "string")
            return res.status(400).send({error: "'description' field's value should be a string"});

        if (typeof date !== "string")
            return res.status(400).send({error: "'date' field's value should be a string"});

        if (typeof amount !== "number")
            return res.status(400).send({error: "'amount' field's value should be a number"});

        if (typeof category !== "string")
            return res.status(400).send({error: "'category' field's value should be a string"});

        // Check if date field's value is correctly set
        // -------------------------------------------------------------------------------
        if (!(/^\d{4}-\d{2}-\d{2}$/.test(date)))
            return res.status(400).send({error: "'date' field's value is not currently formatted, format: YYYY-MM-DD"});

        if (amount <= 0)
            return res.status(400).send({error: "'amount' field's value cannot be less than or equal to 0"});

        if (description.length < DESCRIPTION_MIN_LEN)
            return res.status(400).send({error: `'description' field's string value should be at least ${DESCRIPTION_MIN_LEN} characters long`});

        // Round amount field's value 
        // -------------------------------------------------------------------------------
        amount = roundNum(amount);

        // Update category entry if given category present, else create a new category entry
        // -------------------------------------------------------------------------------
        category = category.trim().toLowerCase().replace(" ", "-");
        let curCategory = await Category.findOne({name: category});

        if (curCategory === null)
            curCategory = new Category({name: category, total: amount});
        else 
            curCategory.total = roundNum(curCategory.total + amount);
            
        await curCategory.save();

        // Create a date object
        date = new Date(date);

        // Create a date object in UTC for when the entry is added to the database
        const curDate = new Date();
        const added = new Date(curDate.getUTCFullYear(), curDate.getUTCMonth(), curDate.getUTCDate());

        // Create a new Expense object and save it to the database
        // -------------------------------------------------------------------------------
        const newExpense = new Expense({description, amount, date, category: curCategory._id, added});
        const returnedExpense = await newExpense.save();

        // Send the newly created expense object as a response
        // -------------------------------------------------------------------------------
        res.status(201).send(returnedExpense);
    }
    catch(err) {
        next(err);
    }
});

expenseRouter.delete("/:id", isValidId(), async (req, res, next) => {
    try {
        // req.params.id will always be a string, so use it directly
        const curExpense = await Expense.findOne({_id: req.params.id});

        if (curExpense !== null) {
            const curCategory = await Category.findOne({_id: curExpense.category});

            curCategory.total = roundNum(curCategory.total - curExpense.amount);
            await curCategory.save();

            await Expense.deleteOne({_id: req.params.id});
        }

        res.status(204).end();
    }
    catch(err) {
        next(err);
    }
});

expenseRouter.put("/:id", isValidId(), async (req, res, next) => {
    try {
        // IMPORTANT: Category field's value won't change

        const { description, amount, date } = req.body;

        const fieldsToUpdate = {};

        if (description !== undefined) {
            if (typeof description !== "string")
                return res.status(400).send({error: "'description' field's value should be a string"});
    
            if (description.length < DESCRIPTION_MIN_LEN)
                return res.status(400).send({error: `'description' field's string value should be at least ${DESCRIPTION_MIN_LEN} characters long`});

            fieldsToUpdate.description = description;
        }

        if (amount !== undefined) {
            if (typeof amount !== "number")
                return res.status(400).send({error: "'amount' field's value should be a number"});

            if (amount <= 0)
                return res.status(400).send({error: "'amount' field's value cannot be less than or equal to 0"});

            fieldsToUpdate.amount = roundNum(amount);
        }

        if (date !== undefined) {
            if (typeof date !== "string")
                return res.status(400).send({error: "'date' field's value should be a string"});

            if (!(/^\d{4}-\d{2}-\d{2}$/.test(date)))
                return res.status(400).send({error: "'date' field's value is not currently formatted, format: YYYY-MM-DD"});

            fieldsToUpdate.date = new Date(date);
        } 

        // req.params.id will always be a string, so use it directly
        const curExpense = await Expense.findOne({_id: req.params.id});

        if (curExpense === null)
            return res.status(404).send({error: "given expense id was not found"});

        if (amount !== undefined) {
            const curCategory = await Category.findOne({_id: curExpense.category});
            curCategory.total = roundNum(curCategory.total + fieldsToUpdate.amount - curExpense.amount);
            await curCategory.save();
        }

        for (const [k, v] of Object.entries(fieldsToUpdate))
            curExpense[k] = v; 

        const updatedExpense = await curExpense.save();
        res.send(updatedExpense);
    }
    catch(err) {
        next(err);
    }
});

module.exports = expenseRouter;
