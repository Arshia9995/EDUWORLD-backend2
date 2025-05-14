import connectDB from "./db";
import app from "./app";
import http from "http";


const server = http.createServer(app);



connectDB();




