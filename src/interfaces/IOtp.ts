import { Document } from "mongoose";


 export interface OtpDoc extends Document {
    name: string;
    email: string;
    otp: string;
    createdAt: Date;
    expiresAt: Date;
    isUpdated: boolean;
    password: string;
    role: 'student' | 'instructor' | 'admin';
  }
  
 