import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import { generateOtp } from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs";
import sendMail from "../utils/mailer";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import User from "../models/userModel";
import { validateName, validateEmail, validatePassword } from "../utils/validations";
import { Role } from "../utils/enums";
import { IUserService } from "../interfaces/IServices";



export class UserService implements IUserService {
    constructor(
        private _userRepository: UserRepository,
        private _otpRepository: OtpRepository
    ){
        this._userRepository = _userRepository;
        this._otpRepository = _otpRepository;
    }

    async signUp(user: UserDoc) {
        const email = user.email;
        const name = user.name;

        const existingEmail = await this._userRepository.findByQuery({ email : email});
        if (existingEmail) {
            return {
              success: false,
              message: "Email already exists",
              data: null,
            };
          }

        const salt = bcrypt.genSaltSync(10);
        const password: string = user.password;
        
        validateName(name);
        validateEmail(email);
        validatePassword(password);

        user.password = bcrypt.hashSync(password, salt);
        user.role = Role.student
      
        const newUser = await this._userRepository.create(user)
        
        if(!newUser) {
            return {
                success: false,
                message: "Something went wrong",
                data: null,
              };
        }

        const newOtp = generateOtp();
        console.log("OTP IS.....:",newOtp);

        sendMail("EduWorld", "OTP", newUser.email, newOtp);

        const newOtpData = {
            email: email,
            otp: newOtp,
            CreatedAt: new Date(),
            ExpiresAt: new Date(Date.now() + 2 * 60 * 1000),
            isUpdated: false,
          };

          console.log("OTP Data:",newOtpData);
          

          await this._otpRepository.create(newOtpData);
        console.log("user has been created")
          return {
            success: true,
            message: "User created successfully",
            data: { name: newUser.name, 
                email: newUser.email,
                role: user.role,
                isBlocked : newUser.isBlocked,
                verified: newUser.verified,
                _id: newUser._id
                } 
          };

    }

    async verifyUser(otp: string, email: string ) {
        try {
            const otpData = await this._otpRepository.findByQuery({ email: email});
            if(!otpData) {
                console.log("otp not found");
                return {
                    success: false,
                    message: "Invalid Otp",
                    data: null,
                };   
            }
            if(otpData.otp !== otp) {
                console.log("invalid Otp");
                return {
                    success: false,
                    message: "Invalid OTP",
                    data: null,
                };
                
            }
            if(otpData.expiresAt < new Date()) {
                console.log("otp expired");
                return {
                    success: false,
                    message: "OTP expired",
                    data:null,
                };
                
            }

            const user = await this._userRepository.findByQuery({ email: email})

            if(!user) {
                return {
                    success: false,
                    message: "Something went wrong",
                    data: null,
                };
            }
            user.verified = true;
            user.save();

            const token = generateToken({ id: user._id, email: user.email, role: user.role });
            const refreshToken = generateRefreshToken({ id: user._id, email: user.email, role: user.role});

            const existingOtp = await this._otpRepository.findByQuery({ email: email});

            await this._otpRepository.update(existingOtp?._id as string, {otp: ""});
            return {
                success: true,
                message: "User verified successfully",
                data: {
                    token,
                    refreshToken,
                  },
                
            };
            
        } catch (error) {
            console.error("User verification error:",error);
            return {
                success: false,
                message: 'Failed to verify User Otp',
                data: null,
            }
            
        }
    }


    async loginUser(email: string, password: string) {
        try {
            const user = await this._userRepository.findByQuery({ email });
            if(!user) {
                return {
                    success: false,
                    message: "User not fouund",
                    data: null,
                };
            }

            if(!user.verified) {
                return {
                    success: false,
                    message: "User not verified. Please verify your email.",
                    data: null,
                };
            }

            const isMatch = bcrypt.compareSync(password, user.password);
            if(!isMatch) {
                return {
                    success: false,
                    message: "Invalid email or password",
                    data: null,

                };
            }
            
            return {
                success: true,
                message: "Login successful",
                data: { name: user.name, 
                    email: user.email,
                    role: user.role,
                    isBlocked : user.isBlocked,
                    verified: user.verified,
                    _id: user._id
                    } 
            };


        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "Internal Server Error",
                data: null,
            };
        }
    }

    async getUserDataFirst(id: string) {
        try {
            const userDetails = await this._userRepository.findById(id);
            return userDetails;
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }
    



}










