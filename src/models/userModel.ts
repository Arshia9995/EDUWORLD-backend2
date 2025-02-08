import mongoose from "mongoose";
import { UserDoc } from "../interfaces/IUser";

const  { Schema } = mongoose;


const userSchema = new Schema<UserDoc>({
    name: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['student', 'instructor', 'admin'] 
    },
    email: { type: String, required: true, unique: true },
    profile: {
        dob: { type: String },
        first_name: { type: String},
        gender: { 
            type: String,
            enum: ['male', 'female', 'other'],
            // required: true 
        },
        last_name: { type: String },
        profile_picture: { type: String }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    student_details: {
        additionalEmail: { type: String },
        enrolledCourses: [{
            courseid: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            progress: { type: Number, default: 0 }
        }],
        phone: { type: Number }
    },
    instructor_details: {
        createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
        profit: { type: mongoose.Schema.Types.Decimal128, default: 0 },
        rating: { type: mongoose.Schema.Types.Decimal128, default: 0 }
    },
    password: { type: String, required: true },
    isBlocked: { type: Boolean, default: false },
    verified: { type: Boolean, default: false }
});


userSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

 const User = mongoose.model<UserDoc>('User', userSchema);

 export default User;