import express,{ Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import userRouter from "./routes/userRoutes";
import cookieParser from "cookie-parser";

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

// app.use('/users',userRouter);

app.get("/", (req,res)=>{
    res.send("backend is running...");
});
app.use('/users',userRouter);

export default app;
