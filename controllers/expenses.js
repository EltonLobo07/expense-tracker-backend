const expenseRouter = require("express").Router();
const Expense = require("../models/expense");

expenseRouter.get("/", async (req, res, next) => {
    try {
        const result = await Expense.find();
        res.send(result);
    }
    catch(err) {
        next(err);
    }
});

module.exports = expenseRouter;
