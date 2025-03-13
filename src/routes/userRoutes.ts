import { RequestHandler, Router } from "express";
import UserController from "../controllers/userController";
import UserRepository from "../repositories/userRepository";
import { UserService } from "../services/userServices";
import OtpRepository from "../repositories/otpRepository";
import { USER_ROUTES } from "../constants/routes-constants";
import { S3 } from "aws-sdk";



const userRepository = new UserRepository();
const otpRepository = new OtpRepository();

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const userService = new UserService(userRepository, otpRepository);
const userController = new UserController(userService);


const userRouter = Router();

userRouter.post(USER_ROUTES.SIGN_UP, userController.signUp.bind(userController) as any);
userRouter.post(USER_ROUTES.VERIFY_OTP, userController.verifyUser.bind(userController) as any);
userRouter.post(USER_ROUTES.LOGIN, userController.loginUser.bind(userController) as any);
userRouter.post(USER_ROUTES.LOGOUT, userController.logoutUser.bind(userController) as any);
userRouter.post(USER_ROUTES.GETUSERDATAFIRST, userController.getUserDataFirst.bind(userController) as any);
userRouter.post(USER_ROUTES.RESEND_OTP, userController.resendOtp.bind(userController) as any);
userRouter.post(USER_ROUTES.FORGOT_PASSWORD, userController.forgotPassword.bind(userController) as any);
userRouter.post(USER_ROUTES.FORGOTOTP_VERIFIED,userController.forgotOtpVerify.bind(userController) as any);
userRouter.post(USER_ROUTES.RESET_PASSWORD,userController.resetPassword.bind(userController) as any);
userRouter.put(USER_ROUTES.UPDATE_PROFILE, userController.updateProfile.bind(userController) as any);
userRouter.get(USER_ROUTES.ISEXIST, userController.isExist.bind(userController) as any);
userRouter.put(USER_ROUTES.REGISTER_INSTRUCTOR, userController.registerInstructor.bind(userController) as any);
userRouter.post(USER_ROUTES.GETS3URL, userController.getS3Url.bind(userController) as any);
userRouter.get(USER_ROUTES.GETINSTRUCTORBYID, userController.getInstructorById.bind(userController) as any);




export default userRouter;