const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: {
        type: String
    },
    passwordHash: {
        type: String
    }
});

userSchema.set("toJSON", {
    transform: function(doc, returnedObj) {
        delete returnedObj.__v;
        delete returnedObj.passwordHash;
    }
})

module.exports = mongoose.model("User", userSchema);
