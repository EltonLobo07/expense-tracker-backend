const mongoose = require("mongoose");

const expense = new mongoose.Schema({
    description: String,
    amount: Number,
    category: mongoose.ObjectId
});

module.exports = mongoose.model("Expense", expense);
