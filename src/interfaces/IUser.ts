import { Document, ObjectId } from "mongoose";


export interface UserDoc extends Document  {
    _id: ObjectId;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    email: string;
    profile?: {
        dob?: string;
        first_name?: string;
        gender?: 'male' | 'female' | 'other';
        last_name?: string;
        profile_picture?: string;
    };
    created_at?: Date;
    updated_at?: Date;
    student_details?: {
        additionalEmail?: string;
        enrolledCourses?: Array<{
            courseid?: string;
            progress?: number;
        }>;
        phone?: number;
    };
    instructor_details?: {
        createdCourses?: string[];
        profit?: number;
        rating?: number;
    };
    password: string;
    isBlocked?: boolean;
    verified?: boolean;
}