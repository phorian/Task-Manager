const express = require('express');
const app = express();
const PORT = process.env.PORT || 7777
const connectDB = require("./config/db");
app.listen(3000, () => console.log(`Server is live at port ${PORT}`));
//require('dotenv').config();

connectDB();

app.use(express.json());

app.use('/api', require('./routes/userRoutes'));