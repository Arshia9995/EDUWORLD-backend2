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

 
  async findByTitle(title: string, excludeId?: string): Promise<AnnouncementDoc | null> {
    try {
      const query: any = { title };
      if (excludeId) {
        query._id = { $ne: excludeId }; 
      }
      return await this._model.findOne(query).exec();
    } catch (error) {
      console.error("Error finding announcement by title:", error);
      throw new Error("Could not query announcement");
    }
  }
}

export default AnnouncementRepository;