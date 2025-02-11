import { Router } from "express";
import AdminController from "../controllers/adminController";
import AdminRepository from "../repositories/adminRepository";
import UserRepository from "../repositories/userRepository";
import { AdminServices } from "../services/adminService";
import { Admin_Routes } from "../constants/routes-constants";


const adminRepository = new AdminRepository();
const userRepository = new UserRepository();

const adminService = new AdminServices( userRepository, adminRepository);
const adminController = new AdminController(adminService);

const adminRouter = Router();


adminRouter.post(Admin_Routes.ADMIN_LOGIN, adminController.adminLogin.bind(adminController) as any);
adminRouter.get(Admin_Routes.GETALL_STUDENTS, adminController.getAllStudents.bind(adminController) as any);

export default adminRouter;
