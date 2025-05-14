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
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
  }

  async findAllAnnouncements(): Promise<AnnouncementDoc[]> {
    return await Announcement.find()
      .populate("createdBy", "email")
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .exec();
  }

  async update(id: string, updates: Partial<AnnouncementDoc>): Promise<AnnouncementDoc | null> {
    return await Announcement.findByIdAndUpdate(id, updates, { new: true }).exec();
  }
}

export default AnnouncementRepository;