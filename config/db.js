const Mongoose = require("mongoose");

const connectDB = async () => {
    await Mongoose.connect('mongodb://127.0.0.1/27017',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
}

module.exports = connectDB