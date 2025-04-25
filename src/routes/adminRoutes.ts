import { Router } from "express";
import AdminController from "../controllers/adminController";
import CategoryController from "../controllers/categoryController";
import AdminRepository from "../repositories/adminRepository";
import CategoryRepository from "../repositories/categoryRepository";
import UserRepository from "../repositories/userRepository";
import { AdminServices } from "../services/adminService";
import { CategoryServices } from "../services/categoryService";
import { Admin_Routes } from "../constants/routes-constants";
import { authenticateAdmin } from "../middleware/authMiddleware";
import EnrollmentRepository from "../repositories/enrollmentRepository";
import CourseRepository from "../repositories/courseRepository";
import ActivityLogRepository from "../repositories/activityRepository";


const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const activityLogRepository = new ActivityLogRepository();


const adminService = new AdminServices( userRepository, adminRepository,enrollmentRepository, courseRepository, activityLogRepository);
const categoryService = new CategoryServices(categoryRepository);

const adminController = new AdminController(adminService);
const categoryController = new CategoryController(categoryService);

const adminRouter = Router();


adminRouter.post(Admin_Routes.ADMIN_LOGIN, adminController.adminLogin.bind(adminController) as any);

adminRouter.get(Admin_Routes.GETALL_STUDENTS, authenticateAdmin(), adminController.getAllStudents.bind(adminController) as any);
adminRouter.post(Admin_Routes.BLOCK_STUDENT, authenticateAdmin(), adminController.blockUser.bind(adminController) as any);
adminRouter.post(Admin_Routes.UNBLOCK_STUDENT, authenticateAdmin(), adminController.unblockUser.bind(adminController) as any);
adminRouter.get(Admin_Routes.GETALL_INSTRUCTORS,authenticateAdmin(), adminController.getAllInstructors.bind(adminController) as any);
adminRouter.post(Admin_Routes.APPROVE_INSTRUCTOR,authenticateAdmin(), adminController.approveInstructor.bind(adminController) as any);
adminRouter.post(Admin_Routes.REJECT_INSTRUCTOR, authenticateAdmin(), adminController.rejectInstructor.bind(adminController) as any);
adminRouter.put(Admin_Routes.BLOCK_INSTRUCTOR, authenticateAdmin(), adminController.blockInstructor.bind(adminController) as any);
adminRouter.put(Admin_Routes.UNBLOCK_INSTRUCTOR,authenticateAdmin(), adminController.unblockInstructor.bind(adminController) as any);
adminRouter.post(Admin_Routes.ADMIN_LOGOUT,adminController.logoutAdmin.bind(adminController) as any);

adminRouter.post(Admin_Routes.ADD_CATEGORY, authenticateAdmin(),  categoryController.addCategory.bind(categoryController) as any);
adminRouter.get(Admin_Routes.GET_ALL_CATEGORIES,authenticateAdmin(),  categoryController.getAllCategories.bind(categoryController) as any);
adminRouter.put(Admin_Routes.EDIT_CATEGORY,authenticateAdmin(),  categoryController.updateCategory.bind(categoryController) as any);
adminRouter.put(Admin_Routes.BLOCK_CATEGORY, authenticateAdmin(), categoryController.blockCategory.bind(categoryController) as any);
adminRouter.put(Admin_Routes.UNBLOCK_CATEGORY, authenticateAdmin(),  categoryController.unblockCategory.bind(categoryController) as any);

//....................................................dashboard............................................................

adminRouter.get(Admin_Routes.ADMIN_STATS,authenticateAdmin(),  adminController.getAdminStats.bind(adminController) as any);



export default adminRouter;
