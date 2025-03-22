import mongoose, { Document } from "mongoose";



export interface ILesson extends Document{
    _id: mongoose.Types.ObjectId,
    lessonNumber: number,
    title: string,
    description: string,
    video: string,
    duration?: string,
    course: mongoose.Types.ObjectId,

   
}