import express,{ Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import userRouter, { paymentController } from "./routes/userRoutes";
import adminRouter from "./routes/adminRoutes";
import cookieParser from "cookie-parser";
import { responseLogger } from "./middleware/logger";
import initializeSocket from "./utils/socket";
import { USER_ROUTES } from "./constants/routes-constants";
import http from "http";

export const app: Express = express();

const server = http.createServer(app);

// Initialize Socket.IO


initializeSocket(server);

dotenv.config();

app.post("/webhook-payment", express.raw({ type: "application/json" }), paymentController.webhookPayment.bind(paymentController));


app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cookieParser());

app.use(
    cors({
    origin: process.env.frontEnd_URL || 'https://eduworld.space',
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


server.listen(process.env.PORT, () => {
    console.log(`server is running on http://localhost:${process.env.PORT}`);
    
})


export default app;
