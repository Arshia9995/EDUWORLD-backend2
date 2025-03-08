import { Document, ObjectId } from "mongoose";


export interface UserDoc extends Document  {
    _id: ObjectId;
    name: string;
    role: 'student' | 'instructor' | 'admin';
    email: string;
    profile?: {
        dob?: string;
    
        gender?: 'male' | 'female' | 'other';
        phone?: string,
        address?: string,
        profileImage?: string;
    };
    qualification?: string;
    cv?: string;
    isApproved?: boolean;
    isRequested?: boolean;
    isRejected?: boolean;

    created_at?: Date;
    updated_at?: Date;
    student_details?: {
        additionalEmail?: string;
        enrolledCourses?: Array<{
            courseid?: string;
            progress?: number;
        }>;
       
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