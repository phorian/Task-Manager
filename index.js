const express = require('express');
const app = express();
const PORT = process.env.PORT || 7777
const connectDB = require("./config/db");
const server = app.listen(PORT, () => console.log(`Server is live at port ${PORT}`));

connectDB();

app.use(express.json());