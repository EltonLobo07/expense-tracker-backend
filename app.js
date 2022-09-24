const express = require("express");
const expenseRouter = require("./controllers/expenses");
const categoryRouter = require("./controllers/categories");
const { requestLogger, unknownEndpoint, myErrorHandler } = require("./utils/middleware");
const { DB_URI } = require("./utils/config");
const mongoose = require("mongoose");
const { info, error }  = require("./utils/logger");
const cors = require("cors");
const loginRouter = require("./controllers/login");
const userRouter = require("./controllers/users");

const app = express();

mongoose.connect(DB_URI)
        .then(() => info("Connected to the database"))
        .catch(err => error("Error connecting to the database", err.message));

app.use(express.json());

app.use(requestLogger);

app.use(express.static("public"));

app.use(cors({origin: "*"}));

app.use("/api/expenses", expenseRouter);

app.use("/api/categories", categoryRouter);

app.use("/api/login", loginRouter);

app.use("/api/users", userRouter);

app.use(unknownEndpoint);

app.use(myErrorHandler);

module.exports = app;
