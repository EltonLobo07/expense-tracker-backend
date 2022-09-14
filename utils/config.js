require("dotenv")?.config();

const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;
const CATEGORY_NAME_MIN_LEN = process.env.CATEGORY_NAME_MIN_LEN;
const DESCRIPTION_MIN_LEN = process.env.DESCRIPTION_MIN_LEN;

module.exports = {PORT, DB_URI, CATEGORY_NAME_MIN_LEN, DESCRIPTION_MIN_LEN};
