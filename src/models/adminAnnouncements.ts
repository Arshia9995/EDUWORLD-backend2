import mongoose, { Schema } from "mongoose";
import { AnnouncementDoc } from "../interfaces/IAdminAnnouncements";

const announcementSchema = new Schema<AnnouncementDoc>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

announcementSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

 export const Announcement = mongoose.model<AnnouncementDoc>("Announcement", announcementSchema);

