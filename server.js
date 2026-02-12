import express from "express";
import "dotenv/config";
import connectDB from "./config/DB/dbConnect.js";
import configureExpress from "./config/express/expressConfig.js";
import { errorHandler } from "./middlewares/errorHandler/errorHandler.middleware.js";
import router from "./routers/index.js";
const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
configureExpress(app);
app.get("/", (req, res) => {
  res.send("API WORKING");
});
app.use('/api/v1',router)
app.use(errorHandler);

app.listen(PORT, () =>
     console.log(`Server running on port ${PORT}`)
);
