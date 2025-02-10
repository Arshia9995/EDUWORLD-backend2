import mongoose from "mongoose";
import { AdminDoc } from "../interfaces/IAdmin";

const {Schema } = mongoose;


const AdminSchema=  new Schema<AdminDoc>({
    email: {
        type: String,
        required: true
      },
      password: {
        type: String,
        required: true
    },

})

export default mongoose.model<AdminDoc>('Admin', AdminSchema);