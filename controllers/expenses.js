const expenseRouter = require("express").Router();
const Expense = require("../models/expense");
const Category = require("../models/category");
const { isValidId, doesNothing } = require("../utils/middleware");
const { roundNum } = require("../utils/helper");

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
        const result = await Expense.findOne({_id: req.params.id});

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
        
        const isDatePresent = date !== undefined;
        const isDescriptionPresent = description !== undefined;

        // Check if required fields exist
        // -------------------------------------------------------------------------------
        // description field can be missing

        if (amount === undefined)
            return res.status(400).send({error: "'amount' field missing in the request body"});

        // date field can be missing

        if (category === undefined)
            return res.status(400).send({error: "'category' field missing in the request body"});

        // Check if field values are set to correct type of data
        // -------------------------------------------------------------------------------
        if (isDescriptionPresent && typeof description !== "string")
            return res.status(400).send({error: "'description' field's value should be a string"});

        if (isDatePresent && typeof date !== "string")
            return res.status(400).send({error: "'date' field's value should be a string"});

        if (typeof amount !== "number")
            return res.status(400).send({error: "'amount' field's value should be a number"});

        if (typeof category !== "string")
            return res.status(400).send({error: "'category' field's value should be a string"});

        // Check if date field's value is correctly set
        // -------------------------------------------------------------------------------
        if (isDatePresent && !(/^\d{4}-\d{2}-\d{2}$/.test(date)))
            return res.status(400).send({error: "'date' field's value is not currently formatted, format: YYYY-MM-DD"});

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
            curCategory.total = curCategory.total + amount;
            
        await curCategory.save();

        // Set description and date field values to default values if not present
        // -------------------------------------------------------------------------------
        if (!isDescriptionPresent)
            description = "";

        if (isDatePresent)
            date = new Date(date);
        else {
            const curDate = new Date();
            date = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate());
        }

        // Create a new Expense object and save it to the database
        // -------------------------------------------------------------------------------
        const newExpense = new Expense({description, amount, date, category: curCategory._id, added: new Date()});
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

            if (curExpense.amount === curCategory.total)
                await Category.deleteOne({_id: curCategory._id});
            else {
                curCategory.total -= roundNum(curExpense.amount);
                await curCategory.save();
            }
        }

        await Expense.deleteOne({_id: req.params.id});

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

            fieldsToUpdate.description = description;
        }

        if (amount !== undefined) {
            if (typeof amount !== "number")
                return res.status(400).send({error: "'amount' field's value should be a number"});

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
            curCategory.total += fieldsToUpdate.amount - curExpense.amount;
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
