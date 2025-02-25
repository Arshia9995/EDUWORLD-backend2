import { UserDoc } from "../interfaces/IUser";
import UserRepository from "../repositories/userRepository";
import { generateOtp } from "../utils/otp";
import OtpRepository from "../repositories/otpRepository";
import bcrypt from "bcryptjs";
import sendMail from "../utils/mailer";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwt";
import User from "../models/userModel";
import { validateName, validateEmail, validatePassword, validatePhone, validateDOB, validateAddress, validateGender } from "../utils/validations";
import { Role } from "../utils/enums";
import { IUserService } from "../interfaces/IServices";
import { profile } from "console";



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
        const role = user.role;

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
        // user.role = Role.student
      
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
            ExpiresAt: new Date(Date.now() + 1* 60 * 1000),
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
                role: newUser.role,
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
                    _id: user._id,
                    profile: {
                    phone: user.profile?.phone,
                    dob: user.profile?.dob,
                    address: user.profile?.address,
                    gender: user.profile?.gender
                    }
                
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
            if (!userDetails) {
                return null;
            }
            return userDetails;
        } catch (error) {
            console.error("Error fetching user data:", error);
            throw error;
        }
    }


    async resendOtp(email : string) {
        try {
            const registeredUser = await this._userRepository.findByQuery({ email: email});

            if(!registeredUser){
                return { success: false, message: "No user Found" };
            }

            const otp = generateOtp();
            sendMail("EduWorld", "Resended Otp", email, otp);
            console.log("resend otp",otp);
            const otpData = {
                otp: otp,
                ExpiresAt: new Date(Date.now() + 1* 60 * 1000),
            };

            const existingOtp = await this._otpRepository.findByQuery({email: email});

            await this._otpRepository.update(existingOtp?._id as string, otpData);
            return {
                success: true,
                message: "otp resend successfully",
            };

            
        } catch (error) {
            console.error("Error from Userservice.resendOtp", error);
            return {
                success: false,
                message:'Failed to Resend Otp'
              }
            
        }
    }

    async forgotPassword(email: string) {
        try {
            const user = await this._userRepository.findByQuery({ email: email});
            if (!user) {
                throw new Error("Your email is not registered");
              }

              const newOtp = generateOtp();
              sendMail("EduWorld","Forgot password", user.email, newOtp);
              const otpData = {
                otp: newOtp,
                ExpiresAt: new Date(Date.now() + 1* 60 * 1000),

              };

              const existingOtp = await this._otpRepository.findByQuery({ email: email});

              if (existingOtp) {
                await this._otpRepository.update(existingOtp._id as string, otpData);
            } else {
                await this._otpRepository.create({ email, ...otpData }); // ✅ Insert new OTP if none exists
            }

              console.log(newOtp, "the forgot password otp");

              return {
                success: true,
                message: "Otp sent to your email successfully",
                data: null,
              };

        } catch (error: any){
            console.error(error);
            if (error.message === "Your email is not registered") {
      return {
        success: false,
        message: error.message,
        data: null,
      };
            
        }
        return {
            success: false,
            message: "Server error, please try again later",
            data: null,
          };

    }
}


async forgotOtpVerify(email: string, otp: string) {
    try {
        const otpData = await this._otpRepository.findByQuery({ email: email})
        if(!otpData ||  !otpData.otp) {
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
     

        // const existingOtp = await this._otpRepository.findByQuery({ email: email});

        await this._otpRepository.update(otpData._id as string, { otp: "" });
        return {
            success: true,
            message: "OTP verified successfully!",
            data: null,
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

async resetPassword(email: string,password:{newPassword: string, confirmPassword: string}) {
    try {
        const salt = bcrypt.genSaltSync(10);
        validatePassword(password.newPassword);

        const hashedPassword = bcrypt.hashSync(password.newPassword, salt);
        const userExist = await this._userRepository.findByQuery({email: email});
        if (!userExist) {
            return {
              success: false,
              message: "No User Found",
            };
          }

          const id: string = userExist?._id.toString();
          const user = await this._userRepository.update(id, {
           password: hashedPassword,
          });

          if (!user) {
            return {
              success: false,
              message: "Something went wrong",
              data: null,
            };
          }
          return {
            success: true,
            message: "Password changed successfully",
            data: null,
          };


    } catch (error) {
        console.log(error);
      return {
        success: false,
        message:'Failed to change password'
      }
        
    }
}

async updateProfile(email: string, userData :UserDoc) {
    try {
        const userExists = await this._userRepository.findByQuery({email: email});
        if (!userExists) {
            return {
                success: false,
                message: "User not found",
                data: null
            };
        }

        if (userData.email && userData.email !== userExists.email) {
            return {
                success: false,
                message: "Email cannot be updated",
                data: null
            };
        }

        const { name, profile } = userData;
        const { phone, dob, address, gender } = profile || {};


        if (name) validateName(name);
        if (phone) validatePhone(phone);
        if (dob) validateDOB(dob);
        if (address) validateAddress(address);
        if (gender) validateGender(gender);

        const updatedUser = await this._userRepository.update(userExists._id, {
            name: name,
            profile: {
                phone,
                dob,
                address,
                gender
            }
        });

        if (!updatedUser) {
            return {
                success: false,
                message: "Failed to update profile",
                data: null
            };
        }

        return {
            success: true,
            message: "Profile updated successfully",
            data: {
                name: updatedUser.name,
                email: updatedUser.email,
                profile : {
                    phone: updatedUser.profile?.phone,
                    dob: updatedUser.profile?.dob,
                    address: updatedUser.profile?.address,
                    gender: updatedUser.profile?.gender
                }
            }
        };

    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: 'Failed to update profile',
            data: null
        };
        
    }
}

async isExist(id: string) {
    try {
        const userDetails = await this._userRepository.findById(id);

        if (!userDetails) {
            return {
                success: false,
                data: null,
                message: "User not found"
            };
        }

        return {
            success: true,
            data: {
                _id: userDetails._id,
                isBlocked: userDetails.isBlocked
            },
            message: "User found"   
        };

    } catch (error) {
        console.error("Error fetching user data:", error);
        return {
            success: false,
            data: null,
            message: "Error checking user existence"
        };
    }
}

async registerInstructor( email: string,
    profileData: {
        dob: string;
        gender: string;
        phone: string;
        address: string; 
    },
    instructorData: {
        qualification: string;
      }
) {
    try {
      const user = await this._userRepository.findByQuery({ email : email});
      if (!user) {
        return { success: false, message: "User not found", data: null };
      }
      if (user.role !== "instructor") {
        return { success: false, message: "User is not an instructor", data: null };
      }

      user.profile = {
        ...user.profile,
        dob: profileData.dob,
        gender: profileData.gender as "male" | "female" | "other",
        phone: profileData.phone,
        address: profileData.address,
      };

      user.qualification = instructorData.qualification;
      user.isRequested = true;

      const updatedUser = await user.save();
      return {
        success: true,
        message: "Instructor data updated successfully",
        data: {
          name: updatedUser.name,
          email: updatedUser.email,
          profile: updatedUser.profile,
          qualification: updatedUser.qualification,
          isRequested: updatedUser.isRequested,
          role: updatedUser.role,
          isApproved: updatedUser.isApproved,
          isRejected: updatedUser.isRejected
        },
      };
    } catch (error) {
        console.error("Error in registerInstructor service:", error);
      return { success: false, message: "Failed to register instructor", data: null };
    }
}

    

}










