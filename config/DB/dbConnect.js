import mongoose from "mongoose";

 const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb+srv://${process.env.MONGOOSE_USER}:${process.env.MONGOOSE_PASSWORD}@cluster0.aavcegy.mongodb.net/${process.env.MONGOOSE_DBNAME}?appName=Cluster0`)
    console.log(`Database connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(" Problem in connecting to database:", err.message);
    process.exit(1); 
  }
};
export default connectDB;
