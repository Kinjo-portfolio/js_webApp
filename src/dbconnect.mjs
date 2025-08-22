import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect("mongodb://localhost:27017/beutuki", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("接続成功")
    } catch (err) {
        console.log("接続失敗", err)
    }
}

export default connectDB





// const mongoURL = "mongodb://localhost:27017/beutuki"

// mongoose.connect(mongoURL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
// .then(() => {
//     console.log("接続成功")
//     mongoose.disconnect()
// })
// .catch((err) => {
//     console.error("接続失敗",err)
// })

