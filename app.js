const express = require("express");
const expenseRouter = require("./controllers/expenses");
const categoryRouter = require("./controllers/categories");
const { requestLogger, unknownEndpoint, myErrorHandler } = require("./utils/middleware");
const { DB_URI } = require("./utils/config");
const mongoose = require("mongoose");
const { info, error }  = require("./utils/logger");
const cors = require("cors");

const app = express();

mongoose.connect(DB_URI)
        .then(() => info("Connected to the database"))
        .catch(err => error("Error connecting to the database", err.message));

app.use(express.json());

app.use(requestLogger);

app.use(cors({origin: "*"}));

app.use("/api/expenses", expenseRouter);

app.use("/api/categories", categoryRouter);

app.use(unknownEndpoint);

app.use(myErrorHandler);

module.exports = app;
