const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    date: Date,
    category: {
        type: mongoose.Types.ObjectId,
        ref: "Category" 
    },
    added: Date,
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
});

expenseSchema.set("toJSON", {
    transform: function(doc, returnedObj) {
        delete returnedObj.__v;
    }
});

module.exports = mongoose.model("Expense", expenseSchema);
