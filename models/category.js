const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: String,
    total: Number,
    limit: Number,
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    }
});

categorySchema.set("toJSON", {
    transform: function(doc, returnedObj) {
        delete returnedObj.__v;
    }
});

module.exports = mongoose.model("Category", categorySchema);
