import express,{ Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import userRouter from "./routes/userRoutes";
import adminRouter from "./routes/adminRoutes";
import cookieParser from "cookie-parser";
import { responseLogger } from "./middleware/logger";

export const app: Express = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

app.use(
    cors({
    origin: process.env.frontEnd_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization","Accept"],
    })
);

app.use(responseLogger);

// app.use('/users',userRouter);

app.get("/", (req,res)=>{
    res.send("backend is running...");
});
app.use('/users',userRouter);
app.use('/admin',adminRouter);

export default app;
