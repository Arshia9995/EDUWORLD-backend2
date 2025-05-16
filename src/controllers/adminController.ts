import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";
import { UserDoc } from "../interfaces/IUser";
import { AdminServices } from "../services/adminService";
import AdminRepository from "../repositories/adminRepository";
import { AdminDoc } from "../interfaces/IAdmin";
import { IAdminService } from "../interfaces/IServices";
import { generateToken, generateRefreshToken } from "../utils/jwt";
import { Status } from "../utils/enums";
import { AuthRequest } from "../middleware/authMiddleware";
import { AnnouncementService } from "../services/announcementService";
import mongoose from "mongoose";




class AdminController {
    constructor(
      private _adminService: AdminServices,
      private _announcementService: AnnouncementService

    ) {
        this._adminService = _adminService;
        this._announcementService = _announcementService;
    }

    async adminLogin (req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await this._adminService.adminLogin(email, password);

            if(!result.success || !result.data) {
                return res.status(401).json({ message: result.message });
            
            }

            const token = generateToken({ id: result.data._id, email: result.data.email, role: 'admin' });
            const refreshToken = generateRefreshToken({ id: result.data._id, email: result.data.email, role: 'admin' });


            // Set cookies
        res.cookie("admintoken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie("adminrefreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.status(200).json({ 
            message: result.message,
            data: {
                ...result.data,
                token,
                refreshToken
            }
        });

        } catch (error: any) {
            return res.status(500).json({ message: "Server error", error: error.message });
        }
    }

    async getAllStudents(re: Request, res: Response) {
        try {
            const result = await this._adminService.getAllStudents();

            if (!result.success) {
                return res.status(404).json({ message: result.message });
            }
           return res.status(200).json({ message: result.message, students: result.data });


        } catch (error) {
            console.error("Error in getAllStudents controller:", error);
            return res.status(500).json({ message: "Internal server error" });
            
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            const { userId } = req.body;
            if(!userId) {
                return res.status(400).json({ message: "User ID is required" }); 
            }

            const result = await this._adminService.blockUser(userId);

            if(!result.success) {
                return res.status(400).json({ message: result.message });
            }
            return res.status(200).json({
                message: result.message,
                user: result.data
              });
        } catch (error) {
            console.error("Error in blockUser controller:", error);
      return res.status(500).json({ message: "Internal server error" });
        }
    }

    async unblockUser(req: Request, res: Response) {
        try {
            const { userId } = req.body;

            if(!userId) {
                return res.status(400).json({message:"User ID is required" });
            }

            const result = await this._adminService.unblockUser(userId);
            if(!result.success) {
                return res.status(400).json({message: result.message});
            }

            return res.status(200).json({
                message: result.message,
                user: result.data
              });
        } catch (error) {
            console.error("Error in unblockUser controller:", error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    
    async getAllInstructors(req: Request, res: Response) {
        try {
            
            const result = await this._adminService.getAllInstructors();

            if (!result.success) {
                return res.status(404).json({ message: result.message });
            }
           return res.status(200).json({ message: result.message, instructors: result.data });


        } catch (error) {
            console.error("Error in getAllInstructors controller:", error);
            return res.status(500).json({ message: "Internal server error" });
            
        }
    }

    async approveInstructor (req: Request, res: Response) {
        try {
            const { instructorId } = req.body;
            const result = await this._adminService.approveInstructor(instructorId);
            if (!result.success) {
                return res.status(400).json({ message: result.message });
              }
             return res.status(200).json(result.data); 
        } catch (error) {
            console.error("Error approving instructor:", error);
            return res.status(500).json({ message: "Internal server error" });
            
        }
    }

    async rejectInstructor(req: Request, res: Response) {
        try {
          const { instructorId } = req.body;
          const result = await this._adminService.rejectInstructor(instructorId);
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
          return res.status(200).json(result.data);
        } catch (error) {
          console.error("Error rejecting instructor:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }

      async blockInstructor(req: Request, res: Response) {
        try {
          const { instructorId } = req.body;
    
          if (!instructorId) {
            return res.status(400).json({ message: "Instructor ID is required" });
          }
    
          const result = await this._adminService.blockInstructor(instructorId);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({
            message: result.message,
            instructor: result.data,
          });
        } catch (error) {
          console.error("Error in blockInstructor controller:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
    
      async unblockInstructor(req: Request, res: Response) {
        try {
          const { instructorId } = req.body;
    
          if (!instructorId) {
            return res.status(400).json({ message: "Instructor ID is required" });
          }
    
          const result = await this._adminService.unblockInstructor(instructorId);
    
          if (!result.success) {
            return res.status(400).json({ message: result.message });
          }
    
          return res.status(200).json({
            message: result.message,
            instructor: result.data,
          });
        } catch (error) {
          console.error("Error in unblockInstructor controller:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      }
 async logoutAdmin(req: Request, res: Response) {
        try {
          
            res.clearCookie("admintoken", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
    
            res.clearCookie("adminrefreshToken",{
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
    
            console.log("Admin logged out successfully");
    
            return res.status(Status.OK).json({
                success: true,
                message: "Admin Logout successful",
            });
        } catch (error) {
            console.error("Logout error:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }

    async getAdminStats(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: 'Unauthorized: Admin access required',
            });
          }
    
          const stats = await this._adminService.getAdminStats();
    
          return res.status(Status.OK).json(stats);
        } catch (error: any) {
          console.error('Error in AdminController.getAdminStats:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to fetch admin stats',
          });
        }
      }


      async createAnnouncement(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id || req.user.role !== "admin") {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Admin access required",
            });
          }
    
          const { title, content } = req.body;
          if (!title || !content) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Title and content are required",
            });
          }


    
          const result = await this._announcementService.createAnnouncement(title, content, new mongoose.Types.ObjectId(req.user.id));

        


          

          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            data: result.data,
          });
        } catch (error: any) {
          console.error("Error in createAnnouncement controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }
    
      async getAnnouncements(req: Request, res: Response) {
        try {
          const result = await this._announcementService.getAllAnnouncements();
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
    
      async deactivateAnnouncement(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id || req.user.role !== "admin") {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Admin access required",
            });
          }
    
          const { announcementId } = req.body;
          if (!announcementId) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Announcement ID is required",
            });
          }
    
          const result = await this._announcementService.deactivateAnnouncement(announcementId);
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            data: result.data,
          });
        } catch (error: any) {
          console.error("Error in deactivateAnnouncement controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }

      

      async reactivateAnnouncement(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id || req.user.role !== "admin") {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Admin access required",
            });
          }
    
          const { announcementId } = req.body;
          if (!announcementId) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Announcement ID is required",
            });
          }
    
          const result = await this._announcementService.reactivateAnnouncement(announcementId);
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            data: result.data,
          });
        } catch (error: any) {
          console.error("Error in reactivateAnnouncement controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }

      async updateAnnouncement(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id || req.user.role !== "admin") {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Admin access required",
            });
          }
    
          const { announcementId, title, content } = req.body;
          if (!announcementId || !title || !content) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Announcement ID, title, and content are required",
            });
          }
    
          const result = await this._announcementService.updateAnnouncement(announcementId, title, content);
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            data: result.data,
          });
        } catch (error: any) {
          console.error("Error in updateAnnouncement controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }



    }
    


export default AdminController;