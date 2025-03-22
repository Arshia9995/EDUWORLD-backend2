import { Document, ObjectId} from "mongoose";

export interface CategoryDoc extends Document{
    _id: string | ObjectId;
    categoryName: string;
    isActive:boolean;
}