import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";
import { Status } from "../utils/enums";
import { UserDoc } from "../interfaces/IUser";
import { verifyToken } from "../utils/jwt";


const userRepository = new UserRepository();

class UserController {
    constructor(private _userService: UserService) {
        this._userService = _userService;
    }


    async signUp (req: Request, res: Response) {
        try {
            const newUser = req.body as UserDoc;

            const result = await this._userService.signUp(newUser);

            if(!result.success) {
                return res.status(Status.CONFLICT).json(result);
            }

            return res.status(Status.CREATED).json(result);
        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error",
            });
            
        }
    }


    async verifyUser(req: Request, res: Response) {
        try {
            const { email, otp,password,role } = req.body;

            if(!otp || !email){
                return res.status(Status.BAD_REQUEST).json({message: "Email and OTP required"});
                
            }

            const registeredUser = await userRepository.findByQuery({ email : email});

            const result = await this._userService.verifyUser(otp, email);

            if(result?.success && result.data) {

                res.cookie("token", result.data.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 24 * 60 * 60 * 1000, // 1 day
                });

                res.cookie("refreshToken", result.data.refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                });



                return res.status(Status.OK).json(result);
            }
          
            if(result?.message === "invalid Otp" || result?.message === "OTP expired") {
                return res.status(Status.NOT_FOUND).json(result);
            }

            return res.status(Status.BAD_REQUEST).json({
                success: false,
                message: result?.message || "Verification failed",
            });

           

        } catch (error) {
            console.error("Error creating user:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
              success: false,
              message: "Internal Server Error",
            });
            
        }
    }

    async loginUser(req: Request, res: Response) {
        try {
            const { email, password} = req.body;

            if(!email || !password) {
                return res.status(Status.BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required",
                });
            }

            const result = await this._userService.loginUser( email, password);

            if(!result.success || !result.data) {
                return res.status(Status.UN_AUTHORISED).json(result);
            }

            res.cookie("token", result.data.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });

            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });



            return res.status(Status.OK).json(result);

        } catch (error) {
            console.error("Login error:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error",
            });
            
        }
    }


    async logoutUser(req: Request, res: Response) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
    
            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
    
            return res.status(Status.OK).json({
                success: true,
                message: "Logout successful",
            });
        } catch (error) {
            console.error("Logout error:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }
    
    async getUserDataFirst(req:Request,res:Response){
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ success: false, message: "No token provided" });
            }
    
            const decoded: any = verifyToken(token);
            
            if (!decoded || !decoded._id) {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }
            console.log(decoded)
    
            const userId = decoded._id;

        } catch (error) {
            
        }
    }






}

export default UserController;