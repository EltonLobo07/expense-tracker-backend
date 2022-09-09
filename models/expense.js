const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    date: Date,
    category: mongoose.ObjectId
});

module.exports = mongoose.model("Expense", expenseSchema);
