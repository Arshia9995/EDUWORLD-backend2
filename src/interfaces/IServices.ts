import { IResponse } from "./IResponse";
import { UserDoc } from "./IUser";

export interface IUserService {
    signUp(user: UserDoc): Promise<IResponse>;
    verifyUser(otp: string, email: string): Promise<IResponse>;
    loginUser(email: string, password: string): Promise<IResponse>; 
    resendOtp(email: string): Promise<IResponse>;
    forgotPassword(email: string): Promise<IResponse>; 
    forgotOtpVerify(email: string, otp: string): Promise<IResponse>;
   resetPassword (
        email: string,
        password: { newPassword: string; confirmPassword: string }
      ): Promise<IResponse>;
      updateProfile(email: string, userData: UserDoc): Promise<IResponse>;
      isExist(id: string):Promise<IResponse>;
      registerInstructor(
        email: string,
        profileData: {
          dob: string;
          gender: string;
          phone: string;
          address: string;
        },
        instructorData: {
          qualification: string;
        }
      ): Promise<IResponse>;
      
}

export interface IAdminService {
    adminLogin(email: string, password: string): Promise<IResponse>;
    getAllStudents(): Promise<IResponse>;
    blockUser(userId: string): Promise<IResponse>;      // New method
    unblockUser(userId: string): Promise<IResponse>;
    getAllInstructors(): Promise<IResponse>;
    approveInstructor(instructorId: string): Promise<IResponse>;
    rejectInstructor(instructorId: string): Promise<IResponse>;
}