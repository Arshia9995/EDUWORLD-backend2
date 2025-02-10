import { Document } from "mongoose";

export interface AdminDoc extends Document {
    email:string,
    password: string
};