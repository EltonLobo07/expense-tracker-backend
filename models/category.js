const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: String,
    total: Number
});

module.exports = mongoose.model("Category", categorySchema);
