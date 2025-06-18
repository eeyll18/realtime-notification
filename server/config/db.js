const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("db connected")
    } catch (error) {
        console.error("error connecting db",error)
        process.exit(1)
    }
}

module.exports = connectDB;
