import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";
import { UserDoc } from "../interfaces/IUser";
import { AdminServices } from "../services/adminService";
import AdminRepository from "../repositories/adminRepository";
import { AdminDoc } from "../interfaces/IAdmin";
import { IAdminService } from "../interfaces/IServices";




class AdminController {
    constructor(private _adminService: AdminServices) {
        this._adminService = _adminService;
    }

    async adminLogin (req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const result = await this._adminService.adminLogin(email, password);

            if(!result.success) {
                return res.status(401).json({ message: result.message });
            }
            return res.status(200).json({ message: result.message });
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





}


export default AdminController;