import mongoose from "mongoose";
import { OtpDoc } from "../interfaces/IOtp";

const { Schema } = mongoose;


const OTP = new Schema<OtpDoc>({
    name: {
        type: String,
        // required: true
    },
    email: {
      type: String,
    //   required: true
    },
    otp: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 1
    },
    expiresAt: {
        type: Date,
        // required: true,
      },
      isUpdated: {
        type: Boolean,
        default: false,
      },
    password: {
        type: String,
        // required: true
    },
    role: {
        type: String,
        // required: true,
        enum: ['student', 'instructor', 'admin']
    },
  
  });

  export default mongoose.model<OtpDoc>('Otp', OTP);