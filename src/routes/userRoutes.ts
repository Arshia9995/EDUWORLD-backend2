import { RequestHandler, Router } from "express";
import UserController from "../controllers/userController";
import CategoryController from "../controllers/categoryController";
import CourseController from "../controllers/courseController";
import LessonController from "../controllers/lessonController";
import EnrollmentController from "../controllers/enrollmentController";
import PaymentController from "../controllers/paymentController";

import UserRepository from "../repositories/userRepository";
import CategoryRepository from "../repositories/categoryRepository";
import CourseRepository from "../repositories/courseRepository";
import LessonRepository from "../repositories/lessonRepository";
import EnrollmentRepository from "../repositories/enrollmentRepository";
import PaymentRepository from "../repositories/paymentRepository";

import { UserService } from "../services/userServices";
import { CategoryServices } from "../services/categoryService";
import { CourseServices } from "../services/courseService";
import { LessonServices } from "../services/lessonService";
import { EnrollmentService } from "../services/enrollmentService";
import { PaymentService } from "../services/paymentService";

import OtpRepository from "../repositories/otpRepository";
import { USER_ROUTES } from "../constants/routes-constants";
import { S3 } from "aws-sdk";
import { authenticateUser } from "../middleware/authMiddleware";



const userRepository = new UserRepository();
const otpRepository = new OtpRepository();
const categoryRepository = new CategoryRepository();
const courseRepository = new CourseRepository();
const lessonRepository = new LessonRepository();
const enrollmentRepository = new EnrollmentRepository();
const paymentRepository = new PaymentRepository();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const userService = new UserService(userRepository, otpRepository);
const categoryService = new CategoryServices(categoryRepository);
const enrollmentService = new EnrollmentService(enrollmentRepository);
const courseService = new CourseServices(courseRepository, userService, enrollmentService);
const lessonService = new LessonServices(lessonRepository, courseRepository,userService);
const paymentService =new PaymentService(paymentRepository, courseRepository);


const userController = new UserController(userService);
const categoryController = new CategoryController(categoryService);
const courseController = new CourseController(courseService);
const lessonController = new LessonController(lessonService);
const paymentController = new PaymentController(paymentService, enrollmentService);
const enrollmentController = new EnrollmentController(enrollmentService);


const userRouter = Router();

userRouter.post(USER_ROUTES.SIGN_UP, userController.signUp.bind(userController) as any);
userRouter.post(USER_ROUTES.VERIFY_OTP, userController.verifyUser.bind(userController) as any);
userRouter.post(USER_ROUTES.LOGIN, userController.loginUser.bind(userController) as any);
// userRouter.post(USER_ROUTES.GOOGLE_LOGIN, userController.googleLogin.bind(userController) as any);
userRouter.post(USER_ROUTES.RESEND_OTP, userController.resendOtp.bind(userController) as any);
userRouter.post(USER_ROUTES.FORGOT_PASSWORD, userController.forgotPassword.bind(userController) as any);
userRouter.post(USER_ROUTES.FORGOTOTP_VERIFIED,userController.forgotOtpVerify.bind(userController) as any);
userRouter.post(USER_ROUTES.RESET_PASSWORD,userController.resetPassword.bind(userController) as any);
userRouter.get(USER_ROUTES.ISEXIST, userController.isExist.bind(userController) as any);





userRouter.post(USER_ROUTES.LOGOUT, authenticateUser(), userController.logoutUser.bind(userController) as any);
userRouter.post(USER_ROUTES.GETUSERDATAFIRST,authenticateUser(), userController.getUserDataFirst.bind(userController) as any);
userRouter.put(USER_ROUTES.UPDATE_PROFILE, authenticateUser(), userController.updateProfile.bind(userController) as any);
userRouter.put(USER_ROUTES.REGISTER_INSTRUCTOR,authenticateUser(), userController.registerInstructor.bind(userController) as any);
userRouter.post(USER_ROUTES.GETS3URL, userController.getS3Url.bind(userController) as any);

userRouter.post(USER_ROUTES.VIDEO_GETS3URL, userController.videogetS3Url.bind(userController) as any);


userRouter.get(USER_ROUTES.GETINSTRUCTORBYID, authenticateUser(), userController.getInstructorById.bind(userController) as any);


userRouter.get(USER_ROUTES.FETCH_ALL_CATEGORY,authenticateUser(),  categoryController.fetchAllCategories.bind(categoryController) as any);

//....................................course routes.............................................................................


userRouter.post(USER_ROUTES.ADD_COURSE,authenticateUser(),  courseController.addCourse.bind(courseController) as any);
userRouter.post(USER_ROUTES.PUBLISH_COURSE,authenticateUser(),  courseController.publishCourse.bind(courseController) as any);
userRouter.get(USER_ROUTES.GET_PUBLISHED_COURSES,authenticateUser(),  courseController.getPublishedCourses.bind(courseController) as any);
userRouter.get(USER_ROUTES.GET_COURSE_BYID,authenticateUser(),  courseController.getCourseById.bind(courseController) as any);
userRouter.get(USER_ROUTES.GET_ALL_PUBLISHED_COURSES,authenticateUser(),  courseController.getAllPublishedCourses.bind(courseController) as any);
userRouter.get(USER_ROUTES.GET_STUDENT_COURSE_BYID,authenticateUser(),  courseController.getStudentCourseById.bind(courseController) as any);
userRouter.put(USER_ROUTES.UPDATE_COURSE,authenticateUser(),  courseController.updateCourse.bind(courseController) as any);



//....................................lesson routes.....................................................................

userRouter.post(USER_ROUTES.ADD_LESSON,authenticateUser(),  lessonController.addLesson.bind(lessonController) as any);
userRouter.get(USER_ROUTES.GET_LESSONS_BY_COURSEID,authenticateUser(),  lessonController.getLessonsByCourseId.bind(lessonController) as any);
userRouter.get(USER_ROUTES.GET_UPDATE_LESSONS_BY_COURSEID,authenticateUser(),  lessonController.getUpdateLessonsByCourseId.bind(lessonController) as any);

userRouter.get(USER_ROUTES.GET_STUDENT_LESSON_BY_COURSEID,authenticateUser(),  lessonController.getStudentLessonsByCourseId.bind(lessonController) as any);
userRouter.put(USER_ROUTES.UPDATE_LESSON,authenticateUser(), lessonController.updateLesson.bind(lessonController) as any);
userRouter.delete(USER_ROUTES.DELETE_LESSON,authenticateUser(), lessonController.deleteLesson.bind(lessonController) as any);
// Enrollment Routes
userRouter.get(USER_ROUTES.CHECK_ENROLLMENT, authenticateUser(), enrollmentController.checkEnrollment.bind(enrollmentController) as any);
userRouter.post(USER_ROUTES.CREATE_ENROLLMENT, authenticateUser(), enrollmentController.createEnrollment.bind(enrollmentController) as any);

// Payment Routes
userRouter.post(USER_ROUTES.CREATE_CHECKOUT_SESSION, authenticateUser(), paymentController.createCheckoutSession.bind(paymentController) as any);
userRouter.get(USER_ROUTES.VERIFY_PAYMENT, authenticateUser(), paymentController.verifyPayment.bind(paymentController) as any);




export default userRouter;