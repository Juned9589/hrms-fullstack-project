import mongoose from "mongoose"
import dns from "dns"

// const connectDB = async () => {
//     const uri = process.env.MONGO_URI
//     if (!uri) {
//         console.error("MONGO_URI is not defined in .env")
//         process.exit(1)
//     }


//     let retries = 3
//     while (retries > 0) {
//         try {
//             const conn = await mongoose.connect(uri)
//             console.log(`✅ MongoDB connected: ${conn.connection.host}`)

//             mongoose.connection.on("error", (err) => {
//                 console.error("MongoDB connection error:", err.message)
//             })

//             mongoose.connection.on("disconnected", () => {
//                 console.warn("MongoDB disconnected. Attempting to reconnect...")
//             })

//             return
//         } catch (error) {
//             retries -= 1
//             console.error(
//                 `❌ MongoDB connection failed (${3 - retries}/3): ${error.message}`
//             )
//             if (retries === 0) {
//                 console.error(
//                     "\n⚠️  MongoDB Atlas: Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)\n"
//                 )
//                 process.exit(1)
//             }
//             // Wait 3s before retrying
//             await new Promise((r) => setTimeout(r, 3000))
//         }
//     }
// }

// export default connectDB

// import mongoose from "mongoose";

const connectDB = async () => {
    dns.setServers(["8.8.8.8", "8.8.4.4"])
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected:", conn.connection.name);
    } catch (err) {
        console.error(err);
    }
};

export default connectDB;