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
import { walletModel } from "../models/walletModel";
import WalletController from "../controllers/walletController";
import { WalletService } from "../services/walletService";
import WalletRepository from "../repositories/walletRepository";
import AdminWalletRepository from "../repositories/adminWalletRepository";
import { CourseStatsRepository } from "../repositories/courseStatsRepository";
import { CourseStatsService } from "../services/courseStatsService";
import { CourseStatsController } from "../controllers/courseStatsController";
import PaymentRepository from "../repositories/paymentRepository";
import { PaymentService } from "../services/paymentService";
import PaymentController from "../controllers/paymentController";
import { EnrollmentService } from "../services/enrollmentService";
import LessonRepository from "../repositories/lessonRepository";
import { UserService } from "../services/userServices";
import OtpRepository from "../repositories/otpRepository";


const adminRepository = new AdminRepository();
const userRepository = new UserRepository();
const categoryRepository = new CategoryRepository();
const enrollmentRepository = new EnrollmentRepository();
const courseRepository = new CourseRepository();
const activityLogRepository = new ActivityLogRepository();
const walletRepository = new WalletRepository();
const adminWalletRepository = new AdminWalletRepository();
const courseStatsRepository = new CourseStatsRepository();
const paymentRepository = new PaymentRepository();
const lessonRepository = new LessonRepository();
const otpRepository = new OtpRepository();


const adminService = new AdminServices( userRepository, adminRepository,enrollmentRepository, courseRepository, activityLogRepository);
const categoryService = new CategoryServices(categoryRepository);
const walletService = new WalletService(walletRepository, adminWalletRepository)
const courseStatsService = new CourseStatsService(courseStatsRepository);
const paymentService = new PaymentService(paymentRepository,courseRepository,walletService,adminRepository)
const userService = new UserService(userRepository,otpRepository)
const enrollmentService = new EnrollmentService(enrollmentRepository,courseRepository,userService,lessonRepository)

const adminController = new AdminController(adminService);
const categoryController = new CategoryController(categoryService);
const walletController = new WalletController(walletService);
const courseStatsController = new CourseStatsController(courseStatsService);
const paymentController = new PaymentController(paymentService, enrollmentService)

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

//.....................................................wallet.................................................................

adminRouter.get(Admin_Routes.ADMIN_WALLET,authenticateAdmin(),  walletController.getAdminWalletDetails.bind(walletController) as any);


adminRouter.get(Admin_Routes.COURSE_STATS,authenticateAdmin(),  courseStatsController.getCourseStats.bind(courseStatsController) as any);


adminRouter.get(Admin_Routes.GET_ALL_PAYMENT_HISTORY,authenticateAdmin(),  paymentController.getAllPaymentHistory.bind(paymentController) as any);


export default adminRouter;
