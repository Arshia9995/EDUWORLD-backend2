import mongoose,{Schema,Document} from "mongoose";

export interface ICourse extends Document{
    _id: mongoose.Types.ObjectId,
    title:string,
    description:string,
    thumbnail?:string,
    instructor?:mongoose.Types.ObjectId | string, 
    category:mongoose.Types.ObjectId | string,
    price:number,  
    language:string,
    duration?:string,
    isPublished?: boolean,
    lessons?:mongoose.Types.ObjectId[]
    rating?: number,
    isBlocked?: boolean,
}