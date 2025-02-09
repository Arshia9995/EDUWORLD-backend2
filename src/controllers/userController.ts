import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import UserRepository from "../repositories/userRepository";
import { Status } from "../utils/enums";
import { UserDoc } from "../interfaces/IUser";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";


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
            console.log(result.data, "in the bakcend signup before sending to frontend")

            return res.status(Status.CREATED).json(result.data);
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

                console.log("inside verify otp")
                

                res.cookie("token", result.data.token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000, // 1 day
                });

                res.cookie("refreshToken", result.data.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
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
            const { email, password } = req.body;
    
            if (!email || !password) {
                return res.status(Status.BAD_REQUEST).json({
                    success: false,
                    message: "Email and password are required",
                });
            }
    
            const result = await this._userService.loginUser(email, password);
    
            if (!result.success || !result.data) {
                return res.status(Status.UN_AUTHORISED).json(result);
            }
    
            const { _id, email: userEmail, role } = result.data;
    
            // Generate tokens
            const token = generateToken({ id: _id, email: userEmail, role });
            const refreshToken = generateRefreshToken({ id: _id, email: userEmail, role });
    
            // Set cookies
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            });
    
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });
    
            return res.status(Status.OK).json({
                success: true,
                message: "Login successful",
                data: { ...result.data, token, refreshToken }, // Return tokens in response if needed
            });
    
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
            console.log("going to logout by JAVED");
            // Clear cookies (even if not in req.cookies)
            res.clearCookie("token", {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
    
            res.clearCookie("refreshToken",{
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
    
            console.log("User logged out successfully");
    
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
            console.log("getUserDataFirst in the backend",token)
            if (!token) {
                return res.status(401).json({ success: false, message: "No token provided" });
            }
    
            const decoded: any = await verifyToken(token);
            
            if (!decoded || !decoded._id) {
                return res.status(401).json({ success: false, message: "Invalid token" });
            }

            const userDetails = await this._userService.getUserDataFirst(decoded.id);
            const userData = {
                _id: userDetails?._id,
                email: userDetails?.email,
                isBlocked: userDetails?.isBlocked,
                verified: userDetails?.verified,
                role: userDetails?.role,
                name: userDetails?.name
            }

            return res.status(Status.OK).json({
                success:true,
                data: userData,
                message: "data successefully fetched"
            })
        } catch (error) {
            console.log("Error in getUserDataFirst Controller",error)
        }
    }

    async resendOtp(req: Request, res: Response) {

        try {
            const { email } = req.body;
            if(!email){
                return res.status(Status.UN_AUTHORISED)
                .json({ success: false, message: "UnAuthorised Approach" });

            }

            const result = await this._userService.resendOtp(email);

            return res.status(Status.OK).json(result);

        } catch (error) {
            console.error("Error in user resend otp controler:", error);

            if (error instanceof Error) {
                if (error.message === "NO User Found") {
                  res
                    .status(Status.UN_AUTHORISED)
                    .json({ message: "Unauthorized: Email not valid" });
                  return;
                }
              }

              return res
              .status(Status.INTERNAL_SERVER_ERROR)
              .json({ success: false, message: "Internal Server Error" });
            
        }

    }

    async forgotPassword(req: Request, res:Response) {
        try {
            const { email} = req.body;
            const result = await this._userService.forgotPassword(email);
            return res.status(Status.OK).json(result);
        } catch (error:any) {
            console.error(error);
            if (error.message === "Your email is not registered") {
                return res.status(404).json({ success: false, message: error.message });
            }
    
            return res
              .status(Status.INTERNAL_SERVER_ERROR)
              .json({ success: false, message: "Internal server error" });
          
            
        }
    }


}

export default UserController;