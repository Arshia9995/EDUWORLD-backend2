import mongoose,{Schema,Document} from "mongoose";
import { UserDoc } from "./IUser";

export interface ICourse extends Document{
    _id: mongoose.Types.ObjectId,
    title:string,
    description:string,
    thumbnail?:string,
    instructor?:any, 
    category:mongoose.Types.ObjectId | string,
    price:number,  
    language:string,
    duration?:string,
    isPublished?: boolean,
    lessons?:mongoose.Types.ObjectId[]
    rating?: number,
    isBlocked?: boolean,
}