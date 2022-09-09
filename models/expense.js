const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    date: Date,
    category: mongoose.ObjectId,
    added: Date
});

expenseSchema.set("toJSON", {
    transform: function(doc, returnedObj) {
        delete returnedObj.__v;
    }
});

module.exports = mongoose.model("Expense", expenseSchema);
