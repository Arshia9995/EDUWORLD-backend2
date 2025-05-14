import { Request, Response } from "express";
import { Status } from "../utils/enums";
import { AnnouncementService } from "../services/announcementService";


class AnnouncementController {
    constructor(private _announcementService: AnnouncementService) {
        this._announcementService = _announcementService
    }

        async getActiveAnnouncements(req: Request, res: Response) {
          try {
            const result = await this._announcementService.getActiveAnnouncements();
            if (!result.success) {
              return res.status(Status.NOT_FOUND).json({ message: result.message });
            }
      
            return res.status(Status.OK).json({
              success: true,
              message: result.message,
              data: result.data,
            });
          } catch (error: any) {
            console.error("Error in getAnnouncements controller:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: "Internal server error",
            });
          }
        }
    
}

export default AnnouncementController;