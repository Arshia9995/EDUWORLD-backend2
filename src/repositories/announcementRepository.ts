import { title } from "process";
import { AnnouncementDoc } from "../interfaces/IAdminAnnouncements";
import { Announcement } from "../models/adminAnnouncements";
import { BaseRepository } from "./baseRepository";

class AnnouncementRepository extends BaseRepository<AnnouncementDoc> {
  constructor() {
    super(Announcement);
  }

  async findActiveAnnouncements(): Promise<AnnouncementDoc[]> {
    return await Announcement.find({ isActive: true })
      .populate("createdBy", "email")
      .sort({ createdAt: -1 }) 
      .exec();
  }


   async findAnnouncement(title: string, content: string):  Promise<any> {

    return await Announcement.findOne({title: title, content: content})
   }  

  async findAllAnnouncements(): Promise<AnnouncementDoc[]> {
    return await Announcement.find()
      .populate("createdBy", "email")
      .sort({ createdAt: -1 }) 
      .exec();
  }

  async update(id: string, updates: Partial<AnnouncementDoc>): Promise<AnnouncementDoc | null> {
    return await Announcement.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}

export default AnnouncementRepository;