import { AnnouncementDoc } from "../interfaces/IAdminAnnouncements";
import AnnouncementRepository from "../repositories/announcementRepository";
import { IAnnouncementService } from "../interfaces/IServices";
import mongoose from "mongoose";

interface AnnouncementServiceResponse {
  success: boolean;
  message: string;
  data?: AnnouncementDoc | AnnouncementDoc[];
}

export class AnnouncementService implements IAnnouncementService {
  constructor(
    private _announcementRepository: AnnouncementRepository
) {
    this._announcementRepository = _announcementRepository;
  }

  async createAnnouncement(
    title: string,
    content: string,
    createdBy: mongoose.Types.ObjectId
  ){
    try {

        const existingAnnouncement = await this._announcementRepository.findByTitle(title);
    
        if (existingAnnouncement) {
          return {
            success: false,
            message: "An announcement with the same title already exists",
          };
        }

      const announcement = await this._announcementRepository.create({
        title,
        content,
        createdBy,
        isActive: true,
      }); 

      return {
        success: true,
        message: "Announcement created successfully",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error creating announcement:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  async getAllAnnouncements(): Promise<AnnouncementServiceResponse> {
    try {
      const announcements = await this._announcementRepository.findAllAnnouncements();
      if (announcements.length === 0) {
        return { success: false, message: "No active announcements found" };
      }
      return {
        success: true,
        message: "Announcements retrieved successfully",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  async deactivateAnnouncement(id: string): Promise<AnnouncementServiceResponse> {
    try {
      const announcement = await this._announcementRepository.update(id, { isActive: false });
      if (!announcement) {
        return { success: false, message: "Announcement not found" };
      }
      return {
        success: true,
        message: "Announcement deactivated successfully",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error deactivating announcement:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  async reactivateAnnouncement(id: string): Promise<AnnouncementServiceResponse> {
    try {
      const announcement = await this._announcementRepository.update(id, { isActive: true });
      if (!announcement) {
        return { success: false, message: "Announcement not found" };
      }
      return {
        success: true,
        message: "Announcement reactivated successfully",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error reactivating announcement:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  async updateAnnouncement(id: string, title: string, content: string): Promise<AnnouncementServiceResponse> {
    try {

        const existingAnnouncement = await this._announcementRepository.findByTitle(title, id);
    
        if (existingAnnouncement) {
          return {
            success: false,
            message: "Another announcement with the same title already exists",
          };
        }

      const announcement = await this._announcementRepository.update(id, { title, content });
      if (!announcement) {
        return { success: false, message: "Announcement not found" };
      }
      return {
        success: true,
        message: "Announcement updated successfully",
        data: announcement,
      };
    } catch (error: any) {
      console.error("Error updating announcement:", error);
      return { success: false, message: "Internal server error" };
    }
  }

  async getActiveAnnouncements(): Promise<AnnouncementServiceResponse> {
    try {
      const announcements = await this._announcementRepository.findActiveAnnouncements();
      if (announcements.length === 0) {
        return { success: false, message: "No active announcements found" };
      }
      return {
        success: true,
        message: "Announcements retrieved successfully",
        data: announcements,
      };
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      return { success: false, message: "Internal server error" };
    }
  }
}